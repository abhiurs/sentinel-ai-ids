import sys
from pathlib import Path
import time

# Add backend directory to Python path
BACKEND_DIR = Path(__file__).resolve().parents[2]

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from ml.live.flow_builder import FlowBuilder
from ml.live.feature_extractor import FeatureExtractor
from ml.prediction.predictor import predict_attack_details


def main():

    print()
    print("=" * 65)
    print("COMPLETED FLOW → CICIDS2017 ML PREDICTION TEST")
    print("=" * 65)

    # ==========================================================
    # 1. Create FlowBuilder
    # ==========================================================

    builder = FlowBuilder(inactivity_timeout=2)

    # ==========================================================
    # 2. Simulated packet 1 - forward
    # ==========================================================

    packet_1 = {
        "src": "192.168.1.10",
        "dst": "8.8.8.8",
        "src_port": 51500,
        "dst_port": 443,
        "protocol": "TCP",
        "length": 120,
        "ip_header_length": 20,
        "transport_header_length": 20,
        "payload_length": 80,
        "window": 65535,
        "syn": 1,
        "ack": 0,
        "fin": 0,
        "rst": 0,
        "psh": 0,
        "urg": 0,
        "ece": 0,
        "cwr": 0,
    }

    # ==========================================================
    # 3. Simulated packet 2 - backward
    # ==========================================================

    packet_2 = {
        "src": "8.8.8.8",
        "dst": "192.168.1.10",
        "src_port": 443,
        "dst_port": 51500,
        "protocol": "TCP",
        "length": 300,
        "ip_header_length": 20,
        "transport_header_length": 20,
        "payload_length": 260,
        "window": 65535,
        "syn": 0,
        "ack": 1,
        "fin": 0,
        "rst": 0,
        "psh": 1,
        "urg": 0,
        "ece": 0,
        "cwr": 0,
    }

    # ==========================================================
    # 4. Add packets to FlowBuilder
    # ==========================================================

    builder.update(packet_1)
    builder.update(packet_2)

    print()
    print("Packets processed :", 2)
    print("Active flows      :", builder.count())

    # ==========================================================
    # 5. Wait for flow to become inactive
    # ==========================================================

    print()
    print("Waiting for flow completion...")

    time.sleep(2.5)

    # ==========================================================
    # 6. Retrieve completed flow
    # ==========================================================

    completed_flows = builder.get_completed_flows()

    print()
    print("Completed flows   :", len(completed_flows))

    if not completed_flows:

        print()
        print("ERROR: No completed flow was returned.")
        print("STATUS: FAILED")
        return

    # Process the first completed flow
    flow = completed_flows[0]

    # ==========================================================
    # 7. Display flow information
    # ==========================================================

    print()
    print("-" * 65)
    print("COMPLETED FLOW")
    print("-" * 65)

    print("Source            :", flow.src)
    print("Destination       :", flow.dst)
    print("Protocol          :", flow.protocol)
    print("Forward packets   :", flow.forward_packets)
    print("Backward packets  :", flow.backward_packets)
    print("Total packets     :", flow.total_packets)
    print("Total bytes       :", flow.total_bytes)

    # ==========================================================
    # 8. Extract CICIDS2017 features
    # ==========================================================

    extractor = FeatureExtractor()

    features = extractor.extract(flow)

    print()
    print("-" * 65)
    print("FEATURE EXTRACTION")
    print("-" * 65)

    print("Dataset           : CICIDS2017")
    print("Generated features:", len(features))
    print("Expected features :", 77)

    if len(features) != 77:

        print()
        print("ERROR: Feature count mismatch.")
        print("STATUS: FAILED")
        return

    # ==========================================================
    # 9. Run CICIDS2017 XGBoost
    # ==========================================================

    print()
    print("-" * 65)
    print("MACHINE LEARNING PREDICTION")
    print("-" * 65)

    try:

        result = predict_attack_details(
            features,
            "CICIDS2017",
            "XGBoost",
        )

    except Exception as error:

        print()
        print("PREDICTION ERROR")
        print(type(error).__name__, ":", error)

        print()
        print("STATUS: FAILED")
        return

    # ==========================================================
    # 10. Display prediction
    # ==========================================================

    prediction = result.get("prediction", "Unknown")

    confidence = result.get("confidence")

    print("Model             : XGBoost")
    print("Prediction        :", prediction)

    if confidence is not None:

        print("Confidence        :", f"{confidence * 100:.2f}%")

    else:

        print("Confidence        : Not available")

    # ==========================================================
    # 11. Final status
    # ==========================================================

    print()
    print("=" * 65)
    print("COMPLETED FLOW → CICIDS2017 ML PIPELINE TEST PASSED")
    print("=" * 65)
    print()


if __name__ == "__main__":
    main()
