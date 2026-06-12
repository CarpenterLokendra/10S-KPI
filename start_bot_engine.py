#!/usr/bin/env python3
"""
Start the 10S Bot Engine microservice

This script activates the virtual environment and starts the FastAPI bot engine
on port 8001. The bot engine handles all AI decision-making for bot players.

Usage:
    python3 start_bot_engine.py

    Or directly:
    ./start_bot_engine.py
"""

import subprocess
import sys
import os
from pathlib import Path

def main():
    # Get the directory where this script is located
    script_dir = Path(__file__).parent.absolute()
    bot_engine_dir = script_dir / "Bot" / "10S-bot-engine"
    venv_dir = script_dir / "Bot" / "venv"
    python_executable = venv_dir / "bin" / "python"

    # Verify directories exist
    if not bot_engine_dir.exists():
        print(f"❌ Error: Bot engine directory not found at {bot_engine_dir}")
        print("   Make sure you've cloned the 10S-bot-engine repository to Bot/10S-bot-engine/")
        sys.exit(1)

    if not venv_dir.exists():
        print(f"❌ Error: Virtual environment not found at {venv_dir}")
        print("   Please create a virtual environment: python3.11 -m venv Bot/venv")
        sys.exit(1)

    if not python_executable.exists():
        print(f"❌ Error: Python executable not found at {python_executable}")
        sys.exit(1)

    print("=" * 70)
    print("🤖 Starting 10S Bot Engine Microservice")
    print("=" * 70)
    print(f"📁 Bot Engine Directory: {bot_engine_dir}")
    print(f"🐍 Python: {python_executable}")
    print(f"🔌 Port: 8001")
    print(f"🔗 URL: http://localhost:8001")
    print("=" * 70)
    print()

    # Change to bot engine directory
    os.chdir(bot_engine_dir)

    # Start uvicorn with the Python executable from venv
    cmd = [
        str(python_executable),
        "-m",
        "uvicorn",
        "src.main:app",
        "--reload",
        "--port",
        "8001",
        "--host",
        "127.0.0.1"
    ]

    print("💡 Tip: The bot engine will automatically reload when you make changes to the code.")
    print("💡 Press Ctrl+C to stop the server.")
    print()

    try:
        subprocess.run(cmd, check=False)
    except KeyboardInterrupt:
        print("\n\n✅ Bot engine stopped gracefully")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Error starting bot engine: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
