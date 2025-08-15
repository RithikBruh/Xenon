import subprocess
import time

# Use CREATE_NEW_CONSOLE so each runs in its own window
CREATE_NEW_CONSOLE = subprocess.CREATE_NEW_CONSOLE

# Open server.py in a new PowerShell window
subprocess.Popen(
    ["powershell", "-NoExit", "py server.py"],
    creationflags=CREATE_NEW_CONSOLE
)

time.sleep(1)

# Open first client.py
subprocess.Popen(
    ["powershell", "-NoExit", "py client.py"],
    creationflags=CREATE_NEW_CONSOLE
)

time.sleep(0.5)

# Open second client.py
subprocess.Popen(
    ["powershell", "-NoExit", "py client.py"],
    creationflags=CREATE_NEW_CONSOLE
)
