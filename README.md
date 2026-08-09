# CompliAssist - Enterprise AI Compliance Chatbot

## 🚀 Project Overview

CompliAssist is an advanced AI-powered compliance assistant that combines Retrieval-Augmented Generation (RAG) with enterprise-grade compliance enforcement. Built for organizations requiring strict adherence to regulatory frameworks, this system ensures all responses are grounded in approved documents while providing structured compliance analysis.

### 🎯 Key Features

- **RAG-Powered Knowledge Base**: Advanced document retrieval using FAISS vector embeddings
- **Enterprise Compliance Enforcement**: Automated compliance checking with structured response formatting
- **Video Transcription & Analysis**: Support for video content using Whisper AI
- **Session Management**: Multi-user session isolation with conversation context
- **Modern React Frontend**: Beautiful Material UI-based interface with real-time updates
- **Multi-Document Support**: PDF, CSV, Markdown, and text document ingestion
- **Knowledge Graph Integration**: Graph-based document relationship mapping
- **Audit Logging**: Comprehensive audit trail for all compliance decisions

### 🏢 Use Cases

- **Regulatory Compliance**: Ensure communications meet industry regulations
- **Policy Enforcement**: Automated checking against organizational policies
- **Document Review**: Quick compliance analysis of documents and communications
- **Training & Onboarding**: Interactive compliance training assistant
- **Risk Assessment**: Automated risk level assignment for content

## 🛠️ Tech Stack

### Backend
- **Python 3.9+**: Core application language
- **FastAPI**: High-performance API framework
- **FAISS**: Vector similarity search for document retrieval
- **Sentence Transformers**: Document embeddings
- **Ollama**: Local LLM inference (Mistral, Llama, etc.)
- **SQLite**: Document versioning and audit logging
- **Whisper**: Video transcription

### Frontend
- **React 18**: Modern UI framework
- **Material UI (MUI)**: Enterprise-grade component library
- **Vite**: Fast build tool and dev server
- **TailwindCSS**: Utility-first styling
- **Radix UI**: Accessible component primitives
- **Axios**: HTTP client for API communication

### Infrastructure
- **Railway**: Cloud deployment platform
- **Docker**: Containerization support

## 📋 Prerequisites

- Python 3.9 or higher
- Node.js 16+ and npm/pnpm
- Ollama (for local LLM inference)
- FFmpeg (for video processing)

## 🚀 Quick Start

### 1. Backend Setup

```bash
# Install Python dependencies
pip install -r requirements.txt

# Install Ollama (if not already installed)
# Visit: https://ollama.ai/download

# Pull required LLM model
ollama pull mistral

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Initialize the knowledge base
python initialize_kb.py

# Start the API server
python main.py
```

The API will be available at `http://localhost:8000`

### 2. Frontend Setup

```bash
cd "Design Chatbot UI"

# Install dependencies
npm install
# or
pnpm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 3. Upload Documents

Use the API endpoint or frontend UI to upload your compliance documents:
- PDF files
- CSV files (for restricted entities registries)
- Markdown documentation
- Plain text files

## 📁 Project Structure

```
CompliAssist/
├── api_server.py              # FastAPI application and endpoints
├── main.py                    # Application entry point
├── config.py                  # Configuration management
├── loaders/                   # Document loading modules
│   ├── pdf_loader.py
│   ├── csv_loader.py
│   ├── markdown_loader.py
│   └── text_loader.py
├── vector_store.py            # FAISS vector database
├── llm_interface.py           # LLM integration (Ollama)
├── compliance_*.py             # Compliance enforcement modules
├── video_*.py                 # Video processing modules
├── chat_session_manager.py    # Session management
├── graph_service.py          # Knowledge graph service
├── Design Chatbot UI/         # React frontend
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── Data/                      # Data directories
│   ├── documents/            # Uploaded documents
│   ├── vector_index/         # FAISS index files
│   └── sessions/             # Chat sessions
└── requirements.txt          # Python dependencies
```

## 🔧 Configuration

Key configuration options in `config.py`:

- **LLM Model**: `mistral:latest` (configurable via `LLM_MODEL`)
- **Embeddings Model**: `sentence-transformers/all-MiniLM-L6-v2`
- **API Port**: `8000` (configurable via `API_PORT`)
- **Similarity Threshold**: `0.4` for document retrieval
- **Chunk Size**: `500` characters for document chunking

## 📊 API Endpoints

### Core Endpoints

- `POST /ask` - Ask compliance questions
- `POST /upload` - Upload documents
- `GET /sessions` - List chat sessions
- `DELETE /sessions/{session_id}` - Delete session
- `POST /video/upload` - Upload video for transcription
- `GET /health` - Health check

### Request Example

```bash
curl -X POST "http://localhost:8000/ask" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Is this communication compliant with our policy?",
    "user_id": "user123",
    "session_id": "session456"
  }'
```

## 🎨 Frontend Features

- **Real-time Chat**: Streaming responses with typing indicators
- **Document Upload**: Drag-and-drop document upload interface
- **Session Management**: View and manage chat history
- **Compliance Dashboard**: Visual compliance status indicators
- **Video Support**: Video upload and transcription interface
- **Responsive Design**: Mobile-friendly interface
- **Dark Mode**: Theme toggle support

## 🔒 Security Features

- **Session Isolation**: User sessions are completely isolated
- **Compliance Enforcement**: All responses pass through compliance checks
- **Audit Logging**: All decisions are logged for accountability
- **Document Versioning**: Track document changes over time
- **Restricted Entity Detection**: Automatic detection of restricted entities

## 📈 Performance

- **Sub-second Response**: Typical query response under 1 second
- **Scalable Architecture**: Horizontal scaling support
- **Efficient Retrieval**: FAISS-based vector similarity search
- **Background Processing**: Async document ingestion

## 🚢 Deployment

### Railway Deployment

1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy using the provided `railway.json` configuration
4. Railway will automatically build and deploy

### Environment Variables

Required for production:
- `LLM_MODEL` - LLM model to use
- `LLM_BASE_URL` - Ollama server URL
- `API_PORT` - API server port
- `EMBEDDINGS_MODEL` - Embeddings model name

## 🤝 Contributing

This project was developed as part of a 24-hour hackathon. Contributions are welcome!

## 📝 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- **Ollama** - Local LLM inference
- **FAISS** - Vector similarity search
- **Material UI** - React component library
- **Sentence Transformers** - Document embeddings

## 📧 Contact

For questions or support, please open an issue in the GitHub repository.

---

**Built with ❤️ for Enterprise Compliance**
