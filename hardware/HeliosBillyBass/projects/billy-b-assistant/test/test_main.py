import unittest
from unittest.mock import patch, MagicMock
import os
from pathlib import Path
import sys

# Mock hardware-related modules before they're imported by other modules
sys.modules['sounddevice'] = MagicMock()
sys.modules['lgpio'] = MagicMock()
sys.modules['gpiozero'] = MagicMock()

from main import ensure_env_file

class TestMain(unittest.TestCase):
    def setUp(self):
        self.project_root = Path(__file__).parent.parent
        self.env_path = self.project_root / ".env"
        self.env_example_path = self.project_root / ".env.example"

        # Ensure we have a .env.example to copy from
        if not self.env_example_path.exists():
            self.env_example_path.touch()
            self.created_example = True
        else:
            self.created_example = False

        # Clean up any pre-existing .env file
        if self.env_path.exists():
            self.env_path.unlink()

    def tearDown(self):
        # Clean up the created .env file
        if self.env_path.exists():
            self.env_path.unlink()

        # Clean up the created .env.example file
        if self.created_example:
            self.env_example_path.unlink()

    def test_ensure_env_file_creates_in_project_root(self):
        """
        Test that ensure_env_file creates .env in the project root,
        even when run from a different directory.
        """
        ensure_env_file()
        self.assertTrue(self.env_path.exists(), ".env file was not created in the project root")
