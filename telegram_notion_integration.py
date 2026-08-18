"""
Telegram & Notion Data Integration Layer
Handles loading and retrieving data from Telegram groups and Notion projects
"""

from pathlib import Path
from typing import Optional, Dict, List, Any
import os

class TelegramIntegration:
    """Loads and retrieves Telegram group chat data."""
    
    def __init__(self):
        self.base_path = Path(__file__).parent / "Telegram"
        self.groups = self._load_available_groups()
    
    def _load_available_groups(self) -> List[str]:
        """Get list of available Telegram groups."""
        if not self.base_path.exists():
            return []
        
        groups = []
        for group_path in self.base_path.iterdir():
            if group_path.is_dir():
                groups.append(group_path.name)
        
        return groups
    
    def get_group_chats(self, group_name: str) -> Optional[str]:
        """Get chat history from Telegram group."""
        group_path = self.base_path / group_name / "chats.txt"
        
        if not group_path.exists():
            return None
        
        try:
            with open(group_path, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            print(f"[TELEGRAM] Error reading {group_name}: {e}")
            return None
    
    def detect_group_query(self, query: str) -> Optional[str]:
        """Detect if query is asking about a Telegram group."""
        query_lower = query.lower()
        
        keywords = ['telegram', 'group', 'chats', 'chat update', 'messages']
        
        if not any(kw in query_lower for kw in keywords):
            return None
        
        # Check if group name is mentioned
        for group_name in self.groups:
            if group_name.lower() in query_lower:
                return group_name
        
        return None
    
    def get_telegram_response(self, query: str) -> Optional[Dict[str, Any]]:
        """Generate response from Telegram group data."""
        group_name = self.detect_group_query(query)
        
        if not group_name:
            return None
        
        chats = self.get_group_chats(group_name)
        
        if not chats:
            return {
                "type": "telegram",
                "group_name": group_name,
                "found": False,
                "message": f"No chat history found for group: {group_name}"
            }
        
        return {
            "type": "telegram",
            "group_name": group_name,
            "found": True,
            "message": f"Chat History from Telegram Group: {group_name}\n\n{chats}",
            "source_file": f"Telegram/{group_name}/chats.txt",
            "keywords": ["telegram", "group", "chats", group_name]
        }


class NotionIntegration:
    """Loads and retrieves Notion project data."""
    
    def __init__(self):
        self.base_path = Path(__file__).parent / "Notion"
        self.projects = self._load_available_projects()
    
    def _load_available_projects(self) -> Dict[str, Path]:
        """Get list of available Notion projects."""
        if not self.base_path.exists():
            return {}
        
        projects = {}
        for project_path in self.base_path.iterdir():
            if project_path.is_dir():
                project_file = project_path / "project_info.md"
                if project_file.exists():
                    projects[project_path.name] = project_file
        
        return projects
    
    def get_project_info(self, project_name: str) -> Optional[str]:
        """Get project information from Notion."""
        if project_name not in self.projects:
            return None
        
        try:
            with open(self.projects[project_name], 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            print(f"[NOTION] Error reading {project_name}: {e}")
            return None
    
    def detect_project_query(self, query: str) -> Optional[str]:
        """Detect if query is asking about a Notion project."""
        query_lower = query.lower()
        
        keywords = ['project', 'update', 'hack', 'smartbudget', 'finance']
        
        if not any(kw in query_lower for kw in keywords):
            return None
        
        # Check if project name is mentioned
        for project_name in self.projects.keys():
            if project_name.lower() in query_lower:
                return project_name
        
        # Check for specific keywords that map to projects
        if 'hack' in query_lower:
            if 'Project Hack' in self.projects:
                return 'Project Hack'
        
        if 'smartbudget' in query_lower or 'finance' in query_lower:
            if 'Project Hack' in self.projects:  # SmartBudget Finance is in Project Hack
                return 'Project Hack'
        
        return None
    
    def get_notion_response(self, query: str) -> Optional[Dict[str, Any]]:
        """Generate response from Notion project data."""
        project_name = self.detect_project_query(query)
        
        if not project_name:
            return None
        
        project_info = self.get_project_info(project_name)
        
        if not project_info:
            return {
                "type": "notion",
                "project_name": project_name,
                "found": False,
                "message": f"No project information found for: {project_name}"
            }
        
        return {
            "type": "notion",
            "project_name": project_name,
            "found": True,
            "message": f"Project Information: {project_name}\n\n{project_info}",
            "source_file": f"Notion/{project_name}/project_info.md",
            "keywords": ["project", project_name.lower()]
        }


class TelegramNotionRouter:
    """Routes queries to appropriate Telegram or Notion data source."""
    
    def __init__(self):
        self.telegram = TelegramIntegration()
        self.notion = NotionIntegration()
    
    def process_query(self, query: str) -> Optional[Dict[str, Any]]:
        """Process query and return data from appropriate source."""
        
        # Try Telegram first
        telegram_response = self.telegram.get_telegram_response(query)
        if telegram_response and telegram_response.get("found"):
            return telegram_response
        
        # Try Notion
        notion_response = self.notion.get_notion_response(query)
        if notion_response and notion_response.get("found"):
            return notion_response
        
        return None
    
    def get_available_sources(self) -> Dict[str, List[str]]:
        """Get list of available Telegram groups and Notion projects."""
        return {
            "telegram_groups": self.telegram.groups,
            "notion_projects": list(self.notion.projects.keys())
        }


# Singleton instance
_router = None

def get_router() -> TelegramNotionRouter:
    """Get or create the Telegram/Notion router instance."""
    global _router
    if _router is None:
        _router = TelegramNotionRouter()
    return _router

def process_telegram_notion_query(query: str) -> Optional[Dict[str, Any]]:
    """Process query to check if it's asking for Telegram/Notion data."""
    router = get_router()
    return router.process_query(query)
