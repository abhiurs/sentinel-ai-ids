from scapy.all import sniff

from packet_parser import parse_packet

print("=" * 60)
print(" Sentinel AI - Live Packet Capture Test")
print("=" * 60)
print("Capturing 10 packets...")
print("Generate some internet traffic (open Chrome, Google, YouTube, etc.)")
print()


def packet_callback(packet):
    parsed = parse_packet(packet)

    print("-" * 60)
    print(f"Time      : {parsed['time']}")
    print(f"Source    : {parsed['src']}")
    print(f"Destination: {parsed['dst']}")
    print(f"Protocol  : {parsed['protocol']}")
    print(f"Length    : {parsed['length']}")
    print(f"Info      : {parsed['info']}")


sniff(
    prn=packet_callback,
    count=10,
    store=False,
)

print()
print("Capture Complete!")
