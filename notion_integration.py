"""
Notion Workspace Integration
Automatically extracts and loads Notion workspace data into projects
"""

import logging
import sys
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)

# ============================================================================
# NOTION AUTO-LOADER
# ============================================================================

class NotionAutoLoader:
    """
    Automatically detects and loads Notion extracted data.
    Runs on system startup to populate projects from Notion workspace.
    """
    
    def __init__(self, project_manager):
        self.project_manager = project_manager
        self.notion_dir = Path(__file__).parent / "Notion"
        self.extracted_dir = self.notion_dir / "final_extracted_dataset"
    
    def auto_load(self) -> bool:
        """
        Automatically load all Notion extracted data into projects.
        
        Returns:
            True if successful, False otherwise
        """
        logger.info("[NOTION] Checking for Notion extracted dataset...")
        
        if not self.extracted_dir.exists():
            logger.debug(f"[NOTION] No extracted dataset at {self.extracted_dir}")
            return False
        
        logger.info(f"[NOTION] Found extracted dataset at {self.extracted_dir}")
        
        success = True
        
        # Load all pages
        pages_loaded = self._load_pages()
        if pages_loaded > 0:
            logger.info(f"[NOTION] ✓ Loaded {pages_loaded} pages from Notion")
        
        # Load all databases
        databases_loaded = self._load_databases()
        if databases_loaded > 0:
            logger.info(f"[NOTION] ✓ Loaded {databases_loaded} databases from Notion")
        
        if pages_loaded + databases_loaded == 0:
            logger.warning("[NOTION] No pages or databases found in extracted dataset")
            success = False
        
        return success
    
    def _load_pages(self) -> int:
        """Load all Markdown pages from Notion extraction"""
        count = 0
        pages_dir = self.extracted_dir / "pages"
        
        if not pages_dir.exists():
            return 0
        
        try:
            for md_file in pages_dir.glob("*.md"):
                try:
                    project_name = md_file.stem
                    content = md_file.read_text(encoding='utf-8')
                    
                    # Save to project
                    if self.project_manager.save_project_file(
                        project_name,
                        md_file.name,
                        content
                    ):
                        logger.debug(f"[NOTION] Loaded page: {project_name}")
                        count += 1
                    
                except Exception as e:
                    logger.error(f"[NOTION] Error loading page {md_file.name}: {e}")
            
        except Exception as e:
            logger.error(f"[NOTION] Error loading pages: {e}")
        
        return count
    
    def _load_databases(self) -> int:
        """Load all CSV databases from Notion extraction"""
        count = 0
        databases_dir = self.extracted_dir / "databases"
        
        if not databases_dir.exists():
            return 0
        
        try:
            for csv_file in databases_dir.glob("*.csv"):
                try:
                    project_name = csv_file.stem
                    content = csv_file.read_text(encoding='utf-8')
                    
                    # Save to project
                    if self.project_manager.save_project_file(
                        project_name,
                        csv_file.name,
                        content
                    ):
                        logger.debug(f"[NOTION] Loaded database: {project_name}")
                        count += 1
                    
                except Exception as e:
                    logger.error(f"[NOTION] Error loading database {csv_file.name}: {e}")
            
        except Exception as e:
            logger.error(f"[NOTION] Error loading databases: {e}")
        
        return count
    
    def get_notion_status(self) -> dict:
        """Get status of Notion integration"""
        status = {
            "notion_available": self.extracted_dir.exists(),
            "extracted_dir": str(self.extracted_dir),
            "pages_count": 0,
            "databases_count": 0,
            "total_projects": 0
        }
        
        if self.extracted_dir.exists():
            pages_dir = self.extracted_dir / "pages"
            databases_dir = self.extracted_dir / "databases"
            
            if pages_dir.exists():
                status["pages_count"] = len(list(pages_dir.glob("*.md")))
            
            if databases_dir.exists():
                status["databases_count"] = len(list(databases_dir.glob("*.csv")))
            
            status["total_projects"] = status["pages_count"] + status["databases_count"]
        
        return status


# ============================================================================
# NOTION API WRAPPER (for live extraction)
# ============================================================================

class NotionAPIWrapper:
    """
    Wrapper around the Notion extractor tool.
    Allows live extraction from Notion workspace using API keys.
    """
    
    def __init__(self):
        self.notion_dir = Path(__file__).parent / "Notion"
        self.extractor_script = self.notion_dir / "notion_extractor.py"
    
    def extract_with_api_key(self, api_key: str, project_manager) -> bool:
        """
        Extract from Notion using API key.
        
        Args:
            api_key: Notion API key (ntn_xxx or secret_xxx)
            project_manager: ProjectManager instance
        
        Returns:
            True if successful
        """
        if not self.extractor_script.exists():
            logger.warning("[NOTION] notion_extractor.py not found")
            return False
        
        try:
            logger.info("[NOTION] Starting Notion API extraction...")
            
            # Add Notion directory to path
            sys.path.insert(0, str(self.notion_dir))
            
            from notion_extractor import NotionExtractor
            
            # Run extraction
            extractor = NotionExtractor(
                api_key=api_key,
                output_dir="data/project_updates/notion/extraction"
            )
            
            extractor.setup_directories()
            items = extractor.search_all()
            
            if not items:
                logger.warning("[NOTION] No items found in Notion workspace")
                return False
            
            logger.info(f"[NOTION] Found {len(items)} items in Notion workspace")
            
            # Extract databases and pages
            databases_count = 0
            pages_count = 0
            
            for item in items:
                if item.get("object") == "database":
                    # Extract database
                    # Save CSV to projects
                    databases_count += 1
                
                elif item.get("object") == "page":
                    # Extract page
                    # Save Markdown to projects
                    pages_count += 1
            
            logger.info(f"[NOTION] ✓ Extraction complete: {databases_count} databases, {pages_count} pages")
            return True
            
        except ImportError as e:
            logger.error(f"[NOTION] Could not import notion_extractor: {e}")
            return False
        except Exception as e:
            logger.error(f"[NOTION] Extraction error: {e}", exc_info=True)
            return False
    
    def get_extraction_script_info(self) -> dict:
        """Get info about the notion_extractor.py script"""
        return {
            "script_path": str(self.extractor_script),
            "exists": self.extractor_script.exists(),
            "readme_path": str(self.notion_dir / "README.md"),
            "projects_csv_path": str(self.notion_dir / "projects.csv"),
            "usage": """
            # Extract from Notion:
            cd Notion
            python notion_extractor.py "ProjectName"
            
            # Then load automatically on system startup
            # (NotionAutoLoader will detect and load)
            """
        }


# ============================================================================
# INITIALIZATION
# ============================================================================

def initialize_notion_integration(project_manager) -> NotionAutoLoader:
    """
    Initialize Notion integration and auto-load data.
    
    Returns:
        NotionAutoLoader instance (configured and ready)
    """
    logger.info("[NOTION] Initializing Notion workspace integration...")
    
    loader = NotionAutoLoader(project_manager)
    
    # Auto-load from extracted dataset
    if loader.auto_load():
        status = loader.get_notion_status()
        logger.info(f"[NOTION] ✓ Integration ready: {status['total_projects']} projects available")
    else:
        logger.info("[NOTION] ℹ️ No Notion data to load (extraction optional)")
    
    return loader
