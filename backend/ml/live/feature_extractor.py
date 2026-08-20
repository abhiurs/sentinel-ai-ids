import math
import statistics


class FeatureExtractor:

    # ==========================================================
    # SAFE MEAN
    # ==========================================================

    @staticmethod
    def mean(values):

        if not values:
            return 0.0

        return sum(values) / len(values)

    # ==========================================================
    # SAFE STD
    # ==========================================================

    @staticmethod
    def std(values):

        if len(values) < 2:
            return 0.0

        return statistics.stdev(values)

    # ==========================================================
    # SAFE VARIANCE
    # ==========================================================

    @staticmethod
    def variance(values):

        if len(values) < 2:
            return 0.0

        return statistics.variance(values)

    # ==========================================================
    # IAT VALUES
    #
    # CICIDS2017 represents flow timing values at microsecond
    # scale. Live capture timestamps are seconds.
    # ==========================================================

    @staticmethod
    def iats(timestamps):

        if len(timestamps) < 2:
            return []

        return [
            (timestamps[i] - timestamps[i - 1]) * 1_000_000
            for i in range(1, len(timestamps))
        ]

    # ==========================================================
    # SAFE MIN
    # ==========================================================

    @staticmethod
    def minimum(values):

        return min(values) if values else 0.0

    # ==========================================================
    # SAFE MAX
    # ==========================================================

    @staticmethod
    def maximum(values):

        return max(values) if values else 0.0

    # ==========================================================
    # ACTIVE / IDLE
    #
    # A 1-second inactivity threshold is used as a practical
    # live-flow approximation.
    # ==========================================================

    @staticmethod
    def active_idle_periods(timestamps):

        if len(timestamps) < 2:

            return [], []

        timestamps_us = [t * 1_000_000 for t in timestamps]

        active = []
        idle = []

        active_start = timestamps_us[0]
        previous = timestamps_us[0]

        for current in timestamps_us[1:]:

            gap = current - previous

            if gap > 1_000_000:

                active_duration = previous - active_start

                if active_duration >= 0:
                    active.append(active_duration)

                idle.append(gap)

                active_start = current

            previous = current

        final_active = previous - active_start

        if final_active >= 0:

            active.append(final_active)

        return active, idle

    # ==========================================================
    # MAIN EXTRACTION
    # ==========================================================

    def extract(self, flow):

        # ------------------------------------------------------
        # Duration
        # ------------------------------------------------------

        duration_seconds = max(flow.last_seen - flow.start_time, 0.000001)

        duration_us = duration_seconds * 1_000_000

        # ------------------------------------------------------
        # General packet information
        # ------------------------------------------------------

        total_packets = flow.total_packets

        total_bytes = flow.total_bytes

        fwd_packets = flow.forward_packets

        bwd_packets = flow.backward_packets

        fwd_bytes = flow.forward_bytes

        bwd_bytes = flow.backward_bytes

        fwd_lengths = flow.forward_lengths

        bwd_lengths = flow.backward_lengths

        packet_lengths = flow.packet_lengths

        # ------------------------------------------------------
        # IAT
        # ------------------------------------------------------

        flow_iat = self.iats(flow.packet_times)

        fwd_iat = self.iats(flow.forward_times)

        bwd_iat = self.iats(flow.backward_times)

        # ------------------------------------------------------
        # Packet statistics
        # ------------------------------------------------------

        packet_mean = self.mean(packet_lengths)

        packet_std = self.std(packet_lengths)

        packet_variance = self.variance(packet_lengths)

        packet_min = self.minimum(packet_lengths)

        packet_max = self.maximum(packet_lengths)

        # ------------------------------------------------------
        # Forward statistics
        # ------------------------------------------------------

        fwd_mean = self.mean(fwd_lengths)

        fwd_std = self.std(fwd_lengths)

        fwd_min = self.minimum(fwd_lengths)

        fwd_max = self.maximum(fwd_lengths)

        # ------------------------------------------------------
        # Backward statistics
        # ------------------------------------------------------

        bwd_mean = self.mean(bwd_lengths)

        bwd_std = self.std(bwd_lengths)

        bwd_min = self.minimum(bwd_lengths)

        bwd_max = self.maximum(bwd_lengths)

        # ------------------------------------------------------
        # Flow rates
        # ------------------------------------------------------

        flow_bytes_per_sec = total_bytes / duration_seconds

        flow_packets_per_sec = total_packets / duration_seconds

        fwd_packets_per_sec = fwd_packets / duration_seconds

        bwd_packets_per_sec = bwd_packets / duration_seconds

        # ------------------------------------------------------
        # Direction ratio
        # ------------------------------------------------------

        down_up_ratio = bwd_packets / fwd_packets if fwd_packets > 0 else 0.0

        # ------------------------------------------------------
        # Header lengths
        # ------------------------------------------------------

        fwd_header_length = sum(flow.forward_header_lengths)

        bwd_header_length = sum(flow.backward_header_lengths)

        # ------------------------------------------------------
        # Active / idle
        # ------------------------------------------------------

        active_periods, idle_periods = self.active_idle_periods(flow.packet_times)

        # ------------------------------------------------------
        # Protocol encoding
        # ------------------------------------------------------

        protocol_map = {
            "TCP": 6,
            "UDP": 17,
            "ICMP": 1,
        }

        protocol = protocol_map.get(flow.protocol, 0)

        # ------------------------------------------------------
        # Average packet size
        # ------------------------------------------------------

        avg_packet_size = total_bytes / total_packets if total_packets > 0 else 0.0

        # ------------------------------------------------------
        # Average segment sizes
        # ------------------------------------------------------

        avg_fwd_segment_size = fwd_mean
        avg_bwd_segment_size = bwd_mean

        # ------------------------------------------------------
        # Forward active data packets
        # ------------------------------------------------------

        fwd_act_data_packets = len(flow.forward_payload_lengths)

        # ------------------------------------------------------
        # Minimum forward segment size
        # ------------------------------------------------------

        fwd_seg_size_min = (
            self.minimum(flow.forward_payload_lengths)
            if flow.forward_payload_lengths
            else fwd_min
        )

        # ------------------------------------------------------
        # Active statistics
        # ------------------------------------------------------

        active_mean = self.mean(active_periods)

        active_std = self.std(active_periods)

        active_max = self.maximum(active_periods)

        active_min = self.minimum(active_periods)

        # ------------------------------------------------------
        # Idle statistics
        # ------------------------------------------------------

        idle_mean = self.mean(idle_periods)

        idle_std = self.std(idle_periods)

        idle_max = self.maximum(idle_periods)

        idle_min = self.minimum(idle_periods)

        # ======================================================
        # CICIDS2017 FEATURE VECTOR
        # ======================================================

        features = {
            "Protocol": protocol,
            "Flow Duration": duration_us,
            "Total Fwd Packets": fwd_packets,
            "Total Backward Packets": bwd_packets,
            "Fwd Packets Length Total": fwd_bytes,
            "Bwd Packets Length Total": bwd_bytes,
            "Fwd Packet Length Max": fwd_max,
            "Fwd Packet Length Min": fwd_min,
            "Fwd Packet Length Mean": fwd_mean,
            "Fwd Packet Length Std": fwd_std,
            "Bwd Packet Length Max": bwd_max,
            "Bwd Packet Length Min": bwd_min,
            "Bwd Packet Length Mean": bwd_mean,
            "Bwd Packet Length Std": bwd_std,
            "Flow Bytes/s": flow_bytes_per_sec,
            "Flow Packets/s": flow_packets_per_sec,
            "Flow IAT Mean": self.mean(flow_iat),
            "Flow IAT Std": self.std(flow_iat),
            "Flow IAT Max": self.maximum(flow_iat),
            "Flow IAT Min": self.minimum(flow_iat),
            "Fwd IAT Total": sum(fwd_iat),
            "Fwd IAT Mean": self.mean(fwd_iat),
            "Fwd IAT Std": self.std(fwd_iat),
            "Fwd IAT Max": self.maximum(fwd_iat),
            "Fwd IAT Min": self.minimum(fwd_iat),
            "Bwd IAT Total": sum(bwd_iat),
            "Bwd IAT Mean": self.mean(bwd_iat),
            "Bwd IAT Std": self.std(bwd_iat),
            "Bwd IAT Max": self.maximum(bwd_iat),
            "Bwd IAT Min": self.minimum(bwd_iat),
            "Fwd PSH Flags": 0,
            "Bwd PSH Flags": 0,
            "Fwd URG Flags": 0,
            "Bwd URG Flags": 0,
            "Fwd Header Length": fwd_header_length,
            "Bwd Header Length": bwd_header_length,
            "Fwd Packets/s": fwd_packets_per_sec,
            "Bwd Packets/s": bwd_packets_per_sec,
            "Packet Length Min": packet_min,
            "Packet Length Max": packet_max,
            "Packet Length Mean": packet_mean,
            "Packet Length Std": packet_std,
            "Packet Length Variance": packet_variance,
            "FIN Flag Count": flow.fin_count,
            "SYN Flag Count": flow.syn_count,
            "RST Flag Count": flow.rst_count,
            "PSH Flag Count": flow.psh_count,
            "ACK Flag Count": flow.ack_count,
            "URG Flag Count": flow.urg_count,
            "CWE Flag Count": flow.cwe_count,
            "ECE Flag Count": flow.ece_count,
            "Down/Up Ratio": down_up_ratio,
            "Avg Packet Size": avg_packet_size,
            "Avg Fwd Segment Size": avg_fwd_segment_size,
            "Avg Bwd Segment Size": avg_bwd_segment_size,
            # Bulk statistics require a richer bulk-flow
            # detector. Keep explicit rather than inventing
            # values.
            "Fwd Avg Bytes/Bulk": 0.0,
            "Fwd Avg Packets/Bulk": 0.0,
            "Fwd Avg Bulk Rate": 0.0,
            "Bwd Avg Bytes/Bulk": 0.0,
            "Bwd Avg Packets/Bulk": 0.0,
            "Bwd Avg Bulk Rate": 0.0,
            "Subflow Fwd Packets": fwd_packets,
            "Subflow Fwd Bytes": fwd_bytes,
            "Subflow Bwd Packets": bwd_packets,
            "Subflow Bwd Bytes": bwd_bytes,
            "Init Fwd Win Bytes": flow.init_fwd_win,
            "Init Bwd Win Bytes": flow.init_bwd_win,
            "Fwd Act Data Packets": fwd_act_data_packets,
            "Fwd Seg Size Min": fwd_seg_size_min,
            "Active Mean": active_mean,
            "Active Std": active_std,
            "Active Max": active_max,
            "Active Min": active_min,
            "Idle Mean": idle_mean,
            "Idle Std": idle_std,
            "Idle Max": idle_max,
            "Idle Min": idle_min,
        }

        for key, value in features.items():

            if not isinstance(value, (int, float)):

                features[key] = 0.0

            elif not math.isfinite(float(value)):

                features[key] = 0.0

        return features
