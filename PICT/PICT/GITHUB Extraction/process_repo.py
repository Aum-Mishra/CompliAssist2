import os
import shutil
import subprocess
import glob
import math
import zipfile
import collections
import re
import sys
import stat
import errno
from pathlib import Path
import stat
import errno

# Configuration
print("--- Configuration Setup ---")
REPO_URL = input("Enter Repository URL: ").strip()
while not REPO_URL:
    REPO_URL = input("Repository URL cannot be empty. Please enter URL: ").strip()

# Auto-derive repository name
url_clean = REPO_URL.rstrip('/')
if url_clean.endswith('.git'):
    url_clean = url_clean[:-4]
REPO_NAME = url_clean.split('/')[-1]
print(f"Repository Name: {REPO_NAME}")

# Automated defaults
TEMP_DIR = "temp_repo"
OUTPUT_DIR = "final_extracted_dataset"
FINAL_ZIP = "final_extracted_dataset.zip"
REPORT_FILE = "extraction_report.txt"

ALLOWED_EXTENSIONS = {
    '.md', '.pdf', '.docx', '.csv', '.tsv'
}

ALLOWED_FOLDERS = {
    'docs', 'strategy', 'research', 'analysis', 'retrospectives', 
    'postmortems', 'notion_exports', 'data', 'dataset', 'datasets'
}

EXCLUDED_FOLDERS = {
    'src', 'backend', 'frontend', 'app', 'node_modules', 'dist', 'build', 'venv', '.git'
}

EXCLUDED_EXTENSIONS = {
    '.py', '.js', '.ts', '.java', '.cpp', '.c', '.go', '.rs', '.php', '.rb', 
    '.cs', '.swift', '.kt', '.scala', '.pl', '.sh', '.bat', '.ps1'
}

def handle_remove_readonly(func, path, exc):
    excvalue = exc[1]
    if func in (os.rmdir, os.remove, os.unlink) and excvalue.errno == errno.EACCES:
        os.chmod(path, stat.S_IWRITE)
        func(path)
    else:
        pass

def clean_dir(directory):
    if os.path.exists(directory):
        try:
            shutil.rmtree(directory, ignore_errors=False, onerror=handle_remove_readonly)
        except Exception as e:
            print(f"Warning: Could not clean {directory}: {e}")

def clone_repo():
    print(f"Cloning {REPO_URL}...")
    clean_dir(TEMP_DIR)
    try:
        subprocess.run(["git", "clone", REPO_URL, TEMP_DIR], check=True)
        return True
    except Exception as e:
        print(f"Clone failed: {e}")
        return False

def is_allowed(path, root_base):
    rel_path = os.path.relpath(path, root_base)
    parts = rel_path.split(os.sep)
    
    # Check if inside excluded folder
    for part in parts:
        if part.lower() in EXCLUDED_FOLDERS:
            return False
            
    # Check if inside allowed folder (if strictly required? No, allowed folders are "Extract entire contents")
    # The prompt says: "Extract ONLY documentation, business files, and datasets."
    # AND "ALLOWED FOLDERS (if present) Extract entire contents of..."
    # So if it's in an allowed folder, we take it (unless it's strictly excluded source code? "No code files must appear in the final dataset")
    
    # Priority:
    # 1. NO source code anywhere.
    # 2. If in ALLOWED_FOLDERS, take everything (except code).
    # 3. If file extension is in ALLOWED_EXTENSIONS, take it.
    
    filename = os.path.basename(path)
    _, ext = os.path.splitext(filename)
    ext = ext.lower()
    
    if ext in EXCLUDED_EXTENSIONS:
        return False

    # Check if in allowed folder
    for part in parts:
        if part.lower() in ALLOWED_FOLDERS:
            return True
            
    # Check file extension
    if ext in ALLOWED_EXTENSIONS or filename.lower() == 'readme.md':
        return True
        
    return False

def extract_files():
    print("Extracting files...")
    # clean_dir(OUTPUT_DIR) # Changed: Don't wipe the entire output directory
    dest_repo_dir = os.path.join(OUTPUT_DIR, REPO_NAME)
    clean_dir(dest_repo_dir) # Only clean the specific repo folder
    os.makedirs(dest_repo_dir, exist_ok=True)
    
    files_extracted = []
    
    for root, dirs, files in os.walk(TEMP_DIR):
        # Modify dirs in-place to skip excluded folders
        dirs[:] = [d for d in dirs if d.lower() not in EXCLUDED_FOLDERS]
        
        for file in files:
            src_path = os.path.join(root, file)
            if is_allowed(src_path, TEMP_DIR):
                rel_path = os.path.relpath(src_path, TEMP_DIR)
                dest_path = os.path.join(dest_repo_dir, rel_path)
                os.makedirs(os.path.dirname(dest_path), exist_ok=True)
                shutil.copy2(src_path, dest_path)
                files_extracted.append(dest_path)
                
    return files_extracted

