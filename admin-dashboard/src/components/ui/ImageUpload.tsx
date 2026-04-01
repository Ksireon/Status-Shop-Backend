'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, FileImage } from 'lucide-react';

interface ImageUploadProps {
  onImageUpload: (file: File, label: string) => void;
  onImageRemove: (index: number) => void;
  images: { file?: File; url?: string; label: string; preview?: string }[];
}

export function ImageUpload({ onImageUpload, onImageRemove, images }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [label, setLabel] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        onImageUpload(file, label || 'Default');
        setLabel('');
      }
    });
  }, [onImageUpload, label]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        onImageUpload(file, label || 'Default');
      }
    });
    setLabel('');
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Label Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Label (e.g., White, Black) - optional"
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent-blue"
        />
      </div>

      {/* Drag & Drop Zone */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all duration-200
          ${isDragging 
            ? 'border-accent-blue bg-accent-blue/5' 
            : 'border-gray-300 dark:border-slate-600 hover:border-accent-blue hover:bg-gray-50 dark:hover:bg-slate-800'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="flex flex-col items-center gap-2">
          <div className={`
            p-4 rounded-full transition-colors
            ${isDragging ? 'bg-accent-blue/10' : 'bg-gray-100 dark:bg-slate-700'}
          `}>
            <Upload size={32} className={isDragging ? 'text-accent-blue' : 'text-gray-400'} />
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {isDragging ? 'Drop images here' : 'Drag & drop images here'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              or click to select files
            </p>
          </div>
          
          <p className="text-xs text-gray-400">
            Supports: JPG, PNG, GIF, WebP
          </p>
        </div>
      </div>

      {/* Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600">
                {image.preview || image.url ? (
                  <img
                    src={image.preview || image.url}
                    alt={image.label}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileImage size={32} className="text-gray-400" />
                  </div>
                )}
              </div>
              
              {/* Label Badge */}
              {image.label && (
                <div className="absolute bottom-2 left-2 right-2">
                  <span className="px-2 py-1 bg-black/70 text-white text-xs rounded-full truncate block">
                    {image.label}
                  </span>
                </div>
              )}
              
              {/* Remove Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onImageRemove(index);
                }}
                className="absolute top-2 right-2 p-1.5 bg-accent-red text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent-red/90"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
