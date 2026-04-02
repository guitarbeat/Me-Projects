import unittest
from unittest.mock import patch, MagicMock, mock_open
import sys
import os
import asyncio

# Mock hardware-related modules before they're imported
sys.modules['sounddevice'] = MagicMock()
sys.modules['lgpio'] = MagicMock()
sys.modules['gpiozero'] = MagicMock()

# Mock mqtt module
sys.modules['core.mqtt'] = MagicMock()

# Now we can import the module under test
from core.audio import load_song_metadata, play_song

class TestAudio(unittest.IsolatedAsyncioTestCase):
    def test_load_song_metadata_default(self):
        """Test loading metadata from a non-existent file returns defaults."""
        metadata = load_song_metadata("non_existent_file.txt")
        self.assertEqual(metadata["bpm"], 120)
        self.assertEqual(metadata["gain"], 1.0)
        self.assertEqual(metadata["head_moves"], [])

    def test_load_song_metadata_valid(self):
        """Test loading metadata from a valid file."""
        content = """gain=0.8
bpm=100
tail_threshold=1200
compensate_tail=0.1
half_tempo_tail_flap=true
head_moves=2.0:1,4.5:0
"""
        with patch("builtins.open", mock_open(read_data=content)):
            with patch("os.path.exists", return_value=True):
                metadata = load_song_metadata("dummy_path")

                self.assertEqual(metadata["gain"], 0.8)
                self.assertEqual(metadata["bpm"], 100.0)
                self.assertEqual(metadata["tail_threshold"], 1200.0)
                self.assertEqual(metadata["compensate_tail"], 0.1)
                self.assertTrue(metadata["half_tempo_tail_flap"])
                self.assertEqual(metadata["head_moves"], [(2.0, 1.0), (4.5, 0.0)])

    @patch("core.audio.wave.open")
    @patch("core.audio.playback_manager")
    @patch("core.audio.ensure_playback_worker_started")
    @patch("core.audio.stop_all_motors")
    @patch("core.mqtt.mqtt_publish")
    @patch("core.audio.playback_queue") # Mock the queue
    async def test_play_song(self, mock_playback_queue, mock_mqtt_publish, mock_stop_motors, mock_ensure_worker, mock_playback_manager, mock_wave_open):
        """Test play_song logic (mocking file I/O and playback)."""

        # Mock wave file objects
        mock_wf = MagicMock()
        mock_wf.getframerate.return_value = 24000
        # Return some frames then empty bytes to simulate end of file
        # We need enough chunks for main, vocals, drums in the first iteration.
        # In the second iteration, main returns empty, but code reads all 3 before checking.
        chunk = b'\x00' * 4 * 100
        mock_wf.readframes.side_effect = [chunk, chunk, chunk, b'', b'', b'']
        mock_wave_open.return_value.__enter__.return_value = mock_wf

        # Mock load_song_metadata to return valid metadata
        with patch("core.audio.load_song_metadata") as mock_load_metadata:
            mock_load_metadata.return_value = {
                "bpm": 120,
                "head_moves": [],
                "tail_threshold": 1500,
                "gain": 1.0,
                "compensate_tail": 0.0,
                "half_tempo_tail_flap": False,
            }

            # Run the async function
            await play_song("test_song")

            # Verify ensure_playback_worker_started was called
            mock_ensure_worker.assert_called()

            # Verify song_mode was set to True then False
            self.assertTrue(mock_playback_manager.song_mode is False)

            # Verify MQTT messages
            mock_mqtt_publish.assert_any_call("billy/state", "playing_song")
            mock_mqtt_publish.assert_any_call("billy/state", "idle")

            # Verify stop_all_motors called
            mock_stop_motors.assert_called()

            # Verify items were put in queue
            self.assertTrue(mock_playback_queue.put.called)

if __name__ == "__main__":
    unittest.main()
