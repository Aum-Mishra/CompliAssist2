# Extraction Instructions

The automated extraction agent encountered an environment issue (missing `pwsh`).
Please run the extraction script manually.

## Steps

1. Open a terminal (cmd or PowerShell).
2. Navigate to this directory:
   `cd "c:\Users\Admin\OneDrive\Desktop\HM\PICT\GITHUB Extraction"`
3. Run the Python script:
   `python run_extraction.py`

## Output

The script will:
1. Clone the repository `https://github.com/vedamehar/RentBridge_house-rental-app`
2. Extract documentation and datasets to `final_extracted_dataset/`
3. Generate `extraction_report.txt`
4. Create `final_extracted_dataset.zip`

Note: Ensure `git` is installed and available in your PATH.
