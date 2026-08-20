import time
import threading


class NetworkFlow:
    """
    Represents one bidirectional network flow.

    The flow stores the statistics required by the
    CICIDS2017 live feature extractor.
    """

    def __init__(self, src, dst, src_port, dst_port, protocol):

        self.src = src
        self.dst = dst

        self.src_port = src_port
        self.dst_port = dst_port

        self.protocol = protocol

        self.start_time = time.time()
        self.last_seen = self.start_time

        # ======================================================
        # General packet statistics
        # ======================================================

        self.forward_packets = 0
        self.backward_packets = 0

        self.forward_bytes = 0
        self.backward_bytes = 0

        self.total_packets = 0
        self.total_bytes = 0

        # ======================================================
        # Packet lengths
        # ======================================================

        self.forward_lengths = []
        self.backward_lengths = []

        self.packet_lengths = []

        # ======================================================
        # Packet timestamps
        # ======================================================

        self.packet_times = []

        self.forward_times = []
        self.backward_times = []

        # ======================================================
        # Header lengths
        # ======================================================

        self.forward_header_lengths = []
        self.backward_header_lengths = []

        # ======================================================
        # Payload lengths
        # ======================================================

        self.forward_payload_lengths = []
        self.backward_payload_lengths = []

        # ======================================================
        # TCP flags
        # ======================================================

        self.fin_count = 0
        self.syn_count = 0
        self.rst_count = 0
        self.psh_count = 0
        self.ack_count = 0
        self.urg_count = 0
        self.ece_count = 0
        self.cwe_count = 0

        # ======================================================
        # Initial TCP window sizes
        # ======================================================

        self.init_fwd_win = 0
        self.init_bwd_win = 0

    # ==========================================================
    # UPDATE FLOW
    # ==========================================================

    def update(self, packet, forward=True):

        now = time.time()

        self.last_seen = now

        # ------------------------------------------------------
        # Basic packet information
        # ------------------------------------------------------

        length = int(packet.get("length", 0))

        ip_header_length = int(packet.get("ip_header_length", 0))

        transport_header_length = int(packet.get("transport_header_length", 0))

        header_length = ip_header_length + transport_header_length

        payload_length = int(
            packet.get("payload_length", max(length - header_length, 0))
        )

        # ------------------------------------------------------
        # General statistics
        # ------------------------------------------------------

        self.total_packets += 1
        self.total_bytes += length

        self.packet_lengths.append(length)
        self.packet_times.append(now)

        # ------------------------------------------------------
        # Forward direction
        # ------------------------------------------------------

        if forward:

            self.forward_packets += 1
            self.forward_bytes += length

            self.forward_lengths.append(length)
            self.forward_times.append(now)

            self.forward_header_lengths.append(header_length)

            self.forward_payload_lengths.append(payload_length)

            # Initial forward TCP window
            if self.init_fwd_win == 0:

                self.init_fwd_win = int(packet.get("window", 0))

        # ------------------------------------------------------
        # Backward direction
        # ------------------------------------------------------

        else:

            self.backward_packets += 1
            self.backward_bytes += length

            self.backward_lengths.append(length)
            self.backward_times.append(now)

            self.backward_header_lengths.append(header_length)

            self.backward_payload_lengths.append(payload_length)

            # Initial backward TCP window
            if self.init_bwd_win == 0:

                self.init_bwd_win = int(packet.get("window", 0))

        # ------------------------------------------------------
        # TCP flags
        # ------------------------------------------------------

        self.fin_count += int(packet.get("fin", 0))

        self.syn_count += int(packet.get("syn", 0))

        self.rst_count += int(packet.get("rst", 0))

        self.psh_count += int(packet.get("psh", 0))

        self.ack_count += int(packet.get("ack", 0))

        self.urg_count += int(packet.get("urg", 0))

        self.ece_count += int(packet.get("ece", 0))

        self.cwe_count += int(packet.get("cwr", 0))

        return self

    # ==========================================================
    # FLOW DURATION
    # ==========================================================

    @property
    def duration(self):

        return max(self.last_seen - self.start_time, 0.0)

    # ==========================================================
    # INACTIVITY
    # ==========================================================

    def inactive_for(self):

        return max(time.time() - self.last_seen, 0.0)


