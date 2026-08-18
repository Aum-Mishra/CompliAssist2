#!/usr/bin/env python3
"""
Admin System Setup & Test Script

Quick verification that the admin system is ready to run.
"""

import os
import sys
import sqlite3
from pathlib import Path


def check_python_version():
    """Verify Python 3.8+"""
    print("[1/6] Checking Python version...")
    if sys.version_info >= (3, 8):
        print(f"  ✓ Python {sys.version_info.major}.{sys.version_info.minor} OK\n")
        return True
    else:
        print(f"  ✗ Python {sys.version_info.major}.{sys.version_info.minor} (need 3.8+)\n")
        return False


def check_dependencies():
    """Check required packages"""
    print("[2/6] Checking dependencies...")
    
    required = [
        'fastapi',
        'uvicorn',
        'faiss',
        'sentence_transformers',
        'pydantic',
        'requests'
    ]
    
    missing = []
    for package in required:
        try:
            __import__(package)
            print(f"  ✓ {package}")
        except ImportError:
            print(f"  ✗ {package} (missing)")
            missing.append(package)
    
    if missing:
        print(f"\nMissing packages: {', '.join(missing)}")
        print("Install with: pip install -r requirements.txt\n")
        return False
    print()
    return True


def check_folders():
    """Check/create required folders"""
    print("[3/6] Checking folders...")
    
    folders = [
        'Vector_DB',
        'uploads/temp',
        'logs',
        'Data',
        'Internal',
        'Policies',
        'SOPs',
        'Technical'
    ]
    
    created = []
    for folder in folders:
        path = Path(folder)
        if path.exists():
            print(f"  ✓ {folder}/")
        else:
            path.mkdir(parents=True, exist_ok=True)
            print(f"  ✓ {folder}/ (created)")
            created.append(folder)
    
    if created:
        print(f"\nCreated {len(created)} new folder(s)\n")
    else:
        print()
    return True


def check_database():
    """Initialize database"""
    print("[4/6] Checking database...")
    
    db_path = 'document_versions.db'
    
    if Path(db_path).exists():
        print(f"  ✓ {db_path} exists")
    else:
        print(f"  ✓ Creating {db_path}...")
        
        # Try to import and initialize
        try:
            from document_version_schema import DocumentVersionSchema
            schema = DocumentVersionSchema(db_path)
            schema.close()
            print(f"  ✓ {db_path} initialized")
        except ImportError:
            print(f"  ! Run: python document_version_schema.py")
            return False
        except Exception as e:
            print(f"  ✗ Error: {str(e)}")
            return False
    
    # Verify tables
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [row[0] for row in cursor.fetchall()]
        conn.close()
        
        required_tables = [
            'document_versions',
            'document_chunks',
            'embedding_metadata',
            'version_conflicts',
            'ingestion_tasks',
            'ingestion_failures',
            'admin_audit_log'
        ]
        
        missing = [t for t in required_tables if t not in tables]
        
        if missing:
            print(f"  ✗ Missing tables: {missing}")
            print(f"  ! Run: python document_version_schema.py")
            return False
        
        print(f"  ✓ All 7 tables found")
        print()
        return True
        
    except Exception as e:
        print(f"  ✗ Error: {str(e)}")
        return False


def check_api_server():
    """Check if api_server.py exists"""
    print("[5/6] Checking API server...")
    
    if Path('api_server.py').exists():
        print(f"  ✓ api_server.py found")
        print()
        return True
    else:
        print(f"  ✗ api_server.py not found")
        print()
        return False


def check_modules():
    """Check admin system modules"""
    print("[6/6] Checking admin modules...")
    
    modules = [
        'document_version_schema.py',
        'background_ingestion_worker.py',
        'multi_version_retriever.py'
    ]
    
    found = []
    missing = []
    
    for module in modules:
        if Path(module).exists():
            print(f"  ✓ {module}")
            found.append(module)
        else:
            print(f"  ✗ {module} (missing)")
            missing.append(module)
    
    print()
    
    if missing:
        print(f"Missing modules: {missing}")
        print("These need to be created for full functionality.")
        return False
    
    return True


def print_summary(results):
    """Print summary and next steps"""
    print("\n" + "="*60)
    print("ADMIN SYSTEM SETUP SUMMARY")
    print("="*60 + "\n")
    
    all_pass = all(results.values())
    
    if all_pass:
        print("✓ All checks passed! System is ready to run.\n")
        print("NEXT STEPS:")
        print("1. Terminal 1: ollama serve")
        print("2. Terminal 2: python api_server.py")
        print("3. Terminal 3: curl http://localhost:8000/health\n")
        print("For detailed usage, see: ADMIN_QUICKSTART_GUIDE.md")
        return 0
    else:
        print("✗ Some checks failed. Please fix issues above.\n")
        print("REQUIRED FIXES:")
        for check, passed in results.items():
            if not passed:
                print(f"  - {check}")
        print()
        return 1


def main():
    """Run all checks"""
    print("\n" + "="*60)
    print("ADMIN SYSTEM SETUP VERIFICATION")
    print("="*60 + "\n")
    
    results = {
        'Python version': check_python_version(),
        'Dependencies': check_dependencies(),
        'Folders': check_folders(),
        'Database': check_database(),
        'API Server': check_api_server(),
        'Modules': check_modules()
    }
    
    return print_summary(results)


if __name__ == '__main__':
    sys.exit(main())
