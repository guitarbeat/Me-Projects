import sys
from unittest.mock import MagicMock
import os

# 1. Mock hardware libraries BEFORE any other imports
sys.modules['sounddevice'] = MagicMock()
sys.modules['lgpio'] = MagicMock()
sys.modules['gpiozero'] = MagicMock()
sys.modules['paho.mqtt'] = MagicMock()
sys.modules['paho.mqtt.client'] = MagicMock()

# Mock core modules that might depend on hardware
# We need to simulate the structure of 'core' package
core_mock = MagicMock()
core_mock.config = MagicMock()
# Set default config values expected by server.py
core_mock.config.FLASK_PORT = 5000
core_mock.config.MIC_PREFERENCE = None
core_mock.config.SPEAKER_PREFERENCE = None
core_mock.config.SILENCE_THRESHOLD = 1000
core_mock.config.OPENAI_API_KEY = "mock-key"
core_mock.config.OPENAI_MODEL = "gpt-4o-mini"
core_mock.config.VOICE = "alloy"
core_mock.config.BILLY_MODEL = "modern"
core_mock.config.MIC_TIMEOUT_SECONDS = 5
core_mock.config.MQTT_HOST = "localhost"
core_mock.config.MQTT_PORT = 1883
core_mock.config.MQTT_USERNAME = ""
core_mock.config.MQTT_PASSWORD = ""
core_mock.config.HA_HOST = ""
core_mock.config.HA_TOKEN = ""
core_mock.config.HA_LANG = "en"
core_mock.config.RUN_MODE = "normal"


core_mock.movements = MagicMock()
core_mock.wakeup = MagicMock()

# Inject into sys.modules
sys.modules['core'] = core_mock
sys.modules['core.config'] = core_mock.config
sys.modules['core.movements'] = core_mock.movements
sys.modules['core.wakeup'] = core_mock.wakeup

# Mock subprocess to prevent actual system calls
import subprocess
original_check_output = subprocess.check_output
original_check_call = subprocess.check_call
original_run = subprocess.run
original_Popen = subprocess.Popen

def mock_check_output(args, **kwargs):
    cmd = args if isinstance(args, list) else args.split()
    cmd_str = " ".join(cmd)

    if 'git' in cmd_str:
        if 'describe' in cmd_str: return b"v1.0.0"
        if 'rev-parse' in cmd_str: return b"abcdef"
        if 'remote' in cmd_str: return b"origin https://github.com/example/repo.git"

    if 'systemctl' in cmd_str:
        return b"active"

    if 'hostname' in cmd_str:
        return b"mock-pi"

    if 'amixer' in cmd_str:
        if 'cget' in cmd_str:
            return b": values=8"
        if 'get' in cmd_str and 'PCM' in cmd_str:
            return b"[50%]"
        return b""

    if 'aplay -l' in cmd_str:
        return b"card 0: Headphones [bcm2835 Headphones], device 0: bcm2835 Headphones [bcm2835 Headphones]"

    if 'arecord -l' in cmd_str:
        return b"card 1: Microphone [USB Microphone], device 0: USB Audio [USB Audio]"

    return b""

subprocess.check_output = mock_check_output
subprocess.check_call = MagicMock()
subprocess.run = MagicMock()
subprocess.Popen = MagicMock()

# 2. Import the Flask app
# We need to add the project root to sys.path so server.py can resolve 'core' imports
# (even though we mocked them, existing imports might rely on path structure)
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_dir, ".."))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

# Import the app
try:
    from server import app
except ImportError:
    # If running from repo root
    sys.path.append(os.path.join(os.getcwd(), 'projects/billy-b-assistant/webconfig'))
    from projects.billy_b_assistant.webconfig.server import app

if __name__ == "__main__":
    print("🚀 Starting Mock Server on port 5000...")
    app.run(port=5000, debug=True, use_reloader=False)
