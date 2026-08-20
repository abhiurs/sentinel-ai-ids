from pathlib import Path
import joblib

from feature_extractor import FeatureExtractor

models_path = Path(__file__).resolve().parents[1] / "models" / "CICIDS2017"

feature_names = joblib.load(models_path / "feature_names.pkl")


class DummyFlow:

    start_time = 1000.0
    last_seen = 1001.0

    protocol = "TCP"

    total_packets = 4
    total_bytes = 4000

    forward_packets = 2
    backward_packets = 2

    forward_bytes = 2000
    backward_bytes = 2000

    forward_lengths = [1000, 1000]

    backward_lengths = [1000, 1000]

    packet_lengths = [1000, 1000, 1000, 1000]

    packet_times = [1000.0, 1000.2, 1000.5, 1001.0]

    forward_times = [1000.0, 1000.5]

    backward_times = [1000.2, 1001.0]

    forward_header_lengths = [40, 40]

    backward_header_lengths = [40, 40]

    forward_payload_lengths = [960, 960]

    backward_payload_lengths = [960, 960]

    fin_count = 0
    syn_count = 1
    rst_count = 0
    psh_count = 0
    ack_count = 2
    urg_count = 0
    ece_count = 0
    cwe_count = 0

    init_fwd_win = 65535
    init_bwd_win = 65535


flow = DummyFlow()

extractor = FeatureExtractor()

features = extractor.extract(flow)

print("\nGenerated features:", len(features))

print("Expected features:", len(feature_names))

missing = [name for name in feature_names if name not in features]

extra = [name for name in features if name not in feature_names]

print("\nMissing features:", missing)

print("Extra features:", extra)

print("\nFeature order compatible:", list(features.keys()) == list(feature_names))

print("\nAll expected features present:", len(missing) == 0)
