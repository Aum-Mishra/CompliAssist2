# 🚀 Admin UI Quick Setup Guide

## Installation Steps

### 1. Install Dependencies
```bash
cd "d:\Work\Hack\PICT - Chatbot\Chatbot 2\Design Chatbot UI"
npm install
```

This will install axios and all other required dependencies.

### 2. Start the Backend
```bash
# In a new terminal
cd "d:\Work\Hack\PICT - Chatbot\Chatbot 2"
python api_server.py
```

Expected output:
```
Uvicorn running on http://127.0.0.1:8000
```

### 3. Start the Frontend
```bash
# In another terminal
cd "d:\Work\Hack\PICT - Chatbot\Chatbot 2\Design Chatbot UI"
npm run dev
```

Expected output:
```
VITE v6.3.5 ready in XXX ms

➜  Local:   http://localhost:5173/
```

### 4. Access the Application
- Open http://localhost:5173 in your browser
- You should see the Chat UI
- Click "Admin Panel" in the sidebar footer to access the admin dashboard

---

## Testing the Admin Features

### Test 1: Upload Progress Bar
1. Click "Admin Panel"
2. Select a test document (PDF, CSV, TXT, or MD)
3. Click "Upload Document"
4. **Expected**: Progress bar should show 0-100% smoothly
5. **Success**: Toast appears saying "✓ filename uploaded successfully"
6. **Verify**: Document appears in the list below

### Test 2: Document List
1. After uploading, check the documents list
2. **Expected**: Your uploaded file appears with size and version
3. Delete button should work (with confirmation)

### Test 3: System Status
1. At the top of admin page
2. **Expected**: 4 stat cards show:
   - Status: 🟢 online
   - Documents: count of indexed docs
   - Index Size: MB size of index
   - Model: LLM model being used

### Test 4: Navigation
1. Click "Admin Panel" → should go to admin
2. Click "← Back to Chat" → should return to chat
3. **Expected**: Smooth SPA transitions without page reload

### Test 5: Error Handling
1. Try uploading an unsupported file type
2. Try uploading without selecting a file
3. **Expected**: Proper error messages and disabled states

### Test 6: Rebuild Index
1. Click "Rebuild Index" button
2. Confirm the dialog
3. **Expected**: Shows "Rebuilding..." state
4. Success toast appears when complete

---

## Troubleshooting

### Issue: "Failed to fetch documents"
**Solution**: 
- Check backend is running on http://localhost:8000
- Check `.env` file has `VITE_API_URL=http://localhost:8000`

### Issue: Upload progress stuck at 0%
**Solution**:
- Check browser console for network errors (F12)
- Verify backend endpoint `/upload-document` exists
- Check CORS is enabled in backend

### Issue: Admin button not visible
**Solution**:
- Clear browser cache (Ctrl+Shift+Del)
- Restart frontend dev server
- Check ChatSidebar imports motion package

### Issue: Styling looks wrong
**Solution**:
- CSS custom variables not loaded - check `style.css` in src/
- Ensure Tailwind is properly compiled
- Run `npm run build` to verify build works

---

## File Changes Summary

### Created/Modified Files:
1. ✅ `src/app/AdminPage.tsx` - Complete redesign
2. ✅ `src/app/components/ChatSidebar.tsx` - Added admin navigation
3. ✅ `src/app/App.tsx` - Added motion import, styled back button
4. ✅ `package.json` - Added axios dependency

### No Changes Needed:
- Backend API endpoints (already implemented)
- Chat UI/functionality
- Vector database
- Document ingestion

---

## Key Features Implemented

✅ **Real-time Progress Tracking**
- Uses axios `onUploadProgress` callback
- Smooth animation from 0-100%

✅ **Success/Error Toasts**
- Auto-dismiss success after 2 seconds
- Error stays visible for user action

✅ **Document Management**
- List with metadata (size, version)
- Delete with confirmation
- Auto-refresh after operations

✅ **System Status**
- 4 stat cards with current system info
- Hover animations

✅ **Modern Design**
- Matches chat UI color scheme
- Animated backgrounds
- Smooth transitions

✅ **Clean Navigation**
- No page reloads
- Consistent styling
- Proper back button

---

## Performance Notes

- Large file uploads may take time (progress bar will show actual progress)
- Index rebuild may take 10-30 seconds depending on document count
- Document list fetched on page load and after operations

---

## Next Steps

Once testing is complete:
1. [ ] Test with actual documents from Data1
2. [ ] Verify document count matches Vector DB
3. [ ] Test long document names and file sizes
4. [ ] Verify proper error handling for network issues

---

**Ready to test? Run the three commands above and navigate to http://localhost:5173**