def get_text_content(file_path):
    # Only process text files for similarity
    _, ext = os.path.splitext(file_path)
    if ext not in ['.md', '.txt', '.csv', '.json', '.tsv']:
        return ""
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            return f.read()
    except:
        return ""

def cosine_similarity(text1, text2):
    # Simple tokenizer
    words1 = re.findall(r'\w+', text1.lower())
    words2 = re.findall(r'\w+', text2.lower())
    
    if not words1 or not words2:
        return 0.0
        
    vec1 = collections.Counter(words1)
    vec2 = collections.Counter(words2)
    
    intersection = set(vec1.keys()) & set(vec2.keys())
    numerator = sum([vec1[x] * vec2[x] for x in intersection])
    
    sum1 = sum([vec1[x]**2 for x in vec1.keys()])
    sum2 = sum([vec2[x]**2 for x in vec2.keys()])
    denominator = math.sqrt(sum1) * math.sqrt(sum2)
    
    if not denominator:
        return 0.0
    return float(numerator) / denominator

def analyze_similarity(files):
    print("Analyzing similarity...")
    file_contents = {}
    for f in files:
        content = get_text_content(f)
        if len(content) > 100: # Ignore very small files
            file_contents[f] = content
            
    pairs = []
    keys = list(file_contents.keys())
    for i in range(len(keys)):
        for j in range(i + 1, len(keys)):
            f1 = keys[i]
            f2 = keys[j]
            sim = cosine_similarity(file_contents[f1], file_contents[f2])
            if sim > 0.35:
                pairs.append((f1, f2, sim))
                
    return sorted(pairs, key=lambda x: x[2], reverse=True)

def generate_report(files, sim_pairs, repo_status):
    print("Generating report...")
    
    file_types = collections.Counter()
    for f in files:
        ext = os.path.splitext(f)[1].lower()
        file_types[ext] += 1
        
    dataset_extensions = {'.csv', '.tsv', '.json', '.xlsx', '.parquet'}
    dataset_files = [f for f in files if os.path.splitext(f)[1].lower() in dataset_extensions]
    
    report = []
    report.append("EXTRACTION REPORT")
    report.append("=================")
    report.append(f"Total repositories processed: 1")
    report.append(f"Repositories failed: {1 if not repo_status else 0}")
    report.append(f"Total files extracted: {len(files)}")
    report.append("\nFile Type Breakdown:")
    for ext, count in file_types.items():
        report.append(f"  {ext}: {count}")
        
    report.append(f"\nDataset Files Detected: {len(dataset_files)}")
    for df in dataset_files:
        report.append(f"  - {os.path.basename(df)}")
        
    report.append("\nSimilarity Report (Score > 0.35):")
    if not sim_pairs:
        report.append("  No significant similarity detected.")
    else:
        for f1, f2, score in sim_pairs[:10]: # Top 10
            report.append(f"  - {score:.2f}: {os.path.basename(f1)} <-> {os.path.basename(f2)}")
            
    report.append("\nConfirmation:")
    report.append("  [x] No source code included.")
    
    # Changed: Save report inside the repository folder, not the root output folder
    dest_repo_dir = os.path.join(OUTPUT_DIR, REPO_NAME)
    os.makedirs(dest_repo_dir, exist_ok=True) # Ensure it exists
    report_path = os.path.join(dest_repo_dir, REPORT_FILE)
    
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(report))
        
    return report_path

def create_zip():
    print("Compressing...")
    with zipfile.ZipFile(FINAL_ZIP, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(OUTPUT_DIR):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, OUTPUT_DIR)
                zipf.write(file_path, arcname)
    print(f"Created {FINAL_ZIP}")

def main():
    try:
        if clone_repo():
            files = extract_files()
            sim_pairs = analyze_similarity(files)
            generate_report(files, sim_pairs, True)
            create_zip()
            print("Done.")
        else:
            print("Failed to process repository.")
    finally:
        clean_dir(TEMP_DIR)

if __name__ == "__main__":
    main()
