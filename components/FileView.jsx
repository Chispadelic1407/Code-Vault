import React, { memo, useCallback } from 'react';
import { FileText, Plus, Download, Edit, Trash2, Upload, Loader2, Box } from 'lucide-react';
import { getFileIcon } from '../utils/fileUtils';

const FileView = memo(({ 
  files, 
  selectedProjectId,
  projects,
  isDownloading,
  isUploading,
  onCreateFile,
  onDownloadFile,
  onDownloadProjectZip,
  onFileUpload,
  onEditFile,
  onDeleteFile,
  fileInputRef
}) => {
  const handleCreateFile = useCallback(() => {
    const fileName = prompt('Enter file name:');
    if (fileName) {
      onCreateFile(fileName);
    }
  }, [onCreateFile]);

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  if (!selectedProjectId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <FileText size={64} className="mb-4 opacity-50" />
        <h3 className="text-xl font-semibold mb-2">No Project Selected</h3>
        <p>Select a project from the sidebar to view its files</p>
      </div>
    );
  }

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileText className="text-cyan-400" />
          {selectedProject?.name || 'Project Files'}
        </h2>
        
        <div className="flex gap-2">
          <button
            onClick={handleCreateFile}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={18} /> New File
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={onFileUpload}
            className="hidden"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors disabled:bg-gray-500"
          >
            {isUploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
            Upload Files
          </button>
          
          <button
            onClick={onDownloadProjectZip}
            disabled={isDownloading || files.length === 0}
            className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors disabled:bg-gray-500"
          >
            {isDownloading ? <Loader2 className="animate-spin" size={18} /> : <Box size={18} />}
            Download ZIP
          </button>
        </div>
      </div>
      
      {files.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 pt-16">
          <FileText size={48} />
          <p className="mt-4 text-lg">This project is empty.</p>
          <p className="text-sm">You can upload existing files or create them from scratch.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-y-auto">
          {files.map(file => (
            <FileCard
              key={file.id}
              file={file}
              onDownload={onDownloadFile}
              onEdit={onEditFile}
              onDelete={onDeleteFile}
            />
          ))}
        </div>
      )}
    </div>
  );
});

const FileCard = memo(({ file, onDownload, onEdit, onDelete }) => {
  const handleDownload = useCallback(() => {
    onDownload(file.name, file.content);
  }, [file.name, file.content, onDownload]);

  const handleEdit = useCallback(() => {
    onEdit(file);
  }, [file, onEdit]);

  const handleDelete = useCallback(() => {
    onDelete(file.id);
  }, [file.id, onDelete]);

  return (
    <div className="bg-gray-800 p-4 rounded-lg flex flex-col justify-between hover:bg-gray-750 transition-colors">
      <div className="flex items-center gap-3 mb-4 min-w-0">
        {getFileIcon(file.name)}
        <span className="text-white font-medium truncate" title={file.name}>
          {file.name}
        </span>
      </div>
      
      <div className="flex items-center gap-2 mt-auto">
        <button
          onClick={handleDownload}
          className="flex-1 bg-gray-700 hover:bg-cyan-600 text-white py-1 px-2 rounded flex items-center justify-center gap-1 text-sm transition-colors"
        >
          <Download size={14} /> Download
        </button>
        
        <button
          onClick={handleEdit}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-1 px-2 rounded flex items-center justify-center gap-1 text-sm transition-colors"
        >
          <Edit size={14} /> Edit
        </button>
        
        <button
          onClick={handleDelete}
          className="bg-red-800/50 hover:bg-red-600 text-white p-2 rounded transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
});

FileView.displayName = 'FileView';
FileCard.displayName = 'FileCard';

export default FileView;
