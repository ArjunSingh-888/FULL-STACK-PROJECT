import React from 'react';
import './FilePreview.css';
import { downloadBase64File } from '../utils/supabase';

const FilePreview = ({ files, isOwn }) => {
  if (!files) return null;

  const filesArray = typeof files === 'string' ? JSON.parse(files) : files;
  if (!filesArray || filesArray.length === 0) return null;

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type === 'application/pdf') return '📄';
    if (type.includes('presentation') || type.includes('powerpoint')) return '📊';
    if (type.includes('document') || type.includes('word')) return '📝';
    return '📎';
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleDownload = (file) => {
    downloadBase64File(file.data, file.name);
  };

  return (
    <div className="file-preview-container">
      {filesArray.map((file, index) => {
        const isImage = file.type.startsWith('image/');
        
        return (
          <div key={index} className={`file-preview-item ${isOwn ? 'own' : ''}`}>
            {isImage ? (
              <div className="image-preview">
                <img 
                  src={file.data} 
                  alt={file.name}
                  onClick={() => window.open(file.data, '_blank')}
                />
                <div className="image-info">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">{formatFileSize(file.size)}</span>
                </div>
              </div>
            ) : (
              <div className="document-preview">
                <div className="doc-icon">{getFileIcon(file.type)}</div>
                <div className="doc-info">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">{formatFileSize(file.size)}</span>
                </div>
                <button 
                  className="download-btn"
                  onClick={() => handleDownload(file)}
                  title="Download"
                >
                  ⬇️
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FilePreview;
