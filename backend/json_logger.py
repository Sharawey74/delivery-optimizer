import json
import os
from datetime import datetime

# Create the storage directory inside backend
LOG_DIR = os.path.join(os.path.dirname(__file__), "json_logs")

if not os.path.exists(LOG_DIR):
    os.makedirs(LOG_DIR)

def append_event_to_json(event_dict, mode):
    """
    Appends the event to a JSON array file classified by mode (demo vs simulation).
    We read the existing array, append the event, and write it back.
    This ensures standard JSON format formatting.
    """
    filename = f"{mode}_logs.json"
    filepath = os.path.join(LOG_DIR, filename)
    
    # Add a real-world timestamp to the log before saving
    event_copy = dict(event_dict)
    event_copy["log_written_at"] = datetime.now().isoformat()
    
    data = []
    if os.path.exists(filepath):
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read().strip()
                if content:
                    data = json.loads(content)
                # If we detect JSON Lines instead of array (from old system), convert it
                if not isinstance(data, list):
                    data = []
        except Exception:
            # Fallback if the file is corrupted JSON lines
            with open(filepath, 'r', encoding='utf-8') as f:
                data = []
                for line in f:
                    try:
                        data.append(json.loads(line))
                    except:
                        pass
                        
    data.append(event_copy)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
