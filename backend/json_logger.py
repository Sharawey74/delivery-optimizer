import json
import os
from datetime import datetime

# Create the storage directory inside backend
LOG_DIR = os.path.join(os.path.dirname(__file__), "json_logs")

if not os.path.exists(LOG_DIR):
    os.makedirs(LOG_DIR)

def append_event_to_json(event_dict, mode):
    """
    Appends the event to a JSON Lines file classified by mode (demo vs simulation).
    Using JSON Lines (one JSON object per line) ensures fast O(1) writes without 
    having to read and rewrite massive arrays every time a disruption happens.
    """
    filename = f"{mode}_logs.json"
    filepath = os.path.join(LOG_DIR, filename)
    
    # Add a real-world timestamp to the log before saving
    event_copy = dict(event_dict)
    event_copy["log_written_at"] = datetime.now().isoformat()
    
    # Append to the correct file based on the current mode
    with open(filepath, 'a', encoding='utf-8') as f:
        f.write(json.dumps(event_copy) + "\n")
