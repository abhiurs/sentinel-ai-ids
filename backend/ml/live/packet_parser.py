from datetime import datetime

from scapy.layers.inet import IP, TCP, UDP, ICMP
from scapy.layers.inet6 import IPv6


def identify_service(ip):
    if not isinstance(ip, str) or not ip or ip == "Unknown":
        return "Unknown"

    if (
        ip.startswith("142.250.")
        or ip.startswith("142.251.")
        or ip.startswith("172.217.")
    ):
        return "Google"

    if ip.startswith("20.") or ip.startswith("40."):
        return "Microsoft"

    if ip.startswith("104.") or ip.startswith("172.64."):
        return "Cloudflare"

    if ip.startswith("140.82."):
        return "GitHub"

    return "Unknown"


def parse_packet(packet):

    try:
        packet_length = len(packet)
    except Exception:
        packet_length = 0

    try:

        packet_data = {
            "time": datetime.now().strftime("%H:%M:%S"),
            "src": "Unknown",
            "dst": "Unknown",
            "src_port": 0,
            "dst_port": 0,
            "protocol": "Unknown",
            "application": "Unknown",
            "length": packet_length,
            "info": "Captured Packet",
            "service": "Unknown",
            # Header / payload information
            "ip_header_length": 0,
            "transport_header_length": 0,
            "payload_length": 0,
            # TCP flags
            "fin": 0,
            "syn": 0,
            "rst": 0,
            "psh": 0,
            "ack": 0,
            "urg": 0,
            "ece": 0,
            "cwr": 0,
            # TCP window
            "window": 0,
        }

    except Exception as e:
        print(f"[Packet Parse Error] {e}")

        return {
            "time": datetime.now().strftime("%H:%M:%S"),
            "src": "Unknown",
            "dst": "Unknown",
            "src_port": 0,
            "dst_port": 0,
            "protocol": "Unknown",
            "application": "Unknown",
            "length": len(packet),
            "info": "Malformed/Unsupported Packet",
            "service": "Unknown",
            "ip_header_length": 0,
            "transport_header_length": 0,
            "payload_length": 0,
            "fin": 0,
            "syn": 0,
            "rst": 0,
            "psh": 0,
            "ack": 0,
            "urg": 0,
            "ece": 0,
            "cwr": 0,
            "window": 0,
        }

    # ==========================================================
    # IP
    # ==========================================================

    if packet.haslayer(IP):

        ip = packet[IP]

        packet_data["src"] = ip.src
        packet_data["dst"] = ip.dst

        packet_data["ip_header_length"] = int(ip.ihl) * 4 if ip.ihl else 20

    elif packet.haslayer(IPv6):

        ip = packet[IPv6]

        packet_data["src"] = ip.src
        packet_data["dst"] = ip.dst

        # IPv6 base header
        packet_data["ip_header_length"] = 40

    packet_data["service"] = identify_service(packet_data["dst"])

    # ==========================================================
    # TCP
    # ==========================================================

    if packet.haslayer(TCP):

        tcp = packet[TCP]

        packet_data["protocol"] = "TCP"

        packet_data["src_port"] = int(tcp.sport)
        packet_data["dst_port"] = int(tcp.dport)

        packet_data["transport_header_length"] = (
            int(tcp.dataofs) * 4 if tcp.dataofs else 20
        )

        packet_data["window"] = int(getattr(tcp, "window", 0))

        packet_data["fin"] = int(bool(tcp.flags.F))
        packet_data["syn"] = int(bool(tcp.flags.S))
        packet_data["rst"] = int(bool(tcp.flags.R))
        packet_data["psh"] = int(bool(tcp.flags.P))
        packet_data["ack"] = int(bool(tcp.flags.A))
        packet_data["urg"] = int(bool(tcp.flags.U))
        packet_data["ece"] = int(bool(tcp.flags.E))
        packet_data["cwr"] = int(bool(tcp.flags.C))

        if packet_data["src_port"] == 80 or packet_data["dst_port"] == 80:
            packet_data["application"] = "HTTP"
            packet_data["info"] = "HTTP Traffic"

        elif packet_data["src_port"] == 443 or packet_data["dst_port"] == 443:
            packet_data["application"] = "HTTPS"
            packet_data["info"] = "HTTPS Traffic"

        elif packet_data["src_port"] == 22 or packet_data["dst_port"] == 22:
            packet_data["application"] = "SSH"
            packet_data["info"] = "SSH Traffic"

        elif packet_data["src_port"] == 21 or packet_data["dst_port"] == 21:
            packet_data["application"] = "FTP"
            packet_data["info"] = "FTP Traffic"

        else:
            packet_data["application"] = "TCP"
            packet_data["info"] = "TCP Connection"

    # ==========================================================
    # UDP
    # ==========================================================

    elif packet.haslayer(UDP):

        udp = packet[UDP]

        packet_data["protocol"] = "UDP"

        packet_data["src_port"] = int(udp.sport)
        packet_data["dst_port"] = int(udp.dport)

        packet_data["transport_header_length"] = 8

        if packet_data["src_port"] == 53 or packet_data["dst_port"] == 53:
            packet_data["application"] = "DNS"
            packet_data["info"] = "DNS Query"

        else:
            packet_data["application"] = "UDP"
            packet_data["info"] = "UDP Packet"

    # ==========================================================
    # ICMP
    # ==========================================================

    elif packet.haslayer(ICMP):

        packet_data["protocol"] = "ICMP"
        packet_data["application"] = "ICMP"
        packet_data["info"] = "Ping Packet"

    # ==========================================================
    # PAYLOAD
    # ==========================================================

    header_length = (
        packet_data["ip_header_length"] + packet_data["transport_header_length"]
    )

    packet_data["payload_length"] = max(len(packet) - header_length, 0)

    return packet_data
