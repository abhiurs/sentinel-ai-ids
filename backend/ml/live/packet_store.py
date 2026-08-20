from collections import deque
from threading import Lock


class PacketStore:
    def __init__(self, max_packets=100):
        self._packets = deque(maxlen=max_packets)
        self._lock = Lock()

    def add(self, packet):
        with self._lock:
            self._packets.appendleft(packet)

    def get_all(self):
        with self._lock:
            return list(self._packets)

    def clear(self):
        with self._lock:
            self._packets.clear()

    def count(self):
        with self._lock:
            return len(self._packets)


packet_store = PacketStore()
