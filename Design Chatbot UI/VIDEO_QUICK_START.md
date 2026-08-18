🎬 DESIGN CHATBOT UI - VIDEO UPLOAD QUICK START
════════════════════════════════════════════════════════════════════════════════

⚡ 3-STEP DEPLOYMENT

STEP 1: Start Backend
────────────────────
Terminal 1:
  cd "d:\Work\Hack\PICT - Chatbot\Chatbot 2"
  python api_server.py

Wait for: "INFO: Application startup complete"

STEP 2: Start Frontend
──────────────────────
Terminal 2:
  cd "d:\Work\Hack\PICT - Chatbot\Chatbot 2\Design Chatbot UI"
  npm run dev

Open: http://localhost:5173

STEP 3: Test Video Upload
──────────────────────────
1. Click video icon (📹) in chat input
2. Select any MP4 video file
3. Wait for "Video Ready" message
4. Ask a question about the video
5. Get back video-specific answer!

════════════════════════════════════════════════════════════════════════════════

✨ FEATURES NOW AVAILABLE

✅ Upload Videos Directly in Chat
   • Click video icon
   • Select MP4, MOV, AVI, WebM, or MKV
   • Auto-upload starts immediately

✅ Real-Time Progress Tracking
   • See: "Uploading..." → "Transcribing..." → "Embedding..." → "Ready"
   • Loading animation during processing
   • Error alerts if something fails

✅ Video Context Mode
   • "🎥 Video Context Active: meeting.mp4"
   • All queries search ONLY this video
   • No SOP documents mixed in
   • Clear context button when done

✅ Compliance Still Enforced
   • Every query checked against rules
   • Restricted entities still blocked
   • Approved alternatives suggested
   • Audit trail recorded

✅ Grounded Responses
   • LLM only uses video context
   • No hallucination
   • Citations include video filename
   • Compliance format maintained

════════════════════════════════════════════════════════════════════════════════

📊 WHAT HAPPENS BEHIND THE SCENES

When you upload a video:
  MP4 → FFmpeg → WAV → Whisper → Text
  ↓
  Chunk into ~800 token segments
  ↓
  Embed each chunk
  ↓
  Insert into FAISS with metadata:
    {source: "video", video_id: "...", filename: "..."}
  ↓
  Ready for queries!

When you ask a question:
  Your question + video_id
  ↓
  Backend compliance check
  ↓
  FAISS search ONLY video chunks (no SOP mix)
  ↓
  LLM generates answer with video context
  ↓
  Grounding validation
  ↓
  Structured response with compliance format

════════════════════════════════════════════════════════════════════════════════

🎯 USER WORKFLOW

┌─ USER CLICKS VIDEO ICON
│
├─ FILE PICKER OPENS
│  (accept: MP4, MOV, AVI, WebM, MKV)
│
├─ FILE SELECTED
│  │
│  └─→ "Uploading..."
│       • File sent to backend
│       • Progress: 10%
│
├─ TRANSCRIPTION BEGINS
│  │
│  └─→ "Transcribing..."
│       • FFmpeg extracts audio.wav
│       • Whisper transcribes
│       • Progress: 40%
│
├─ EMBEDDING
│  │
│  └─→ "Embedding..."
│       • Transcript chunked
│       • Chunks embedded
│       • Progress: 70%
│
├─ INDEXING
│  │
│  └─→ "Indexing..."
│       • Chunks inserted to FAISS
│       • Metadata attached
│       • Progress: 90%
│
├─ VIDEO READY
│  │
│  └─→ "✅ Video ready! 15 chunks indexed."
│       • UI shows: "🎥 Video Context Active: meeting.mp4"
│       • Chat ready for questions
│
└─ USER ASKS QUESTION
   │
   ├─ "What did they discuss?"
   │  + video_id automatically included
   │
   ├─ BACKEND SEARCHES VIDEO ONLY
   │  (not SOP documents)
   │
   └─ RESPONSE: "Based on the video: ..."
      (grounded, compliant, cited)

════════════════════════════════════════════════════════════════════════════════

🎨 UI ELEMENTS

Video Button (Left side of input):
  • Gray when no video: Click to upload
  • Green when video active: Click to clear
  • Spinning when uploading: In progress

