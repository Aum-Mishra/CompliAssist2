"""
Knowledge base initialization and indexing.
Ingests documents, creates embeddings, and indexes in FAISS.
"""
import os
import sys
import shutil
from pathlib import Path
import config
from ingestion import DocumentIngestionPipeline
from vector_store import VectorStore, EmbeddingModel, SemanticRetriever
from rules_engine import RuleEngine


def initialize_knowledge_base():
    """Initialize vector database from documents."""
    
    print("=" * 70)
    print("KNOWLEDGE BASE INITIALIZATION")
    print("=" * 70)
    
    # Clear old FAISS index if it exists (FIX for missing SOP embeddings)
    print(f"\n[0/4] Checking for existing FAISS index...")
    faiss_path = Path(config.FAISS_INDEX_FILE)
    if faiss_path.exists():
        print(f"✓ Found existing index at: {faiss_path}")
        print(f"  Backing up and clearing...")
        backup_path = faiss_path.parent / "faiss_index_BACKUP"
        if backup_path.exists():
            shutil.rmtree(backup_path)
        shutil.copytree(faiss_path, backup_path)
        shutil.rmtree(faiss_path)
        print(f"✓ Backup saved, old index cleared")
    
    print(f"\n[1/4] Loading registries...")
    try:
        # Verify registries exist
        restricted_path = Path(config.RESTRICTED_ENTITIES_CSV)
        approved_path = Path(config.APPROVED_ALTERNATIVES_CSV)
        
        if not restricted_path.exists():
            print(f"✗ Restricted entities file not found: {config.RESTRICTED_ENTITIES_CSV}")
            return False
        
        if not approved_path.exists():
            print(f"✗ Approved alternatives file not found: {config.APPROVED_ALTERNATIVES_CSV}")
            return False
        
        print(f"✓ Restricted entities: {config.RESTRICTED_ENTITIES_CSV}")
        print(f"✓ Approved alternatives: {config.APPROVED_ALTERNATIVES_CSV}")
    except Exception as e:
        print(f"✗ Failed to load registries: {e}")
        return False
    
    print(f"\n[2/4] Ingesting documents...")
    try:
        pipeline = DocumentIngestionPipeline(
            chunk_size=config.CHUNK_SIZE,
            chunk_overlap=config.CHUNK_OVERLAP
        )
        
        data_dir = Path(os.getenv("DATA_SOURCE_DIR", str(config.PROJECT_ROOT / "Data1")))
        
        all_chunks = []
        all_chunks.extend(pipeline.ingest_directory(str(data_dir / "Policies")))
        all_chunks.extend(pipeline.ingest_directory(str(data_dir / "SOPs")))
        all_chunks.extend(pipeline.ingest_directory(str(data_dir / "Internal")))
        all_chunks.extend(pipeline.ingest_directory(str(data_dir / "Technical")))
        
        print(f"\n✓ Total chunks ingested: {len(all_chunks)}")
        
        if not all_chunks:
            print("✗ No documents ingested!")
            return False
    
    except Exception as e:
        print(f"✗ Ingestion failed: {e}")
        return False
    
    print(f"\n[3/4] Creating embeddings...")
    try:
        embedding_model = EmbeddingModel(config.EMBEDDINGS_MODEL)
        
        texts = [chunk.text for chunk in all_chunks]
        print(f"Embedding {len(texts)} chunks...")
        embeddings = embedding_model.embed_texts(texts)
        
        print(f"✓ Created {embeddings.shape[0]} embeddings of dimension {embeddings.shape[1]}")
    
    except Exception as e:
        print(f"✗ Embedding failed: {e}")
        return False
    
    print(f"\n[4/4] Indexing in FAISS...")
    try:
        # Create full directory structure for FAISS index
        faiss_index_path = Path(config.FAISS_INDEX_FILE)
        faiss_index_path.mkdir(parents=True, exist_ok=True)
        print(f"✓ Created FAISS directory: {faiss_index_path}")
        
        vector_store = VectorStore(embedding_dim=config.EMBEDDING_DIMENSION)
        vector_store.initialize_index()
        
        metadata = [chunk.to_dict() for chunk in all_chunks]
        vector_store.add_embeddings(embeddings, metadata)
        
        vector_store.save(str(faiss_index_path))
        
        print(f"✓ FAISS index created and saved")
        print(f"✓ Index path: {faiss_index_path}")
    
    except Exception as e:
        print(f"✗ FAISS indexing failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    print("\n" + "=" * 70)
    print("✓ KNOWLEDGE BASE INITIALIZED SUCCESSFULLY")
    print("=" * 70)
    return True


if __name__ == "__main__":
    success = initialize_knowledge_base()
    sys.exit(0 if success else 1)
