#!/usr/bin/env python3
"""
Quick startup script for the API server.
Run this to start the offline AI assistant API.
"""
import sys
import os

print("\n" + "="*70)
print("        OFFLINE AI ASSISTANT - API SERVER STARTUP")
print("="*70 + "\n")

print("[1] Checking prerequisites...")

# Check Python version
print(f"  ✓ Python {sys.version.split()[0]}")

# Check required packages
required_packages = ['fastapi', 'uvicorn', 'pydantic']
missing = []

for pkg in required_packages:
    try:
        __import__(pkg)
        print(f"  ✓ {pkg}")
    except ImportError:
        print(f"  ✗ {pkg} - MISSING")
        missing.append(pkg)

if missing:
    print(f"\n[ERROR] Missing packages: {', '.join(missing)}")
    print(f"\nInstall with: pip install {' '.join(missing)}")
    sys.exit(1)

print("\n[2] Checking port availability...")

try:
    from server_utils import PortManager, print_port_diagnostics
    import config
    
    host = config.API_HOST or "127.0.0.1"
    port = config.API_PORT or 8000
    
    # ✅ Check if port is in use
    if PortManager.is_port_in_use(host, port):
        print(f"  ✗ Port {port} is already in use")
        print_port_diagnostics(host, port)
        
        # Try to find a free port
        print("  Attempting to use next available port...")
        free_port = PortManager.find_free_port(host, port)
        if free_port:
            print(f"  ✓ Found free port: {free_port}")
            port = free_port
        else:
            print(f"  ✗ No free ports available from {port}")
            print("\n  On Windows, kill process using:")
            print(f"    > netstat -ano | findstr :{port}")
            print(f"    > taskkill /PID <PID> /F")
            sys.exit(1)
    else:
        print(f"  ✓ Port {port} is available")

except Exception as e:
    print(f"  [WARNING] Could not check port: {e}")
    # Continue anyway - uvicorn will handle the error

print("\n[3] Starting API server...")
print("-" * 70)

try:
    from api_server import create_app
    import uvicorn
    
    # Load pipeline with proper dependency injection
    print("[✓] Initializing system with dependency injection...")
    from system_initialization import initialize_system
    pipeline = initialize_system()
    print("[✓] Pipeline initialized successfully")
    
    # Create app
    app = create_app(pipeline)
    print("[✓] FastAPI app created")
    
    print("-" * 70)
    print("\n✓ Server is ready!\n")
    print(f"  API URL: http://localhost:{port}")
    print(f"  Docs:    http://localhost:{port}/docs")
    print(f"  Health:  http://localhost:{port}/health")
    print("\n" + "="*70 + "\n")
    
    # ✅ Start server on available port
    try:
        uvicorn.run(
            app,
            host=host,
            port=port,
            log_level="info"
        )
    except OSError as os_error:
        if "10048" in str(os_error) or "Address already in use" in str(os_error):
            print(f"\n[ERROR] Port {port} bind failed")
            print_port_diagnostics(host, port)
            print("\nOn Windows, run these commands to free the port:")
            print(f"  > netstat -ano | findstr :{port}")
            print(f"  > taskkill /PID <PID> /F")
            sys.exit(1)
        else:
            raise

except KeyboardInterrupt:
    print("\n\n[STOP] Server stopped by user")
    sys.exit(0)
except Exception as e:
    print(f"\n[ERROR] {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
