import React, { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, FileText, Youtube, Globe } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Badge from '../ui/Badge';

const ContentUploadModal = ({ isOpen, onClose }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const detectUrlType = (url) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    return 'article';
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    setUploading(true);
    // Demo: simulate upload
    setTimeout(() => {
      setUploading(false);
      onClose();
      setFile(null);
      setUrl('');
      setTitle('');
    }, 2000);
  };

  const urlType = url ? detectUrlType(url) : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload Learning Material" size="md">
      <div className="space-y-5">
        {/* Drag & Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-md-drd p-8
            flex flex-col items-center justify-center gap-3
            cursor-pointer transition-all duration-200
            ${dragActive
              ? 'border-primary bg-primary/5'
              : file
                ? 'border-success bg-success/5'
                : 'border-border hover:border-border-hover hover:bg-white/[0.02]'
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.pptx"
            className="hidden"
            onChange={handleFileChange}
          />

          {file ? (
            <>
              <FileText size={32} className="text-success" />
              <p className="text-sm text-text-primary font-medium">{file.name}</p>
              <p className="text-caption text-text-muted">
                {(file.size / 1024 / 1024).toFixed(1)} MB
              </p>
              <button
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                className="text-caption text-danger hover:underline"
              >
                Remove
              </button>
            </>
          ) : (
            <>
              <Upload size={32} className="text-text-muted" />
              <p className="text-sm text-text-primary">
                Drag & drop your file here
              </p>
              <p className="text-caption text-text-muted">
                or click to browse
              </p>
              <p className="text-[10px] text-text-disabled">
                PDF, Image, PPT (max 20MB)
              </p>
            </>
          )}
        </div>

        {/* OR Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-dark-elevated text-text-muted text-caption">OR</span>
          </div>
        </div>

        {/* URL Input */}
        <div className="relative">
          <Input
            label="Paste URL"
            placeholder="YouTube or article URL..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          {urlType && (
            <div className="absolute right-3 top-[38px]">
              {urlType === 'youtube' ? (
                <Badge variant="danger">
                  <Youtube size={12} className="mr-1" /> YouTube
                </Badge>
              ) : (
                <Badge variant="info">
                  <Globe size={12} className="mr-1" /> Article
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Title */}
        <Input
          label="Title (optional)"
          placeholder="AI will auto-generate if empty"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* Processing indicator */}
        {uploading && (
          <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-md-drd">
            <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-sm text-primary-light">AI is analyzing your content...</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={uploading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={uploading}
            disabled={!file && !url}
          >
            Upload & Analyze
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ContentUploadModal;