class FlowBuilder:
    """
    Builds bidirectional network flows from parsed packets.

    A flow is considered completed when no new packet belonging
    to that flow has been observed for the configured timeout.
    """

    DEFAULT_TIMEOUT = 5.0

    def __init__(self, inactivity_timeout=None):

        self.flows = {}

        self.lock = threading.Lock()

        self.inactivity_timeout = (
            float(inactivity_timeout)
            if inactivity_timeout is not None
            else self.DEFAULT_TIMEOUT
        )

        # Completed flows waiting for ML processing
        self.completed_flows = []

    # ==========================================================
    # BIDIRECTIONAL FLOW KEY
    # ==========================================================

    def get_flow_key(self, packet):

        src = packet.get("src")
        dst = packet.get("dst")

        src_port = int(packet.get("src_port", 0))

        dst_port = int(packet.get("dst_port", 0))

        protocol = packet.get("protocol", "Unknown")

        endpoint_a = (src, src_port)

        endpoint_b = (dst, dst_port)

        # Sort endpoints so that traffic in either direction
        # belongs to the same bidirectional flow.
        ordered_endpoints = tuple(sorted([endpoint_a, endpoint_b]))

        return (ordered_endpoints[0], ordered_endpoints[1], protocol)

    # ==========================================================
    # UPDATE FLOW
    # ==========================================================

    def update(self, packet):

        key = self.get_flow_key(packet)

        src = packet.get("src")
        dst = packet.get("dst")

        src_port = int(packet.get("src_port", 0))
        dst_port = int(packet.get("dst_port", 0))

        protocol = packet.get("protocol", "Unknown")

        with self.lock:

            if key not in self.flows:

                self.flows[key] = NetworkFlow(
                    src,
                    dst,
                    src_port,
                    dst_port,
                    protocol,
                )

            flow = self.flows[key]

            forward = (
                src == flow.src
                and dst == flow.dst
                and src_port == flow.src_port
                and dst_port == flow.dst_port
            )

            flow.update(packet, forward=forward)

            return flow

    # ==========================================================
    # EXPIRE INACTIVE FLOWS
    # ==========================================================

    def expire_flows(self, timeout=None):

        timeout = float(timeout) if timeout is not None else self.inactivity_timeout

        now = time.time()

        with self.lock:

            expired_keys = []

            for key, flow in self.flows.items():

                if now - flow.last_seen >= timeout:

                    expired_keys.append(key)

            expired_flows = []

            for key in expired_keys:

                flow = self.flows.pop(key)

                expired_flows.append(flow)

            if expired_flows:

                self.completed_flows.extend(expired_flows)

            return expired_flows

    # ==========================================================
    # GET COMPLETED FLOWS
    # ==========================================================

    def get_completed_flows(self):

        self.expire_flows()

        with self.lock:
            flows = list(self.completed_flows)
            self.completed_flows.clear()

        return flows

    # ==========================================================
    # GET ACTIVE FLOWS
    # ==========================================================

    def get_active_flows(self):

        with self.lock:
            return list(self.flows.values())

    # ==========================================================
    # GET ACTIVE + EXPIRE
    # ==========================================================

    def get_active_flows_with_expiration(self):

        self.expire_flows()

        with self.lock:
            return list(self.flows.values())

    # ==========================================================
    # CLEAR
    # ==========================================================

    def clear(self):

        with self.lock:
            self.flows.clear()
            self.completed_flows.clear()

    # ==========================================================
    # COUNT ACTIVE FLOWS
    # ==========================================================

    def count(self):

        with self.lock:
            return len(self.flows)

    # ==========================================================
    # COUNT COMPLETED FLOWS
    # ==========================================================

    def completed_count(self):

        with self.lock:
            return len(self.completed_flows)
