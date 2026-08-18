# Notion Data Extraction Tool

A comprehensive Python tool to extract all accessible data from your Notion workspace including databases, pages, and attachments.

## Features

✅ **Complete Data Extraction**
- Extracts all accessible databases, pages, and subpages
- Downloads all attachments and linked files
- Handles pagination automatically
- Respects API rate limits

✅ **Smart Export Formats**
- Databases → CSV files
- Pages → Markdown (.md) files
- Preserves structure and formatting

✅ **Organized Output**
```
final_extracted_dataset/
├── databases/         # All database exports as CSV
├── pages/            # All page exports as Markdown
├── attachments/      # Downloaded files and images
└── extraction_report.txt
```

✅ **Comprehensive Reporting**
- Total databases exported
- Total pages exported
- Total files created
- Permission/API errors logged
- Total data size calculated

## Requirements

- Python 3.7 or higher
- `requests` library

## Installation

1. **Install Python dependencies:**
```bash
pip install -r requirements.txt
```

## Usage

### Method 1: Project-Based Extraction (Recommended)

1. **Edit `projects.csv`** with your project names and API keys:
```csv
Project Name,API Key
Finance report analysis,ntn_J4959992167ILuzs6YvpCZUbdfjqWMnxxVMAlR5upvHdj3
aum,ntn_b4959992167aJlMHHtXSEWaqnBfc9RLIifLTutZXzFN9ta
```

2. **Run with project name:**
```bash
python notion_extractor.py "Finance report analysis"
# Output will be saved in "Finance report analysis/" folder

# Or run interactively
python notion_extractor.py
# You'll see available projects and can enter the project name
```

### Method 2: Direct API Key

```bash
# Command line argument
python notion_extractor.py YOUR_NOTION_API_KEY

# Interactive prompt
python notion_extractor.py
# Press Enter when asked for project name, then enter API key
```

## Getting Your Notion API Key

1. Go to https://www.notion.so/my-integrations
2. Click "New integration"
3. Give it a name (e.g., "Data Extractor")
4. Select the workspace to associate
5. Copy the "Internal Integration Token" (starts with `secret_`)
6. **Important:** Share your pages/databases with the integration:
   - Open the page/database in Notion
   - Click "Share" → "Invite"
   - Select your integration

## Output

After extraction completes, you'll get:

1. **Folder Structure:**
   - `final_extracted_dataset/` with organized subfolders
   
2. **Extraction Report:**
   - `extraction_report.txt` with complete summary
   
3. **Zip Archive:**
   - `final_extracted_dataset.zip` for easy sharing/backup

## Features in Detail

### Database Export
- Exports all rows and columns
- Handles all Notion property types:
  - Title, Text, Number
  - Select, Multi-select
  - Date, Checkbox
  - URL, Email, Phone
  - And more...

### Page Export
- Converts to clean Markdown format
- Preserves:
  - Headings (H1, H2, H3)
  - Lists (bulleted, numbered, to-do)
  - Code blocks with syntax highlighting
  - Quotes and dividers
  - Nested content
  - Timestamps (created, last edited)

### Attachment Handling
- Downloads images and files
- Preserves filenames when possible
- Organizes in dedicated folder

### Error Handling
- Rate limit management (auto-retry)
- Permission error reporting
- Network error recovery
- Invalid API key detection

## Security

- ✅ API key is never logged or exposed
- ✅ Stored only in memory during execution
- ✅ Not written to any files

## Limitations

- Only extracts content that the integration has access to
- Must explicitly share pages/databases with the integration
- Notion API rate limits apply (handled automatically)
- Some block types may have limited formatting preservation

## Troubleshooting

### "Authentication failed"
- Verify your API key is correct
- Ensure it starts with `secret_` or `ntn_`

### "No items found"
- Make sure you've shared pages/databases with your integration
- Check integration permissions in Notion

### "Permission denied"
- Share the specific pages/databases with your integration
- Verify integration has correct capabilities

## Example Output

```
============================================================
NOTION DATA EXTRACTION REPORT
============================================================

Extraction Date: 2026-02-12 12:15:30

Output Directory: C:\...\final_extracted_dataset

------------------------------------------------------------
SUMMARY
------------------------------------------------------------
Total Databases Exported: 5
Total Pages Exported: 23
Total Files Created: 31
Total Data Size: 2.45 MB

✓ No errors encountered

============================================================
END OF REPORT
============================================================
```

## License

Free to use for personal and commercial purposes.

## Support

For issues or questions:
- Check the extraction_report.txt for detailed error messages
- Verify API key and integration permissions
- Ensure pages are shared with the integration

---

**Note:** This tool uses the official Notion API and respects all Notion's terms of service and rate limits.
