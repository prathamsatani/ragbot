import React, { useState, useCallback, ChangeEvent, DragEvent } from 'react';
import { Upload, X } from 'lucide-react';

interface FileUploadProps {
  // Optional props for customization
  maxSize?: number; // in bytes
  allowedTypes?: string[]; // e.g., ['image/jpeg', 'image/png']
  maxFiles?: number;
  onFilesChange?: (files: File[]) => void;
}

interface FileWithPreview extends File {
  preview?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  maxSize = Infinity,
  allowedTypes,
  maxFiles = Infinity,
  onFilesChange,
}) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [files, setFiles] = useState<FileWithPreview[]>([]);

  const onDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateFile = (file: File): boolean => {
    if (file.size > maxSize) {
      alert(`File ${file.name} is too large`);
      return false;
    }
    
    if (allowedTypes && !allowedTypes.includes(file.type)) {
      alert(`File ${file.name} is not an allowed type`);
      return false;
    }
    
    return true;
  };

  const processFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(validateFile);
    
    if (files.length + validFiles.length > maxFiles) {
      alert(`Cannot add more than ${maxFiles} files`);
      return;
    }

    const processedFiles = validFiles.map(file => {
      // Add preview for image files
      if (file.type.startsWith('image/')) {
        return Object.assign(file, {
          preview: URL.createObjectURL(file)
        });
      }
      return file;
    });

    setFiles(prev => {
      const updatedFiles = [...prev, ...processedFiles];
      onFilesChange?.(updatedFiles);
      return updatedFiles;
    });
  };

  const onDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  }, [maxFiles, maxSize, allowedTypes, onFilesChange]);

  const onFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      processFiles(selectedFiles);
    }
  }, [maxFiles, maxSize, allowedTypes, onFilesChange]);

  const removeFile = useCallback((indexToRemove: number) => {
    setFiles(prev => {
      const updatedFiles = prev.filter((_, index) => index !== indexToRemove);
      onFilesChange?.(updatedFiles);
      
      // Clean up preview URLs
      if (prev[indexToRemove].preview) {
        URL.revokeObjectURL(prev[indexToRemove].preview!);
      }
      
      return updatedFiles;
    });
  }, [onFilesChange]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Clean up preview URLs when component unmounts
  React.useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, []);

  return (
    <div className="w-full mx-auto">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
      >
        <input
          type="file"
          multiple
          onChange={onFileChange}
          className="hidden"
          id="file-upload"
          accept={allowedTypes?.join(',')}
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center"
        >
          <Upload className="w-12 h-12 text-font-main mb-4" />
          <p className="text-lg mb-2 text-font-main">
            {isDragging ? 'Drop files here' : 'Drag & drop files here'}
          </p>
          <p className="text-sm text-gray-500">or click to select files</p>
        </label>
      </div>

      {files.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4 text-font-main">Selected Files</h3>
          <div className="space-y-3">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  {file.preview && (
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-gray-500 hover:text-red-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;