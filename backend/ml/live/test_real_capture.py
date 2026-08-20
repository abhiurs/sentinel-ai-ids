import time

from ml.live.packet_capture import live_capture


def main():

    print()
    print("=" * 65)
    print("REAL PACKET → LIVE ML PIPELINE TEST")
    print("=" * 65)

    print()
    print("Starting live packet capture...")

    started = live_capture.start()

    print("Capture started :", started)

    if not started:
        print("STATUS: FAILED")
        return

    print()
    print("Generate some network traffic now.")
    print("You can:")
    print("  - Open a few websites")
    print("  - Run ping 8.8.8.8")
    print("  - Browse normally for about 10-15 seconds")
    print()
    print("Waiting for real packets...")

    # Allow real packets to be captured
    time.sleep(15)

    print()
    print("Stopping capture...")

    live_capture.stop()

    # Give the processing thread a moment to finish
    time.sleep(2)

    print()
    print("-" * 65)
    print("LIVE CAPTURE STATUS")
    print("-" * 65)

    status = live_capture.status()

    print("Running         :", status["running"])
    print("Captured packets:", status["captured_packets"])
    print("Active flows    :", status["active_flows"])
    print("ML detections   :", status["detections"])

    print()

    detections = live_capture.get_detections()

    if detections:

        print("-" * 65)
        print("ML DETECTIONS")
        print("-" * 65)

        for detection in detections[:10]:

            print()
            print("Time        :", detection["time"])
            print("Source      :", detection["source"])
            print("Destination :", detection["destination"])
            print("Protocol    :", detection["protocol"])
            print("Packets     :", detection["packets"])
            print("Prediction  :", detection["prediction"])
            print("Confidence  :", f"{detection['confidence'] * 100:.2f}%")
            print("Model       :", detection["model"])
            print("Dataset     :", detection["dataset"])

    else:

        print("No completed flows produced an ML prediction yet.")

    print()
    print("=" * 65)
    print("REAL CAPTURE TEST COMPLETE")
    print("=" * 65)
    print()


if __name__ == "__main__":
    main()
