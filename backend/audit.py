import hashlib
import json
import os
import time
from typing import Any, Dict, List


AUDIT_FILE = os.getenv(
    "GROWTHLOOP_AUDIT_FILE",
    "growthloop_audit.jsonl"
)


class AuditLogger:
    """
    Append-only, tamper-evident audit logger.

    Every event contains the SHA-256 hash of the previous event.

    Therefore:

        Event N
           ↓
        hash
           ↓
        Event N+1

    Any modification to an earlier event breaks the chain.
    """

    def __init__(self, filepath: str = AUDIT_FILE):
        self.filepath = filepath

        if not os.path.exists(self.filepath):
            open(
                self.filepath,
                "a",
                encoding="utf-8"
            ).close()

    def _read_events(self) -> List[Dict[str, Any]]:
        events = []

        try:
            with open(
                self.filepath,
                "r",
                encoding="utf-8"
            ) as file:

                for line in file:
                    line = line.strip()

                    if line:
                        events.append(
                            json.loads(line)
                        )

        except FileNotFoundError:
            return []

        return events

    def append(
        self,
        event_type: str,
        message: str,
        status: str = "INFO",
        metadata: Dict[str, Any] | None = None
    ) -> Dict[str, Any]:

        events = self._read_events()

        previous_hash = (
            events[-1]["hash"]
            if events
            else "GENESIS"
        )

        event = {
            "event_id": f"evt_{int(time.time() * 1000)}",
            "timestamp": time.strftime(
                "%Y-%m-%dT%H:%M:%S"
            ),
            "type": event_type,
            "message": message,
            "status": status,
            "metadata": metadata or {},
            "previous_hash": previous_hash
        }

        canonical = json.dumps(
            event,
            sort_keys=True,
            separators=(",", ":")
        )

        event_hash = hashlib.sha256(
            canonical.encode("utf-8")
        ).hexdigest()

        event["hash"] = event_hash

        with open(
            self.filepath,
            "a",
            encoding="utf-8"
        ) as file:

            file.write(
                json.dumps(event) + "\n"
            )

        return event

    def recent(self, limit: int = 25):
        events = self._read_events()

        return events[-limit:]

    def verify_chain(self) -> bool:

        events = self._read_events()

        previous_hash = "GENESIS"

        for event in events:

            stored_hash = event.get("hash")

            unsigned_event = dict(event)
            unsigned_event.pop("hash", None)

            canonical = json.dumps(
                unsigned_event,
                sort_keys=True,
                separators=(",", ":")
            )

            calculated_hash = hashlib.sha256(
                canonical.encode("utf-8")
            ).hexdigest()

            if event.get("previous_hash") != previous_hash:
                return False

            if stored_hash != calculated_hash:
                return False

            previous_hash = stored_hash

        return True