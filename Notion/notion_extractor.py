"""
Notion Data Extraction Tool
Extracts all accessible databases, pages, and attachments from a Notion workspace.
"""

import os
import sys
import json
import csv
import time
import zipfile
import shutil
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional
import requests
from urllib.parse import urlparse

class NotionExtractor:
    def __init__(self, api_key: str, output_dir: str = "final_extracted_dataset"):
        self.api_key = api_key
        self.base_url = "https://api.notion.com/v1"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "Notion-Version": "2022-06-28"
        }
        self.output_dir = Path(output_dir)
        self.databases_dir = self.output_dir / "databases"
        self.pages_dir = self.output_dir / "pages"
        self.attachments_dir = self.output_dir / "attachments"
        
        self.stats = {
            "databases_exported": 0,
            "pages_exported": 0,
            "files_created": 0,
            "errors": [],
            "total_size": 0
        }
        
    def setup_directories(self):
        """Create output directory structure."""
        for directory in [self.databases_dir, self.pages_dir, self.attachments_dir]:
            directory.mkdir(parents=True, exist_ok=True)
        print(f"✓ Created directory structure at: {self.output_dir}")
    
    def make_request(self, method: str, endpoint: str, **kwargs) -> Optional[Dict]:
        """Make API request with rate limiting and error handling."""
        url = f"{self.base_url}/{endpoint}"
        try:
            response = requests.request(method, url, headers=self.headers, **kwargs)
            
            if response.status_code == 429:
                retry_after = int(response.headers.get("Retry-After", 1))
                print(f"  Rate limited. Waiting {retry_after}s...")
                time.sleep(retry_after)
                return self.make_request(method, endpoint, **kwargs)
            
            if response.status_code == 401:
                self.stats["errors"].append("Authentication failed. Invalid API key.")
                return None
            
            if response.status_code == 403:
                self.stats["errors"].append(f"Permission denied for {endpoint}")
                return None
            
            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.RequestException as e:
            error_msg = f"Request failed for {endpoint}: {str(e)}"
            self.stats["errors"].append(error_msg)
            print(f"  ✗ {error_msg}")
            return None
    
    def search_all(self) -> List[Dict]:
        """Search all accessible pages and databases with pagination."""
        print("\n🔍 Searching for all accessible content...")
        all_results = []
        has_more = True
        start_cursor = None
        
        while has_more:
            payload = {"page_size": 100}
            if start_cursor:
                payload["start_cursor"] = start_cursor
            
            response = self.make_request("POST", "search", json=payload)
            if not response:
                break
            
            results = response.get("results", [])
            all_results.extend(results)
            has_more = response.get("has_more", False)
            start_cursor = response.get("next_cursor")
            
            print(f"  Found {len(all_results)} items so far...")
            time.sleep(0.3)
        
        print(f"✓ Total items found: {len(all_results)}")
        return all_results
    
    def get_database(self, database_id: str) -> Optional[Dict]:
        """Get database metadata."""
        return self.make_request("GET", f"databases/{database_id}")
    
    def query_database(self, database_id: str) -> List[Dict]:
        """Query all rows from a database with pagination."""
        all_rows = []
        has_more = True
        start_cursor = None
        
        while has_more:
            payload = {"page_size": 100}
            if start_cursor:
                payload["start_cursor"] = start_cursor
            
            response = self.make_request("POST", f"databases/{database_id}/query", json=payload)
            if not response:
                break
            
            results = response.get("results", [])
            all_rows.extend(results)
            has_more = response.get("has_more", False)
            start_cursor = response.get("next_cursor")
            time.sleep(0.3)
        
        return all_rows
    
    def get_page(self, page_id: str) -> Optional[Dict]:
        """Get page metadata."""
        return self.make_request("GET", f"pages/{page_id}")
    
    def get_blocks(self, block_id: str) -> List[Dict]:
        """Get all blocks from a page with pagination."""
        all_blocks = []
        has_more = True
        start_cursor = None
        
        while has_more:
            params = {"page_size": 100}
            if start_cursor:
                params["start_cursor"] = start_cursor
            
            response = self.make_request("GET", f"blocks/{block_id}/children", params=params)
            if not response:
                break
            
            results = response.get("results", [])
            all_blocks.extend(results)
            
            for block in results:
                if block.get("has_children"):
                    children = self.get_blocks(block["id"])
                    block["children"] = children
            
            has_more = response.get("has_more", False)
            start_cursor = response.get("next_cursor")
            time.sleep(0.3)
        
        return all_blocks
    
    def extract_text_from_rich_text(self, rich_text: List[Dict]) -> str:
        """Extract plain text from Notion rich text array."""
        if not rich_text:
            return ""
        return "".join([item.get("plain_text", "") for item in rich_text])
    
    def block_to_markdown(self, block: Dict, indent_level: int = 0) -> str:
        """Convert Notion block to Markdown format."""
        block_type = block.get("type")
        indent = "  " * indent_level
        markdown = ""
        
        if block_type == "paragraph":
            text = self.extract_text_from_rich_text(block["paragraph"].get("rich_text", []))
            markdown = f"{indent}{text}\n\n"
        
        elif block_type == "heading_1":
            text = self.extract_text_from_rich_text(block["heading_1"].get("rich_text", []))
            markdown = f"{indent}# {text}\n\n"
        
        elif block_type == "heading_2":
            text = self.extract_text_from_rich_text(block["heading_2"].get("rich_text", []))
            markdown = f"{indent}## {text}\n\n"
        
        elif block_type == "heading_3":
            text = self.extract_text_from_rich_text(block["heading_3"].get("rich_text", []))
            markdown = f"{indent}### {text}\n\n"
        
        elif block_type == "bulleted_list_item":
            text = self.extract_text_from_rich_text(block["bulleted_list_item"].get("rich_text", []))
            markdown = f"{indent}- {text}\n"
        
        elif block_type == "numbered_list_item":
            text = self.extract_text_from_rich_text(block["numbered_list_item"].get("rich_text", []))
            markdown = f"{indent}1. {text}\n"
        
        elif block_type == "to_do":
            text = self.extract_text_from_rich_text(block["to_do"].get("rich_text", []))
            checked = "x" if block["to_do"].get("checked") else " "
            markdown = f"{indent}- [{checked}] {text}\n"
        
        elif block_type == "toggle":
            text = self.extract_text_from_rich_text(block["toggle"].get("rich_text", []))
            markdown = f"{indent}<details><summary>{text}</summary>\n\n"
        
        elif block_type == "code":
            text = self.extract_text_from_rich_text(block["code"].get("rich_text", []))
            language = block["code"].get("language", "")
            markdown = f"{indent}```{language}\n{text}\n```\n\n"
        
        elif block_type == "quote":
            text = self.extract_text_from_rich_text(block["quote"].get("rich_text", []))
            markdown = f"{indent}> {text}\n\n"
        
        elif block_type == "divider":
            markdown = f"{indent}---\n\n"
        
        elif block_type == "image":
            image_data = block.get("image", {})
            url = image_data.get("external", {}).get("url") or image_data.get("file", {}).get("url", "")
            markdown = f"{indent}![image]({url})\n\n"
        
        elif block_type == "file":
            file_data = block.get("file", {})
            url = file_data.get("external", {}).get("url") or file_data.get("file", {}).get("url", "")
            markdown = f"{indent}[file]({url})\n\n"
        
        if "children" in block:
            for child in block["children"]:
                markdown += self.block_to_markdown(child, indent_level + 1)
        
        if block_type == "toggle" and "children" in block:
            markdown += f"{indent}</details>\n\n"
        
        return markdown
    
    def get_page_title(self, page: Dict) -> str:
        """Extract page title from page properties."""
        properties = page.get("properties", {})
        
        for prop_name, prop_data in properties.items():
            if prop_data.get("type") == "title":
                title_array = prop_data.get("title", [])
                if title_array:
                    return self.extract_text_from_rich_text(title_array)
        
        return page.get("id", "untitled")
    
    def sanitize_filename(self, filename: str) -> str:
        """Sanitize filename to be filesystem-safe."""
        invalid_chars = '<>:"/\\|?*'
        for char in invalid_chars:
            filename = filename.replace(char, "_")
        return filename[:200]
    
    def export_database_to_csv(self, database: Dict):
        """Export database to CSV file."""
        db_id = database["id"]
        db_title = self.get_page_title(database)
        
        print(f"  📊 Exporting database: {db_title}")
        
        rows = self.query_database(db_id)
        if not rows:
            print(f"    No data found")
            return
        
        properties = database.get("properties", {})
        headers = list(properties.keys())
        
        safe_title = self.sanitize_filename(db_title)
        csv_path = self.databases_dir / f"{safe_title}_{db_id[:8]}.csv"
        
        try:
            with open(csv_path, 'w', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow(headers)
                
                for row in rows:
                    row_data = []
                    row_props = row.get("properties", {})
                    
                    for header in headers:
                        prop = row_props.get(header, {})
                        prop_type = prop.get("type")
                        value = ""
                        
                        if prop_type == "title":
                            value = self.extract_text_from_rich_text(prop.get("title", []))
                        elif prop_type == "rich_text":
                            value = self.extract_text_from_rich_text(prop.get("rich_text", []))
                        elif prop_type == "number":
                            value = prop.get("number", "")
                        elif prop_type == "select":
                            select = prop.get("select")
                            value = select.get("name", "") if select else ""
                        elif prop_type == "multi_select":
                            multi = prop.get("multi_select", [])
                            value = ", ".join([item.get("name", "") for item in multi])
                        elif prop_type == "date":
                            date = prop.get("date")
                            value = date.get("start", "") if date else ""
                        elif prop_type == "checkbox":
                            value = prop.get("checkbox", False)
                        elif prop_type == "url":
                            value = prop.get("url", "")
                        elif prop_type == "email":
                            value = prop.get("email", "")
                        elif prop_type == "phone_number":
                            value = prop.get("phone_number", "")
                        else:
                            value = json.dumps(prop)
                        
                        row_data.append(str(value))
                    
                    writer.writerow(row_data)
            
            self.stats["databases_exported"] += 1
            self.stats["files_created"] += 1
            file_size = csv_path.stat().st_size
            self.stats["total_size"] += file_size
            print(f"    ✓ Exported {len(rows)} rows to {csv_path.name}")
            
        except Exception as e:
            error_msg = f"Failed to export database {db_title}: {str(e)}"
            self.stats["errors"].append(error_msg)
            print(f"    ✗ {error_msg}")
    
    def export_page_to_markdown(self, page: Dict):
        """Export page to Markdown file."""
        page_id = page["id"]
        page_title = self.get_page_title(page)
        
        print(f"  📄 Exporting page: {page_title}")
        
        blocks = self.get_blocks(page_id)
        
        markdown = f"# {page_title}\n\n"
        markdown += f"*Created: {page.get('created_time', 'Unknown')}*\n\n"
        markdown += f"*Last edited: {page.get('last_edited_time', 'Unknown')}*\n\n"
        markdown += "---\n\n"
        
        for block in blocks:
            markdown += self.block_to_markdown(block)
        
        safe_title = self.sanitize_filename(page_title)
        md_path = self.pages_dir / f"{safe_title}_{page_id[:8]}.md"
        
        try:
            with open(md_path, 'w', encoding='utf-8') as f:
                f.write(markdown)
            
            self.stats["pages_exported"] += 1
            self.stats["files_created"] += 1
            file_size = md_path.stat().st_size
            self.stats["total_size"] += file_size
            print(f"    ✓ Exported to {md_path.name}")
            
        except Exception as e:
            error_msg = f"Failed to export page {page_title}: {str(e)}"
            self.stats["errors"].append(error_msg)
            print(f"    ✗ {error_msg}")
    
    def download_file(self, url: str, filename: str):
        """Download attachment file."""
        try:
            response = requests.get(url, stream=True)
            response.raise_for_status()
            
            file_path = self.attachments_dir / filename
            with open(file_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            self.stats["files_created"] += 1
            file_size = file_path.stat().st_size
            self.stats["total_size"] += file_size
            print(f"    ✓ Downloaded {filename}")
            
        except Exception as e:
            error_msg = f"Failed to download {filename}: {str(e)}"
            self.stats["errors"].append(error_msg)
            print(f"    ✗ {error_msg}")
    
    def extract_attachments(self, blocks: List[Dict]):
        """Extract and download attachments from blocks."""
        for block in blocks:
            block_type = block.get("type")
            
            if block_type == "image":
                image_data = block.get("image", {})
                url = image_data.get("file", {}).get("url")
                if url:
                    filename = f"image_{block['id'][:8]}.png"
                    self.download_file(url, filename)
            
            elif block_type == "file":
                file_data = block.get("file", {})
                url = file_data.get("file", {}).get("url")
                if url:
                    parsed = urlparse(url)
                    filename = os.path.basename(parsed.path) or f"file_{block['id'][:8]}"
                    self.download_file(url, filename)
            
            if "children" in block:
                self.extract_attachments(block["children"])
    
    def generate_report(self):
        """Generate extraction report."""
        report_path = self.output_dir / "extraction_report.txt"
        
        report = []
        report.append("=" * 60)
        report.append("NOTION DATA EXTRACTION REPORT")
        report.append("=" * 60)
        report.append(f"\nExtraction Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report.append(f"\nOutput Directory: {self.output_dir.absolute()}")
        report.append("\n" + "-" * 60)
        report.append("SUMMARY")
        report.append("-" * 60)
        report.append(f"Total Databases Exported: {self.stats['databases_exported']}")
        report.append(f"Total Pages Exported: {self.stats['pages_exported']}")
        report.append(f"Total Files Created: {self.stats['files_created']}")
        report.append(f"Total Data Size: {self.stats['total_size'] / 1024:.2f} KB ({self.stats['total_size'] / (1024*1024):.2f} MB)")
        
        if self.stats["errors"]:
            report.append("\n" + "-" * 60)
            report.append("ERRORS")
            report.append("-" * 60)
            for i, error in enumerate(self.stats["errors"], 1):
                report.append(f"{i}. {error}")
        else:
            report.append("\n✓ No errors encountered")
        
        report.append("\n" + "=" * 60)
        report.append("END OF REPORT")
        report.append("=" * 60)
        
        report_text = "\n".join(report)
        
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(report_text)
        
        print(f"\n✓ Report generated: {report_path.name}")
        return report_text
    
    def create_zip(self):
        """Create zip archive of extracted data."""
        zip_path = f"{self.output_dir}.zip"
        
        print(f"\n📦 Creating zip archive...")
        
        try:
            with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                for root, dirs, files in os.walk(self.output_dir):
                    for file in files:
                        file_path = Path(root) / file
                        arcname = file_path.relative_to(self.output_dir.parent)
                        zipf.write(file_path, arcname)
            
            zip_size = Path(zip_path).stat().st_size
            print(f"✓ Created: {zip_path}")
            print(f"  Size: {zip_size / (1024*1024):.2f} MB")
            
        except Exception as e:
            error_msg = f"Failed to create zip: {str(e)}"
            self.stats["errors"].append(error_msg)
            print(f"✗ {error_msg}")
    
    def extract_all(self):
        """Main extraction workflow."""
        print("\n" + "=" * 60)
        print("NOTION DATA EXTRACTOR")
        print("=" * 60)
        
        self.setup_directories()
        
        all_items = self.search_all()
        
        databases = [item for item in all_items if item.get("object") == "database"]
        pages = [item for item in all_items if item.get("object") == "page"]
        
        print(f"\n📊 Found {len(databases)} databases")
        print(f"📄 Found {len(pages)} pages")
        
        if databases:
            print(f"\n{'='*60}")
            print("EXPORTING DATABASES")
            print('='*60)
            for db in databases:
                self.export_database_to_csv(db)
        
        if pages:
            print(f"\n{'='*60}")
            print("EXPORTING PAGES")
            print('='*60)
            for page in pages:
                self.export_page_to_markdown(page)
        
        print(f"\n{'='*60}")
        print("EXTRACTING ATTACHMENTS")
        print('='*60)
        for page in pages:
            blocks = self.get_blocks(page["id"])
            self.extract_attachments(blocks)
        
        report = self.generate_report()
        
        self.create_zip()
        
        print(f"\n{'='*60}")
        print("EXTRACTION COMPLETE")
        print('='*60)
        print(report)
        
        self.display_folder_structure()
    
    def display_folder_structure(self):
        """Display folder structure tree."""
        print(f"\n{'='*60}")
        print("FOLDER STRUCTURE")
        print('='*60)
        
        def print_tree(directory: Path, prefix: str = ""):
            try:
                entries = sorted(directory.iterdir(), key=lambda x: (not x.is_dir(), x.name))
                for i, entry in enumerate(entries):
                    is_last = i == len(entries) - 1
                    current_prefix = "└── " if is_last else "├── "
                    print(f"{prefix}{current_prefix}{entry.name}")
                    
                    if entry.is_dir():
                        extension = "    " if is_last else "│   "
                        print_tree(entry, prefix + extension)
            except PermissionError:
                pass
        
        print(f"{self.output_dir.name}/")
        print_tree(self.output_dir)


def load_projects_from_csv(csv_file: str = "projects.csv") -> Dict[str, str]:
    """Load project names and API keys from CSV file."""
    projects = {}
    csv_path = Path(csv_file)
    
    if not csv_path.exists():
        return projects
    
    try:
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                project_name = row.get('Project Name', '').strip()
                api_key = row.get('API Key', '').strip()
                if project_name and api_key:
                    projects[project_name.lower()] = {
                        'name': project_name,
                        'api_key': api_key
                    }
    except Exception as e:
        print(f"⚠️  Warning: Could not read projects.csv: {e}")
    
    return projects


def main():
    """Main entry point."""
    print("\n" + "=" * 60)
    print("NOTION DATA EXTRACTION TOOL")
    print("=" * 60 + "\n")
    
    # Load projects from CSV
    projects = load_projects_from_csv()
    
    api_key = None
    project_name = None
    output_dir = "final_extracted_dataset"
    
    if projects:
        print("📋 Available Projects:")
        for idx, proj in enumerate(projects.values(), 1):
            print(f"  {idx}. {proj['name']}")
        print()
        
        # Check if project name provided as argument
        if len(sys.argv) > 1:
            input_project = sys.argv[1].strip()
        else:
            input_project = input("Enter project name (or press Enter to use API key directly): ").strip()
        
        # Look up project in CSV
        if input_project:
            project_lookup = input_project.lower()
            if project_lookup in projects:
                project_info = projects[project_lookup]
                project_name = project_info['name']
                api_key = project_info['api_key']
                output_dir = project_name  # Use project name as folder name
                print(f"✓ Found project: {project_name}")
                print(f"✓ Output folder: {output_dir}")
            else:
                print(f"⚠️  Project '{input_project}' not found in projects.csv")
                print("Available projects:", ", ".join([p['name'] for p in projects.values()]))
                sys.exit(1)
    
    # If no project selected, ask for API key directly
    if not api_key:
        if len(sys.argv) > 1:
            api_key = sys.argv[1]
        else:
            api_key = input("Enter your NOTION_API_KEY: ").strip()
        
        if not api_key:
            print("❌ Error: API key is required")
            sys.exit(1)
    
    if not api_key.startswith("secret_") and not api_key.startswith("ntn_"):
        print("⚠️  Warning: API key format looks unusual. Notion API keys typically start with 'secret_' or 'ntn_'")
        proceed = input("Continue anyway? (y/n): ").strip().lower()
        if proceed != 'y':
            sys.exit(0)
    
    try:
        extractor = NotionExtractor(api_key, output_dir=output_dir)
        extractor.extract_all()
        
        print("\n✅ Extraction completed successfully!")
        print(f"📁 Output: {extractor.output_dir.absolute()}")
        print(f"📦 Archive: {extractor.output_dir.absolute()}.zip")
        
    except KeyboardInterrupt:
        print("\n\n⚠️  Extraction interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Fatal error: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
