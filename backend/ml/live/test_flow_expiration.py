import time

from flow_builder import FlowBuilder


def main():

    print()
    print("=" * 60)
    print("FLOW FINALIZATION TEST")
    print("=" * 60)

    builder = FlowBuilder(inactivity_timeout=2)

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

    # ------------------------------------------------------
    # Add packets
    # ------------------------------------------------------

    builder.update(packet_1)
    builder.update(packet_2)

    print()
    print("Packets added       :", 2)
    print("Active flows        :", builder.count())
    print("Completed flows     :", builder.completed_count())

    # ------------------------------------------------------
    # Wait for inactivity timeout
    # ------------------------------------------------------

    print()
    print("Waiting 2.5 seconds for flow expiration...")

    time.sleep(2.5)

    # ------------------------------------------------------
    # Retrieve completed flows
    # ------------------------------------------------------

    completed = builder.get_completed_flows()

    print()
    print("Completed flows     :", len(completed))
    print("Active flows        :", builder.count())

    # ------------------------------------------------------
    # Validate
    # ------------------------------------------------------

    if len(completed) != 1:

        print()
        print("STATUS: FAILED")
        print("Expected exactly 1 completed flow.")
        return

    flow = completed[0]

    print()
    print("FLOW DETAILS")
    print("-" * 60)

    print("Source              :", flow.src)
    print("Destination         :", flow.dst)
    print("Protocol            :", flow.protocol)
    print("Total packets       :", flow.total_packets)
    print("Total bytes         :", flow.total_bytes)
    print("Forward packets     :", flow.forward_packets)
    print("Backward packets    :", flow.backward_packets)
    print("Flow duration      :", f"{flow.duration:.4f} seconds")
    print("Inactive for       :", f"{flow.inactive_for():.4f} seconds")

    print()
    print("=" * 60)
    print("STATUS: FLOW FINALIZATION TEST PASSED")
    print("=" * 60)


if __name__ == "__main__":
    main()
