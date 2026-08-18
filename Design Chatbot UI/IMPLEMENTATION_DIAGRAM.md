# 📊 IMPLEMENTATION ARCHITECTURE DIAGRAM

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CHATBOT SYSTEM                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌───────────────────────────────┐  ┌──────────────────────┐   │
│  │     CHAT INTERFACE             │  │   ADMIN DASHBOARD    │   │
│  │                               │  │                      │   │
│  │ ┌──────────────────────────┐  │  │ ┌────────────────┐   │   │
│  │ │  Messages Display         │  │  │ System Status   │   │   │
│  │ │  (real-time chat)        │  │  │ (4 stat cards)  │   │   │
│  │ └──────────────────────────┘  │  │ └────────────────┘   │   │
│  │                               │  │                      │   │
│  │ ┌──────────────────────────┐  │  │ ┌────────────────┐   │   │
│  │ │  Input Area              │  │  │ Upload Section  │   │   │
│  │ │ [🎥] [Text Input] [✓]   │  │  │ [File] [Upload] │   │   │
│  │ │                          │  │  │ [Progress Bar]  │   │   │
│  │ │  Video Selection:        │  │  │ └────────────────┘   │   │
│  │ │ 📹 video.mp4 2.4MB [✕]  │  │  │                      │   │
│  │ └──────────────────────────┘  │  │ ┌────────────────┐   │   │
│  │                               │  │ Documents List  │   │   │
│  │                               │  │ [📄] [doc 1]    │   │   │
│  │                               │  │ [📄] [doc 2]    │   │   │
│  │                               │  │ └────────────────┘   │   │
│  └───────────────────────────────┘  └──────────────────────┘   │
│                                                                   │
│  Navigation: [Admin Panel] ←→ [← Back to Chat]                 │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Structure

```
App.tsx
├── currentPage: 'chat' | 'admin'
│
├── Page: 'chat'
│   └── ChatSidebar
│       ├── Chat History
│       ├── New Chat Button
│       └── [Admin Panel Button] ← Navigation to admin
│   
│   └── ChatArea
│       ├── Messages Display
│       ├── Video Selection Card (if selectedVideo)
│       │   ├── Video Icon
│       │   ├── File Name
│       │   ├── File Size
│       │   └── Clear Button
│       ├── Input Form
│       │   ├── [Video Button] ← Opens file browser
│       │   ├── Text Input
│       │   ├── Send Button
│       │   └── Hidden File Input
│       └── Auto-scroll to latest
│
└── Page: 'admin'
    └── AdminPage
        ├── Back Button
        ├── System Status Cards
        ├── Upload Section
        │   ├── File Input
        │   ├── Progress Bar
        │   ├── Upload Button
        │   └── Rebuild Index Button
        ├── Document List
        │   ├── [Document 1] [Delete]
        │   ├── [Document 2] [Delete]
        │   └── [Document N] [Delete]
        └── Toast Notifications
```

---

## Data Flow Diagrams

### Video Upload Flow

```
User Action         Component State      UI Update
─────────────────────────────────────────────────
Click [🎥]     →    -                 →  File Browser Opens
                                        (system dialog)
         ↓
Select Video   →    selectedVideo = File  →  Video Card Shows
                                              - Name
                                              - Size
                                              - Clear Button
         ↓
Click Clear    →    selectedVideo = null  →  Video Card Hides
                                              Button returns
                                              to normal color
         ↓
Send Message   →    -                 →  Message sent
                                        Video state
                                        available for
                                        backend
```

### Admin Upload Progress Flow

```
User Action         State Update         UI Update
─────────────────────────────────────────────────
Select File   →    selectedFile = File  →  File name shown
                                           Upload button enabled
         ↓
Click Upload  →    uploadStatus = 'uploading'  →  
               setUploadProgress(0)                Spinner starts
               isLoading = true                    Button disabled
         ↓
Bytes Upload  →    uploadProgress = N% →  Progress bar animates
(every event)      (0, 25, 50, 75%)        Shows: "Uploading... N%"
         ↓
Upload Done   →    uploadProgress = 100% →  Progress bar fills to 100%
(xhr.onload)       uploadStatus = 'success'   Success toast appears
               setSuccessMessage(...)        Documents list refreshes
         ↓
Auto-reset    →    uploadStatus = 'idle'    →  UI returns to normal
(after 2sec)       uploadProgress = 0
               selectedFile = null
               successMessage = ''
```

---

## State Management

### ChatArea Component

```javascript
const [input, setInput]
  → Text input value for messages
  → Cleared after sending

const [selectedVideo, setSelectedVideo]
  → Selected video file (or null)
  → Updated when user selects file
  → Cleared when "Clear" button clicked
  → Accessible for backend integration

const videoInputRef
  → React ref to hidden file input
  → Used to trigger file browser
  → Reset when video cleared
```

### AdminPage Component