Upload Status Bar:
  Shows: "Uploading... ▰▰▰░░░░░░░ 30%"
  Until: "✅ Video Ready!"

Video Context Indicator:
  Shows: "🎥 Video Context Active: meeting.mp4 [Clear]"
  Green border, always visible when video active

Messages:
  • "🎥 Video uploaded: meeting.mp4"
  • "Video is now indexed and ready for questions."

Error Messages:
  • "Invalid file type - please select MP4, MOV, AVI, WebM, or MKV"
  • "Upload failed: [error details]"
  • "Backend connection failed"

════════════════════════════════════════════════════════════════════════════════

⏱️ TIMING

First Time Setup:
  • Whisper model download: 5-10 minutes (one-time)
  • First upload: 10-15 minutes for 1-hour video

Regular Use:
  • Upload: 3-8 minutes for 1-hour video
  • Query: 2-3 seconds
  • Response time: Same as SOP queries

════════════════════════════════════════════════════════════════════════════════

❓ FAQ

Q: Can I upload multiple videos?
A: Yes! Each gets a unique ID. But the UI switches context to the newest one.
   To query a different video, you'd need to clear and re-upload.
   (Future enhancement: video selector in UI)

Q: What if backend is offline?
A: Error message appears: "Backend connection failed"
   Check terminal 1 that backend is running

Q: Can I ask about both video AND SOPs?
A: No - by design! Video context isolates queries to avoid mixing contexts.
   This ensures grounded, accurate responses.

Q: What if Whisper model download stalls?
A: Check internet connection. Restart backend and try again.
   Model is cached after first download.

Q: How do I clear video context?
A: Click "Clear" button next to video indicator at top of chat.
   Confirm in dialog.
   Next query will search SOPs only.

Q: Is there a file size limit?
A: Not set in code, but Whisper handles most video sizes.
   Recommend < 1 GB for smooth operation.

Q: Can I upload while another video is processing?
A: Wait for first one to finish. UI disables video button during upload.

Q: How are responses formatted?
A: Same as SOP responses - structured compliance format with citations.
   But sources will show "Video: filename.mp4 (Chunk X)"

Q: Is everything still offline?
A: Yes! 100% offline. No external APIs, cloud, or internet required.
   Ollama, FFmpeg, and Whisper all run locally.

════════════════════════════════════════════════════════════════════════════════

🚨 TROUBLESHOOTING QUICK FIXES

"Video button not responding"
  → Refresh browser
  → Check backend logs for errors
  → Verify API endpoint: curl http://localhost:8000/video/list

"Upload hangs forever"
  → Whisper is downloading model (first time, 10 minutes)
  → Wait or restart and try smaller video
  → Check disk space

"'Transcribing' doesn't progress"
  → Normal - Whisper processing
  → For 1-hour video: 2-5 minutes
  → Check backend console for activity

"Backend error on upload"
  → FFmpeg not installed: Install from ffmpeg.org
  → Disk space full: Clear space
  → Invalid video: Use standard MP4

"Video queries return SOP docs"
  → Bug - video_id not being sent
  → Check browser console: Open DevTools → Network
  → Look for /ask request, verify video_id in JSON
  → Restart backend and frontend

"Can't click Clear button"
  → Try refreshing page
  → Check browser console for JS errors
  → Restart if needed

════════════════════════════════════════════════════════════════════════════════

📁 FILE LOCATIONS

Video files stored:
  /data/videos/{video_id}/
  ├── original.mp4        (uploaded file)
  ├── audio.wav           (extracted audio)
  ├── transcript.txt      (full text)
  └── metadata.json       (chunk metadata)

Video registry:
  /data/video_registry.json  (all videos listed)

Audit logs:
  /logs/video_audit/      (query history)

════════════════════════════════════════════════════════════════════════════════

✅ READY TO USE!

Deploy now with the 3 steps above.

Full documentation: VIDEO_INTEGRATION_COMPLETE.md

Questions? Check the detailed guide for architecture, API reference,
testing checklist, and comprehensive troubleshooting.

════════════════════════════════════════════════════════════════════════════════
