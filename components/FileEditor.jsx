import React, { memo, useCallback, useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

const FileEditor = memo(({ 
  file, 
  onClose, 
  onSave 
}) => {
  const [content, setContent] = useState(file?.content || '');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setContent(file?.content || '');
    setHasChanges(false);
  }, [file]);

  const handleContentChange = useCallback((e) => {
    const newContent = e.target.value;
    setContent(newContent);
    setHasChanges(newContent !== file?.content);
  }, [file?.content]);

  const handleSave = useCallback(() => {
    if (file && hasChanges) {
      onSave(file.id, content);
      setHasChanges(false);
    }
  }, [file, content, hasChanges, onSave]);

  const handleKeyDown = useCallback((e) => {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  }, [handleSave, onClose]);

  const handleClose = useCallback(() => {
    if (hasChanges) {
      const shouldClose = window.confirm('You have unsaved changes. Are you sure you want to close?');
      if (!shouldClose) return;
    }
    onClose();
  }, [hasChanges, onClose]);

  if (!file) return null;

  return (
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-40">
      <div className="bg-gray-900 rounded-lg w-[90%] h-[90%] flex flex-col shadow-2xl border border-gray-700">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <h3 className="text-white font-bold text-lg">{file.name}</h3>
            {hasChanges && (
              <span className="text-xs bg-orange-600 text-white px-2 py-1 rounded">
                Unsaved changes
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className="bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
            >
              <Save size={16} />
              Save
            </button>
            
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white p-2 rounded hover:bg-gray-700 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-grow p-4">
          <textarea
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            className="w-full h-full bg-gray-800 text-white p-4 rounded resize-none font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-cyan-500 border border-gray-600"
            placeholder="Start typing your code..."
            spellCheck={false}
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 text-sm text-gray-400 flex justify-between items-center">
          <div>
            Press Ctrl+S to save, Esc to close
          </div>
          <div>
            Lines: {content.split('
').length} | Characters: {content.length}
          </div>
        </div>
      </div>
    </div>
  );
});

FileEditor.displayName = 'FileEditor';

export default FileEditor;
