import sys
from pathlib import Path

# Add backend directory to Python path
BACKEND_DIR = Path(__file__).resolve().parents[2]

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from ml.live.flow_builder import FlowBuilder
from ml.live.feature_extractor import FeatureExtractor
from ml.prediction.predictor import predict_attack_details


def create_test_packets():

    packets = [
        {
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
        },
        {
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
        },
        {
            "src": "192.168.1.10",
            "dst": "8.8.8.8",
            "src_port": 51500,
            "dst_port": 443,
            "protocol": "TCP",
            "length": 180,
            "ip_header_length": 20,
            "transport_header_length": 20,
            "payload_length": 140,
            "window": 65535,
            "syn": 0,
            "ack": 1,
            "fin": 0,
            "rst": 0,
            "psh": 1,
            "urg": 0,
            "ece": 0,
            "cwr": 0,
        },
    ]

    return packets


def main():

    print()
    print("=" * 60)
    print("LIVE CICIDS2017 FEATURE → ML PREDICTION TEST")
    print("=" * 60)

    # ---------------------------------------------------------
    # Create flow builder
    # ---------------------------------------------------------

    flow_builder = FlowBuilder()

    # ---------------------------------------------------------
    # Generate test packets
    # ---------------------------------------------------------

    packets = create_test_packets()

    # ---------------------------------------------------------
    # Feed packets into flow builder
    # ---------------------------------------------------------

    for packet in packets:

        flow_builder.update(packet)

    print()
    print("Packets processed :", len(packets))
    print("Active flows      :", flow_builder.count())

    # ---------------------------------------------------------
    # Get flow
    # ---------------------------------------------------------

    flows = flow_builder.get_active_flows()

    if not flows:

        print()
        print("ERROR: No flow was created.")
        return

    flow = flows[0]

    print()
    print("Flow created successfully")
    print("Source            :", flow.src)
    print("Destination       :", flow.dst)
    print("Protocol          :", flow.protocol)
    print("Total packets     :", flow.total_packets)
    print("Total bytes       :", flow.total_bytes)

    # ---------------------------------------------------------
    # Extract CICIDS2017 features
    # ---------------------------------------------------------

    extractor = FeatureExtractor()

    features = extractor.extract(flow)

    print()
    print("Feature extraction completed")
    print("Generated features:", len(features))

    # ---------------------------------------------------------
    # Check CICIDS2017 feature count
    # ---------------------------------------------------------

    if len(features) != 77:

        print()
        print("ERROR: Expected 77 CICIDS2017 features.")
        print("Received:", len(features))
        return

    print("Expected features :", 77)

    # ---------------------------------------------------------
    # Run ML prediction
    # ---------------------------------------------------------

    try:

        result = predict_attack_details(
            features,
            "CICIDS2017",
            "XGBoost",
        )

    except Exception as error:

        print()
        print("PREDICTION ERROR")
        print(error)
        return

    # ---------------------------------------------------------
    # Display result
    # ---------------------------------------------------------

    print()
    print("=" * 60)
    print("PREDICTION RESULT")
    print("=" * 60)

    print("Dataset    :", "CICIDS2017")
    print("Model      :", "XGBoost")
    print("Features   :", len(features))
    print("Prediction :", result["prediction"])

    if result["confidence"] is not None:

        print("Confidence :", f"{result['confidence'] * 100:.2f}%")

    else:

        print("Confidence : Not available")

    print("=" * 60)

    print()
    print("STATUS: LIVE FEATURE → ML PIPELINE TEST PASSED")
    print()


if __name__ == "__main__":
    main()
