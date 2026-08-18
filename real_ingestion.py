"""
Real document ingestion pipeline for uploaded files.

This module handles:
1. PDF text extraction with PyMuPDF (fitz)
2. Document chunking with proper metadata
3. Embedding generation with sentence-transformers
4. FAISS index updates
5. Retriever refresh
6. Full debugging and logging
"""

from pathlib import Path
from typing import List, Dict, Any, Optional
import sys
import config
from ingestion import DocumentProcessor


class RealDocumentIngester:
    """Properly ingest documents into vector database with full debugging."""
    
    def __init__(self, vector_store, embedding_model):
        """Initialize with vector store and embedding model."""
        self.vector_store = vector_store
        self.embedding_model = embedding_model
        self.processor = DocumentProcessor()
    
    def extract_text(self, file_path: str, document_type: str) -> tuple[str, int]:
        """
        Extract text from document.
        
        Returns:
            (text, text_length)
        """
        file_path = Path(file_path)
        text = ""
        
        print(f"\n[EXTRACT] Extracting text from {file_path.name}")
        print(f"  Document type: {document_type}")
        
        try:
            if file_path.suffix.lower() == ".pdf":
                text = self._extract_pdf(str(file_path))
            elif file_path.suffix.lower() in [".txt", ".md", ".markdown"]:
                with open(file_path, 'r', encoding='utf-8') as f:
                    text = f.read()
            else:
                raise ValueError(f"Unsupported format: {file_path.suffix}")
            
            text_length = len(text)
            char_count = len(text)
            word_count = len(text.split())
            token_count = self.processor.count_tokens(text)
            
            print(f"  ✓ Text extracted")
            print(f"    Characters: {char_count}")
            print(f"    Words: {word_count}")
            print(f"    Approx tokens: {token_count}")
            
            if text_length == 0:
                print(f"  ✗ FAILED: Extracted text is empty!")
                return text, 0
            
            print(f"  ✓ Text extraction successful")
            return text, text_length
        
        except Exception as e:
            print(f"  ✗ Text extraction failed: {str(e)}")
            import traceback
            traceback.print_exc()
            return "", 0
    
    def _extract_pdf(self, file_path: str) -> str:
        """Extract text from PDF using PyMuPDF."""
        try:
            import fitz
        except ImportError:
            raise ImportError("PyMuPDF required: pip install PyMuPDF")
        
        text = ""
        try:
            doc = fitz.open(file_path)
            page_count = len(doc)
            print(f"    PDF pages: {page_count}")
            
            for page_num, page in enumerate(doc):
                page_text = page.get_text()
                if page_text.strip():
                    text += f"\n--- Page {page_num + 1} ---\n"
                    text += page_text
            
            doc.close()
        except Exception as e:
            print(f"    ✗ PDF extraction error: {e}")
            raise
        
        return text
    
    def chunk_text(self, text: str, document_name: str, version: str, 
                  document_type: str) -> List[Dict[str, Any]]:
        """
        Chunk text into semantic segments with metadata.
        
        Returns:
            List of chunk dictionaries with text and metadata
        """
        print(f"\n[CHUNK] Chunking document text")
        print(f"  Document: {document_name}")
        print(f"  Version: {version}")
        print(f"  Type: {document_type}")
        
        try:
            # Chunk the text
            chunks = self.processor.chunk_text(
                text,
                chunk_size=config.CHUNK_SIZE,
                overlap=config.CHUNK_OVERLAP
            )
            
            chunk_count = len(chunks)
            print(f"  ✓ Created {chunk_count} chunks")
            
            # Calculate chunk statistics
            if chunks:
                chunk_sizes = [self.processor.count_tokens(c) for c in chunks]
                avg_size = sum(chunk_sizes) / len(chunk_sizes)
                min_size = min(chunk_sizes)
                max_size = max(chunk_sizes)
                
                print(f"    Avg chunk size: {avg_size:.0f} tokens")
                print(f"    Min chunk size: {min_size} tokens")
                print(f"    Max chunk size: {max_size} tokens")
            
            if chunk_count == 0:
                print(f"  ✗ FAILED: No chunks created!")
                return []
            
            # Create chunk dictionaries with metadata
            chunk_dicts = []
            for idx, chunk_text in enumerate(chunks):
                chunk_dict = {
                    "content": chunk_text,
                    "source": document_name,
                    "document_name": document_name,
                    "version": version,
                    "document_type": document_type,
                    "chunk_id": idx,
                    "page": None,  # We'll improve this with PDF page numbers later
                    "chunk_number": idx + 1,
                    "total_chunks": chunk_count
                }
                chunk_dicts.append(chunk_dict)
            
            print(f"  ✓ Chunk metadata attached")
            return chunk_dicts
        
        except Exception as e:
            print(f"  ✗ Chunking failed: {str(e)}")
            import traceback
            traceback.print_exc()
            return []
    
    def generate_embeddings(self, chunks: List[Dict[str, Any]]) -> Optional[tuple]:
        """
        Generate embeddings for all chunks.
        
        Returns:
            (embeddings_array, embedding_dimension) or None if failed
        """
        print(f"\n[EMBED] Generating embeddings")
        print(f"  Chunks to embed: {len(chunks)}")
        
        try:
            if not chunks:
                print(f"  ✗ No chunks to embed!")
                return None
            
            # Extract text from chunks
            texts = [chunk["content"] for chunk in chunks]
            
            print(f"  Embedding {len(texts)} chunks...")
            embeddings = self.embedding_model.embed_texts(texts)
            
            embedding_dim = embeddings.shape[1]
            embedding_count = embeddings.shape[0]
            
            print(f"  ✓ Generated {embedding_count} embeddings")
            print(f"    Dimension: {embedding_dim}")
            
            # Verify dimension matches FAISS index
            if embedding_dim != config.EMBEDDING_DIMENSION:
                print(f"  ✗ DIMENSION MISMATCH!")
                print(f"    Expected: {config.EMBEDDING_DIMENSION}")
                print(f"    Got: {embedding_dim}")
                return None
            
            print(f"  ✓ Dimension matches config ({config.EMBEDDING_DIMENSION})")
            return embeddings, embedding_dim
        
        except Exception as e:
            print(f"  ✗ Embedding generation failed: {str(e)}")
            import traceback
            traceback.print_exc()
            return None
    
    def insert_into_vector_store(self, chunks: List[Dict[str, Any]], 
                                 embeddings) -> bool:
        """
        Insert embeddings and metadata into FAISS index.
        
        Returns:
            True if successful, False otherwise
        """
        print(f"\n[INDEX] Inserting into FAISS index")
        
        try:
            if embeddings is None or len(chunks) == 0:
                print(f"  ✗ Invalid input: no embeddings or chunks")
                return False
            
            # Get initial FAISS index size
            initial_count = self.vector_store.index.ntotal if self.vector_store.index else 0
            print(f"  Initial index size: {initial_count} vectors")
            
            # Add to vector store
            print(f"  Adding {len(chunks)} embeddings...")
            self.vector_store.add_embeddings(embeddings, chunks)
            
            # Get final FAISS index size
            final_count = self.vector_store.index.ntotal if self.vector_store.index else 0
            print(f"  Final index size: {final_count} vectors")
            
            vectors_added = final_count - initial_count
            print(f"  ✓ {vectors_added} vectors added")
            
            if vectors_added != len(chunks):
                print(f"  ⚠ WARNING: Expected {len(chunks)} vectors, added {vectors_added}")
            
            # Save index to disk
            print(f"  Saving FAISS index to disk...")
            self.vector_store.save(config.FAISS_INDEX_FILE)
            print(f"  ✓ Index saved to {config.FAISS_INDEX_FILE}")
            
            return True
        
        except Exception as e:
            print(f"  ✗ Index insertion failed: {str(e)}")
            import traceback
            traceback.print_exc()
            return False
    
    def verify_retrieval(self, retriever, chunks: List[Dict[str, Any]], 
                        sample_keywords: List[str]) -> bool:
        """
        Verify that documents can be retrieved.
        
        Returns:
            True if retrieval works, False otherwise
        """
        print(f"\n[VERIFY] Testing retrieval")
        
        try:
            # Extract keywords from first few chunks
            if not sample_keywords:
                first_chunk = chunks[0]["content"] if chunks else ""
                words = first_chunk.split()
                sample_keywords = [w for w in words if len(w) > 5][:3]
            
            print(f"  Testing retrieval with keywords: {sample_keywords}")
            
            for keyword in sample_keywords[:1]:  # Test first keyword
                print(f"\n  Query: '{keyword}'")
                
                try:
                    results = retriever.retrieve(keyword, top_k=3)
                    print(f"  Results: {len(results)} documents found")
                    
                    if results:
                        for i, result in enumerate(results[:1]):
                            source = result.get("source", "Unknown")
                            snippet = result.get("content", "")[:100]
                            print(f"    [{i+1}] {source}: {snippet}...")
                        return True
                    else:
                        print(f"  ✗ No results found for keyword")
                except Exception as e:
                    print(f"  ✗ Retrieval failed: {str(e)}")
            
            return False
        
        except Exception as e:
            print(f"  ✗ Verification failed: {str(e)}")
            return False
    
    def ingest_document(self, file_path: str, document_name: str, version: str,
                       document_type: str, retriever=None) -> bool:
        """
        Complete end-to-end ingestion pipeline.
        
        Returns:
            True if successful, False otherwise
        """
        print("\n" + "=" * 70)
        print("DOCUMENT INGESTION PIPELINE")
        print("=" * 70)
        print(f"File: {file_path}")
        print(f"Document: {document_name} (v{version})")
        print(f"Type: {document_type}")
        
        # Step 1: Extract text
        text, text_length = self.extract_text(file_path, document_type)
        if text_length == 0:
            print("\n✗ INGESTION FAILED: Text extraction returned 0 characters")
            return False
        
        # Step 2: Chunk text
        chunks = self.chunk_text(text, document_name, version, document_type)
        if not chunks:
            print("\n✗ INGESTION FAILED: No chunks created")
            return False
        
        # Step 3: Generate embeddings
        embedding_result = self.generate_embeddings(chunks)
        if embedding_result is None:
            print("\n✗ INGESTION FAILED: Embedding generation failed")
            return False
        
        embeddings, embedding_dim = embedding_result
        
        # Step 4: Insert into vector store
        if not self.insert_into_vector_store(chunks, embeddings):
            print("\n✗ INGESTION FAILED: Vector store insertion failed")
            return False
        
        # Step 5: Verify retrieval (optional)
        if retriever:
            keywords = [w for w in text.split() if len(w) > 5][:3]
            self.verify_retrieval(retriever, chunks, keywords)
        
        print("\n" + "=" * 70)
        print("✓ INGESTION COMPLETE")
        print("=" * 70)
        print(f"Successfully ingested: {document_name}")
        print(f"Chunks: {len(chunks)}")
        print(f"Embeddings: {embeddings.shape[0]}")
        print("=" * 70)
        
        return True


if __name__ == "__main__":
    # Test ingestion
    print("Document ingestion module loaded")