```javascript
const [selectedFile, setSelectedFile]
  → Document to upload

const [uploadProgress, setUploadProgress]
  → 0-100% progress percentage
  → Updated every XMLHttpRequest progress event

const [uploadStatus, setUploadStatus]
  → 'idle' | 'uploading' | 'success' | 'error'
  → Controls UI state (button disabled, progress bar visible, etc)

const [isLoading, setIsLoading]
  → True during any operation
  → Disables buttons during upload

const [successMessage, setSuccessMessage]
  → Success toast message
  → Auto-clears after 2 seconds

const [errorMessage, setErrorMessage]
  → Error toast message
  → Persists until user dismisses or clears
```

---

## Upload Progress Technical Details

### XMLHttpRequest Implementation

```
User clicks Upload
        ↓
Create XMLHttpRequest
        ↓
Register 'progress' event listener
        ↓
addEventListener('progress', (e) => {
  if (e.lengthComputable) {
    percent = (e.loaded * 100) / e.total
    setUploadProgress(percent)
  }
})
        ↓
xhr.upload emits 'progress' events
as bytes are sent
        ↓
Progress state updates in real-time
        ↓
UI progress bar animates: 0% → 25% → 50% → 75% → 100%
        ↓
xhr.onload fires
        ↓
setUploadProgress(100)
setUploadStatus('success')
Refresh document list
        ↓
Show success toast for 2 seconds
Reset all states
```

---

## Design System Integration

### Colors Used

```
--koopa-green      Primary action color
├── Buttons when active
├── Progress bar
├── Video button highlight
├── Border highlights
└── Icon color

--dynamic-black    Card backgrounds
├── Input area
├── Video card
└── Modal backgrounds

--black-lacquer    Borders & secondary BG
├── Form borders
├── Button borders
└── Inactive states

--beluga           Heading text
├── Titles
├── File names
└── Primary text

--zinc-dust        Secondary text
├── Descriptions
├── Timestamps
└── Disabled states

--whitent          Main background
├── Page background
└── Overall theme
```

---

## API Integration Points

### Endpoints Used

```
GET  /admin/documents
└─ Returns: [{ name, size, version, uploadedAt }, ...]
   Used by: Document list display

POST /upload-document (FormData)
├─ Input: FormData with 'file' field
├─ Output: { success: bool, message: string }
└─ Progress: Tracked via XMLHttpRequest.upload

DELETE /admin/documents/{name}
└─ Deletes a document by name

GET /admin/system-status
└─ Returns: { status, uptime, documents_indexed, vector_index_size, ... }
   Used by: System status cards

POST /rebuild-index
└─ Rebuilds the FAISS vector index
```

---

## Error Handling Flow

```
User attempts action
        ↓
Try block executes
        ↓
Success?
├─ YES: Update success state, show toast, refresh data
└─ NO: Catch error
        ↓
Extract error message
        ↓
Update error state
        ↓
Show error toast
        ↓
User can:
├─ Retry the action
├─ Clear error (automatically after timeout)
└─ Take corrective action
```

---

## Navigation Architecture

```
User Interface
├── ChatSidebar
│   ├── Chat List
│   └── [Admin Panel Button]
│       └── onClick → setCurrentPage('admin')
│
├── App.tsx checks currentPage
│   ├── 'chat' → Render ChatArea + ChatSidebar
│   └── 'admin' → Render AdminPage + Back Button
│
└── Back Button in AdminPage
    └── onClick → setCurrentPage('chat')
```

---

## Responsive Design Breakpoints

```
Mobile              Tablet              Desktop
(< 768px)          (768-1024px)        (> 1024px)
─────────────────────────────────────────────────
┌────────┐         ┌──────────┐        ┌──────────────┐
│ Sidebar│         │ Sidebar  │        │   Sidebar    │
│ Chat   │         │ Chat     │        │   Chat       │
│ Input  │         │ Input    │        │   Input      │
└────────┘         └──────────┘        └──────────────┘

Stack            Side-by-side        Side-by-side
Video below      Video inline        Video inline
Full width       Constrained         Max width 3xl
```

---

## Performance Optimizations

```
1. useRef for video input
   └─ Avoids re-render on file browser interaction

2. Conditional rendering
   └─ Video card only renders if selectedVideo exists

3. Event handler cleanup
   └─ Proper cleanup on component unmount

4. Progress debouncing
   └─ XMLHttpRequest naturally throttles progress events

5. State batching
   └─ React batches multiple setState calls

6. Memoized animations
   └─ Motion library optimizes animation rendering
```

---

## Testing Strategy

```
Unit Tests
├── Video selection state updates
├── File filtering (video MIME types)
├── Progress calculation accuracy
├── Error handling
└── State cleanup

Integration Tests
├── Button click → File browser
├── File selection → UI update
├── Clear button → State reset
├── Upload flow → Progress bar → Success

E2E Tests
├── Full video upload workflow
├── Full admin upload workflow
├── Navigation between pages
├── Error scenarios
└── Browser compatibility
```

---

**Last Updated**: 2025  
**Version**: Complete Implementation  
**Status**: Production Ready
