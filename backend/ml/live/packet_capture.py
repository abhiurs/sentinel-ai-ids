import time
from threading import Thread, Lock

from scapy.all import sniff

from .packet_parser import parse_packet
from .packet_store import packet_store
from .flow_builder import FlowBuilder
from .feature_extractor import FeatureExtractor

from ..prediction.predictor import predict_attack_details


class LivePacketCapture:

    # ==========================================================
    # SUPPORTED CICIDS2017 MODELS
    # ==========================================================

    SUPPORTED_MODELS = [
        "Random Forest",
        "Extra Trees",
        "XGBoost",
        "Decision Tree",
        "KNN",
    ]

    # Default model for Auto mode.
    #
    # We are NOT selecting a model based on the predicted attack.
    # Auto mode uses the configured best-performing model.
    #
    # XGBoost is currently the default because that is the model
    # already validated in your working live pipeline.
    AUTO_MODEL = "XGBoost"

    # ==========================================================
    # INITIALIZATION
    # ==========================================================

    def __init__(self):

        self.running = False

        self.flow_builder = FlowBuilder(inactivity_timeout=5)

        self.feature_extractor = FeatureExtractor()

        self.thread = None
        self.processing_thread = None

        self.lock = Lock()

        # ------------------------------------------------------
        # Selected model
        # ------------------------------------------------------
        #
        # "Auto" means use AUTO_MODEL.
        # Otherwise use the exact selected model.
        #
        self.selected_model = "Auto"

        # ------------------------------------------------------
        # Recent ML detections
        # ------------------------------------------------------

        self.detections = []

        self.max_detections = 100

        # ------------------------------------------------------
        # Live ML processing controls
        # ------------------------------------------------------
        #
        # A live IDS must not wait for a connection to terminate
        # before producing a detection. Active flows are therefore
        # evaluated periodically after enough packets are observed.
        #
        self.MIN_ACTIVE_PACKETS = 3
        self.ACTIVE_PREDICTION_INTERVAL = 2.0
        self.ML_LOOP_INTERVAL = 0.50

        # Stable flow key -> last packet count / prediction time.
        self._active_prediction_state = {}

    # ==========================================================
    # MODEL MANAGEMENT
    # ==========================================================

    def get_selected_model(self):

        with self.lock:

            selected_model = self.selected_model

        if selected_model == "Auto":

            return {
                "selected_model": "Auto",
                "model_used": self.AUTO_MODEL,
            }

        return {
            "selected_model": selected_model,
            "model_used": selected_model,
        }

    def set_model(self, model_name):

        if not isinstance(model_name, str):

            return {
                "success": False,
                "message": "Model name must be a string",
            }

        model_name = model_name.strip()

        # ------------------------------------------------------
        # Auto mode
        # ------------------------------------------------------

        if model_name.lower() == "auto":

            with self.lock:

                self.selected_model = "Auto"

            return {
                "success": True,
                "selected_model": "Auto",
                "model_used": self.AUTO_MODEL,
            }

        # ------------------------------------------------------
        # Validate model
        # ------------------------------------------------------

        if model_name not in self.SUPPORTED_MODELS:

            return {
                "success": False,
                "message": (
                    f"Unsupported model: {model_name}. "
                    f"Supported models: "
                    f"{', '.join(self.SUPPORTED_MODELS)}"
                ),
            }

        # ------------------------------------------------------
        # Set model
        # ------------------------------------------------------

        with self.lock:

            self.selected_model = model_name

        return {
            "success": True,
            "selected_model": model_name,
            "model_used": model_name,
        }

    # ==========================================================
    # PACKET CALLBACK
    # ==========================================================

    def _packet_callback(self, packet):

        try:

            parsed_packet = parse_packet(packet)

            # --------------------------------------------------
            # Store packet for UI
            # --------------------------------------------------

            packet_store.add(parsed_packet)

            # --------------------------------------------------
            # Add packet to flow
            # --------------------------------------------------

            with self.lock:

                self.flow_builder.update(parsed_packet)

        except Exception as e:

            print(f"[Packet Parser Error] {e}")

    # ==========================================================
    # LIVE / COMPLETED FLOW PROCESSING
    # ==========================================================

    def _flow_key(self, flow):
        """
        Build a stable identifier for a flow.

        FlowBuilder keeps flows in memory, so we use the flow's
        endpoints + protocol to remember when an active flow was
        last sent to the ML engine.
        """
        return (
            flow.src,
            flow.dst,
            flow.src_port,
            flow.dst_port,
            flow.protocol,
        )

    def _predict_flow(self, flow, stage="live", features=None):
        """
        Extract the 77 CICIDS2017 features and run the selected
        model for one flow.

        The caller may provide a feature snapshot so feature
        extraction can happen while the flow is protected by
        self.lock.
        """

        try:
            if features is None:
                features = self.feature_extractor.extract(flow)

            print(
                "[LIVE] Extracted features:",
                len(features),
            )

            if len(features) != 77:
                print(
                    "[ML Pipeline Error] " f"Expected 77 features, got {len(features)}"
                )
                return None

            model_info = self.get_selected_model()

            selected_model = model_info["selected_model"]
            model_used = model_info["model_used"]

            result = predict_attack_details(
                features,
                "CICIDS2017",
                model_used,
            )

            prediction = result.get("prediction", "Unknown")
            confidence = result.get("confidence", 0)

            try:
                confidence = float(confidence)
            except (TypeError, ValueError):
                confidence = 0.0

            detection = {
                "time": time.strftime("%H:%M:%S"),
                "source": flow.src,
                "destination": flow.dst,
                "src_port": flow.src_port,
                "dst_port": flow.dst_port,
                "protocol": flow.protocol,
                "packets": flow.total_packets,
                "bytes": flow.total_bytes,
                "prediction": prediction,
                "confidence": confidence,
                "model": model_used,
                "model_selection": selected_model,
                "dataset": "CICIDS2017",
                "features": 77,
                "stage": stage,
            }

            with self.lock:
                self.detections.insert(0, detection)
                self.detections = self.detections[: self.max_detections]

            print("\n" + "=" * 60)
            print("LIVE ML DETECTION")
            print("=" * 60)
            print("Stage       :", stage.upper())
            print("Source      :", flow.src)
            print("Destination :", flow.dst)
            print("Protocol    :", flow.protocol)
            print("Packets     :", flow.total_packets)
            print("Prediction  :", prediction)
            print("Confidence  :", f"{confidence * 100:.2f}%")
            print("Model Used  :", model_used)
            print("Selection   :", selected_model)
            print("Dataset     :", "CICIDS2017")
            print("Features    :", 77)
            print("=" * 60)

            return detection

        except Exception as e:
            print("[ML Prediction Error]", e)
            return None

    def _process_completed_flows(self, completed_flows):
        """
        Process flows that have become inactive.

        Feature extraction is performed while self.lock is held so
        the packet thread cannot mutate the same flow halfway
        through feature calculation.
        """

        if not completed_flows:
            return

        print(f"[LIVE] Completed flows ready for ML: " f"{len(completed_flows)}")

        for flow in completed_flows:
            key = self._flow_key(flow)

            with self.lock:
                self._active_prediction_state.pop(key, None)

                features = self.feature_extractor.extract(flow)

                flow_snapshot = {
                    "src": flow.src,
                    "dst": flow.dst,
                    "src_port": flow.src_port,
                    "dst_port": flow.dst_port,
                    "protocol": flow.protocol,
                    "total_packets": flow.total_packets,
                    "total_bytes": flow.total_bytes,
                }

            print(
                "[LIVE] Processing completed flow:",
                flow_snapshot["src"],
                "->",
                flow_snapshot["dst"],
                "| packets:",
                flow_snapshot["total_packets"],
            )

            self._predict_snapshot(
                flow_snapshot,
                features,
                stage="final",
            )

    def _predict_snapshot(self, snapshot, features, stage="live"):
        """
        Run prediction using a stable flow snapshot.

        This prevents the packet-capture thread from changing the
        metadata while the ML model is running.
        """

        try:
            print(
                "[LIVE] Extracted features:",
                len(features),
            )

            if len(features) != 77:
                print(
                    "[ML Pipeline Error] " f"Expected 77 features, got {len(features)}"
                )
                return None

            model_info = self.get_selected_model()

            selected_model = model_info["selected_model"]
            model_used = model_info["model_used"]

            result = predict_attack_details(
                features,
                "CICIDS2017",
                model_used,
            )

            prediction = result.get("prediction", "Unknown")
            confidence = result.get("confidence", 0)

            try:
                confidence = float(confidence)
            except (TypeError, ValueError):
                confidence = 0.0

            detection = {
                "time": time.strftime("%H:%M:%S"),
                "source": snapshot["src"],
                "destination": snapshot["dst"],
                "src_port": snapshot["src_port"],
                "dst_port": snapshot["dst_port"],
                "protocol": snapshot["protocol"],
                "packets": snapshot["total_packets"],
                "bytes": snapshot["total_bytes"],
                "prediction": prediction,
                "confidence": confidence,
                "model": model_used,
                "model_selection": selected_model,
                "dataset": "CICIDS2017",
                "features": 77,
                "stage": stage,
            }

            with self.lock:
                self.detections.insert(0, detection)
                self.detections = self.detections[: self.max_detections]

            print("\n" + "=" * 60)
            print("LIVE ML DETECTION")
            print("=" * 60)
            print("Stage       :", stage.upper())
            print("Source      :", snapshot["src"])
            print("Destination :", snapshot["dst"])
            print("Protocol    :", snapshot["protocol"])
            print("Packets     :", snapshot["total_packets"])
            print("Prediction  :", prediction)
            print("Confidence  :", f"{confidence * 100:.2f}%")
            print("Model Used  :", model_used)
            print("Selection   :", selected_model)
            print("Dataset     :", "CICIDS2017")
            print("Features    :", 77)
            print("=" * 60)

            return detection

        except Exception as e:
            print("[ML Prediction Error]", e)
            return None

    def _process_live_flows(self):
        """
        Process active flows periodically.

        A flow is eligible after a small number of packets and is
        re-evaluated only when enough new packets have arrived and
        the live prediction interval has elapsed.

        This is what makes the ML engine genuinely live instead of
        waiting for every flow to become inactive.
        """

        now = time.time()

        candidates = []

        with self.lock:
            active_flows = self.flow_builder.get_active_flows()

            for flow in active_flows:
                if flow.total_packets < self.MIN_ACTIVE_PACKETS:
                    continue

                key = self._flow_key(flow)

                state = self._active_prediction_state.get(
                    key,
                    {
                        "packets": 0,
                        "time": 0.0,
                    },
                )

                packet_count_changed = flow.total_packets > state["packets"]

                interval_elapsed = (
                    now - state["time"] >= self.ACTIVE_PREDICTION_INTERVAL
                )

                if not packet_count_changed:
                    continue

                if state["time"] != 0.0 and not interval_elapsed:
                    continue

                # Snapshot features + metadata while protected.
                features = self.feature_extractor.extract(flow)

                snapshot = {
                    "src": flow.src,
                    "dst": flow.dst,
                    "src_port": flow.src_port,
                    "dst_port": flow.dst_port,
                    "protocol": flow.protocol,
                    "total_packets": flow.total_packets,
                    "total_bytes": flow.total_bytes,
                }

                self._active_prediction_state[key] = {
                    "packets": flow.total_packets,
                    "time": now,
                }

                candidates.append(
                    (
                        snapshot,
                        features,
                    )
                )

        for snapshot, features in candidates:
            print(
                "[LIVE] Active flow ready for ML:",
                snapshot["src"],
                "->",
                snapshot["dst"],
                "| packets:",
                snapshot["total_packets"],
            )

            self._predict_snapshot(
                snapshot,
                features,
                stage="live",
            )

    def _process_completed_and_live_flows(self):
        """
        Main ML worker.

        1. Expire inactive flows and process them as final flows.
        2. Periodically process sufficiently mature active flows.
        """

        while self.running:
            try:
                with self.lock:
                    completed_flows = self.flow_builder.get_completed_flows()

                self._process_completed_flows(completed_flows)

                self._process_live_flows()

                time.sleep(self.ML_LOOP_INTERVAL)

            except Exception as e:
                print("[Flow Processing Error]", e)
                time.sleep(0.5)

    # ==========================================================
    # SNIFF PACKETS
    # ==========================================================

    def _sniff_packets(self):

        try:
            sniff(
                prn=self._packet_callback,
                store=False,
                stop_filter=lambda x: not self.running,
            )

        except Exception as e:

            print(
                "[Packet Capture Error]",
                e,
            )

        finally:

            with self.lock:
                self.running = False

    # ==========================================================
    # START
    # ==========================================================

    def start(self):

        with self.lock:
            if self.running:
                return False

            self.running = True
            self._active_prediction_state.clear()

        # ------------------------------------------------------
        # Packet capture thread
        # ------------------------------------------------------

        try:

            # --------------------------------------------------
            # Packet capture thread
            # --------------------------------------------------

            self.thread = Thread(
                target=self._sniff_packets,
                daemon=True,
            )

            self.thread.start()

            # --------------------------------------------------
            # Flow / ML processing thread
            # --------------------------------------------------

            self.processing_thread = Thread(
                target=self._process_completed_and_live_flows,
                daemon=True,
            )

            self.processing_thread.start()

        except Exception as e:

            with self.lock:
                self.running = False

            print(
                "[Live Capture Start Error]",
                e,
            )

            return False

        print("✅ Live Packet Capture Started")

        print("✅ CICIDS2017 ML Detection Started")

        print(
            "🤖 Selected Model:",
            self.get_selected_model()["model_used"],
        )

        return True

    # ==========================================================
    # STOP
    # ==========================================================

    def stop(self):

        with self.lock:

            if not self.running:
                return False

            self.running = False

            self._active_prediction_state.clear()

        if self.processing_thread is not None and self.processing_thread.is_alive():
            self.processing_thread.join(timeout=2.0)

        if self.thread is not None and self.thread.is_alive():
            self.thread.join(timeout=2.0)

        print("🛑 Live Packet Capture Stopped")

        return True

    # ==========================================================
    # STATUS
    # ==========================================================

    def status(self):

        with self.lock:

            active_flows = self.flow_builder.count()

            detections = len(self.detections)

            selected_model = self.selected_model

        model_used = self.AUTO_MODEL if selected_model == "Auto" else selected_model

        return {
            "running": self.running,
            "captured_packets": packet_store.count(),
            "active_flows": active_flows,
            "detections": detections,
            "dataset": "CICIDS2017",
            "features": 77,
            "selected_model": selected_model,
            "model_used": model_used,
        }

    # ==========================================================
    # GET DETECTIONS
    # ==========================================================

    def get_detections(self):

        with self.lock:

            return list(self.detections)


# ==============================================================
# GLOBAL CAPTURE INSTANCE
# ==============================================================

live_capture = LivePacketCapture()
