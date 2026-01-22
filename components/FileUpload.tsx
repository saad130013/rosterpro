
import React, { useRef } from 'react';
import { Upload, FileText, X } from 'lucide-react';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  selectedFiles: File[];
  onRemoveFile: (index: number) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFilesSelected, selectedFiles, onRemoveFile }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFilesSelected(Array.from(e.target.files));
    }
  };

  return (
    <div className="w-full">
      <div 
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center cursor-pointer hover:bg-blue-50 transition-colors group"
      >
        <input 
          type="file" 
          ref={inputRef} 
          multiple 
          accept=".xlsx, .xls" 
          className="hidden" 
          onChange={handleFileChange} 
        />
        <div className="flex flex-col items-center gap-3">
          <div className="bg-blue-100 p-4 rounded-full text-blue-600 group-hover:scale-110 transition-transform">
            <Upload size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Drop monthly roster files here</h3>
          <p className="text-gray-500 text-sm">Select one or more Excel files (e.g., DUTY ROSTER January 2025.xlsx)</p>
          <button className="mt-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Browse Files
          </button>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-6 space-y-2">
          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex justify-between items-center">
            <span>Selected Files ({selectedFiles.length})</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {selectedFiles.map((file, idx) => (
              <div key={idx} className="flex items-center justify-between bg-white border border-gray-200 p-3 rounded-lg shadow-sm group">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="text-blue-500 shrink-0">
                    <FileText size={20} />
                  </div>
                  <span className="text-sm text-gray-700 truncate font-medium">{file.name}</span>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); onRemoveFile(idx); }}
                  className="text-gray-400 hover:text-red-500 p-1"
                >
                  <X size={16} />
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
