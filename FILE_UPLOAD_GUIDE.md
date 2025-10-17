# 📎 File Upload & Preview Feature - Complete Guide

## ✨ Features Implemented

### 1. **File Upload Support**
- **Images**: JPEG, PNG, GIF, WebP
- **Documents**: PDF
- **Presentations**: PPT, PPTX
- **File Size Limit**: 10MB per file
- **Multiple Files**: Upload multiple files at once

### 2. **Base64 Encoding**
All files are converted to base64 and stored in the database as JSON strings with metadata:
```json
[
  {
    "data": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "name": "vacation.jpg",
    "type": "image/jpeg",
    "size": 245678
  }
]
```

### 3. **Preview Components**

#### For Images:
- Full image preview in chat
- Click to open in new tab
- File name and size display
- Responsive image sizing

#### For PDFs and PPTs:
- Document icon with file type
- File name and size
- Download button
- Professional card layout

## 🎨 UI Components

### FilePreview Component
**Location**: `src/components/FilePreview.js`

**Props**:
- `files`: JSON string or array of file objects
- `isOwn`: Boolean to align files (sent vs received)

**Features**:
- Automatic file type detection
- Different rendering for images vs documents
- Download functionality for documents
- Size formatting (B, KB, MB)

### Updated Messages Component
**Location**: `src/pages/Messages.js`

**New Features**:
- File attachment button (📎)
- Selected files preview before sending
- Remove individual files before sending
- Upload progress indication
- Send files with or without text

## 🔧 Technical Implementation

### 1. Utility Functions (`src/utils/supabase.js`)

```javascript
// Convert file to base64 with metadata
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      resolve({
        data: reader.result,
        name: file.name,
        type: file.type,
        size: file.size
      });
    };
    reader.onerror = (error) => reject(error);
  });
};

// Download base64 file
export const downloadBase64File = (base64Data, filename) => {
  const link = document.createElement('a');
  link.href = base64Data;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
```

### 2. Message Sending Flow

```javascript
const handleSendMessage = async (e) => {
  e.preventDefault();
  
  // Convert selected files to base64
  if (selectedFiles.length > 0) {
    const filesPromises = selectedFiles.map(file => fileToBase64(file));
    const filesData = await Promise.all(filesPromises);
    
    // Send message with files
    await sendMessage(
      chatId,
      senderId,
      messageText,
      JSON.stringify(filesData)
    );
  }
};
```

### 3. Database Schema

**messages table**:
```sql
CREATE TABLE messages (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_chat_id UUID NOT NULL REFERENCES user_chats(user_chat_id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    text TEXT,
    images TEXT, -- JSON string with file metadata and base64 data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE
);
```

## 📝 Usage Guide

### For Users:

1. **Attach Files**:
   - Click the 📎 button in the message input area
   - Select one or more files (images, PDFs, PPTs)
   - Files will appear in preview area

2. **Remove Files**:
   - Click ❌ on any file in the preview to remove it

3. **Send Files**:
   - Add optional text message
   - Click send button (📤)
   - Files will be uploaded and sent

4. **View Files**:
   - **Images**: Click to open full size in new tab
   - **Documents**: Click download button (⬇️) to download

### For Developers:

#### Add More File Types:
```javascript
const allowedTypes = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  // Add more types here:
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
];
```

#### Change File Size Limit:
```javascript
// In handleFileSelect function
if (file.size > 10 * 1024 * 1024) { // 10MB
  // Change to 20MB:
  if (file.size > 20 * 1024 * 1024) {
    alert(`File too large (max 20MB): ${file.name}`);
    return false;
  }
}
```

#### Customize File Icons:
```javascript
const getFileIcon = (type) => {
  if (type.startsWith('image/')) return '🖼️';
  if (type === 'application/pdf') return '📄';
  if (type.includes('presentation')) return '📊';
  if (type.includes('document')) return '📝';
  if (type.includes('spreadsheet')) return '📈'; // Add this
  return '📎';
};
```

## 🎯 File Structure

```
src/
├── components/
│   ├── FilePreview.js        # File preview component
│   └── FilePreview.css       # Preview styling
├── pages/
│   ├── Messages.js           # Updated with file upload
│   └── Messages.css          # Updated styling
└── utils/
    └── supabase.js           # File conversion utilities
```

## 🚀 Testing Checklist

- [ ] Upload single image
- [ ] Upload multiple images
- [ ] Upload PDF document
- [ ] Upload PPT presentation
- [ ] Send message with files only (no text)
- [ ] Send message with text and files
- [ ] Remove file before sending
- [ ] Download PDF from received message
- [ ] Download PPT from received message
- [ ] Click to view image in new tab
- [ ] Test file size limit (try 11MB file)
- [ ] Test unsupported file type
- [ ] Test real-time updates with files

## 🐛 Troubleshooting

### Files Not Uploading:
1. Check browser console for errors
2. Verify file size is under 10MB
3. Check file type is supported
4. Ensure Supabase connection is active

### Images Not Displaying:
1. Check if base64 data is valid
2. Verify JSON parsing is correct
3. Check browser console for image load errors

### Download Not Working:
1. Check if base64 data includes data URI prefix
2. Verify filename is set correctly
3. Check browser download permissions

## 💡 Performance Tips

1. **Compress Images**: Consider using image compression before base64 conversion
2. **Lazy Loading**: Load images only when visible
3. **Thumbnail Generation**: Create thumbnails for large images
4. **Progress Indicators**: Show upload progress for large files

## 🔐 Security Considerations

1. **Validate File Types**: Always validate on both client and server
2. **Scan for Viruses**: Implement virus scanning for uploaded files
3. **Size Limits**: Enforce strict size limits to prevent abuse
4. **Content Moderation**: Implement image moderation for inappropriate content

## 📊 Database Considerations

### Storage Size:
- Base64 encoding increases file size by ~33%
- 10MB file = ~13.3MB in database
- Monitor database size and implement cleanup policies

### Alternative: Cloud Storage
For production apps, consider storing files in:
- Supabase Storage
- AWS S3
- Cloudinary
- Firebase Storage

Store only file URLs in the database instead of base64.

## 🎨 Customization Ideas

1. **Image Gallery**: Show all images in a grid view
2. **File Categories**: Group files by type
3. **Search Files**: Search through shared files
4. **File Metadata**: Show upload date, sender info
5. **Thumbnails**: Generate thumbnails for faster loading
6. **Compression**: Automatic image compression
7. **Multiple Upload**: Drag and drop multiple files

---

**Happy Coding! 🚀**
