import subprocess
import sys

repo_url = "https://github.com/vedamehar/RentBridge_house-rental-app"

try:
    result = subprocess.run(["git", "ls-remote", repo_url, "HEAD"], capture_output=True, text=True, check=True)
    print("Repository is PUBLIC")
except subprocess.CalledProcessError as e:
    if "Authentication failed" in e.stderr or "could not read Username" in e.stderr:
        print("Repository is PRIVATE")
    else:
        print(f"Error checking repository: {e.stderr}")
except FileNotFoundError:
    print("Error: git command not found")
