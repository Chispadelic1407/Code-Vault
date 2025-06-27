import { FileText, FileCode2, FileJson } from 'lucide-react';

export const getFileIcon = (fileName) => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
      return <FileCode2 size={18} className="text-yellow-400" />;
    case 'css':
    case 'scss':
    case 'sass':
    case 'less':
      return <FileCode2 size={18} className="text-blue-400" />;
    case 'json':
      return <FileJson size={18} className="text-green-400" />;
    case 'html':
    case 'htm':
      return <FileCode2 size={18} className="text-orange-400" />;
    case 'py':
      return <FileCode2 size={18} className="text-blue-300" />;
    case 'java':
      return <FileCode2 size={18} className="text-red-400" />;
    case 'cpp':
    case 'c':
    case 'h':
      return <FileCode2 size={18} className="text-purple-400" />;
    case 'php':
      return <FileCode2 size={18} className="text-indigo-400" />;
    case 'rb':
      return <FileCode2 size={18} className="text-red-500" />;
    case 'go':
      return <FileCode2 size={18} className="text-cyan-400" />;
    case 'rs':
      return <FileCode2 size={18} className="text-orange-500" />;
    case 'md':
    case 'markdown':
      return <FileText size={18} className="text-blue-300" />;
    case 'txt':
      return <FileText size={18} className="text-gray-300" />;
    case 'xml':
    case 'svg':
      return <FileCode2 size={18} className="text-green-300" />;
    case 'yml':
    case 'yaml':
      return <FileCode2 size={18} className="text-purple-300" />;
    default:
      return <FileText size={18} className="text-gray-400" />;
  }
};

export const downloadFile = (fileName, content) => {
  try {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading file:', error);
    throw new Error('Failed to download file');
  }
};

export const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
};

export const generateFileId = () => {
  return `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const generateProjectId = () => {
  return `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const validateFileName = (fileName) => {
  if (!fileName || !fileName.trim()) {
    return { isValid: false, error: 'File name cannot be empty' };
  }
  
  const invalidChars = /[<>:"/\|?*]/;
  if (invalidChars.test(fileName)) {
    return { isValid: false, error: 'File name contains invalid characters' };
  }
  
  if (fileName.length > 255) {
    return { isValid: false, error: 'File name is too long' };
  }
  
  return { isValid: true };
};

export const validateProjectName = (projectName) => {
  if (!projectName || !projectName.trim()) {
    return { isValid: false, error: 'Project name cannot be empty' };
  }
  
  if (projectName.length > 100) {
    return { isValid: false, error: 'Project name is too long' };
  }
  
  return { isValid: true };
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileExtension = (fileName) => {
  return fileName.split('.').pop()?.toLowerCase() || '';
};

export const isTextFile = (fileName) => {
  const textExtensions = [
    'txt', 'js', 'jsx', 'ts', 'tsx', 'css', 'scss', 'sass', 'less',
    'html', 'htm', 'json', 'xml', 'svg', 'md', 'markdown', 'yml', 'yaml',
    'py', 'java', 'cpp', 'c', 'h', 'php', 'rb', 'go', 'rs', 'sh', 'bat'
  ];
  
  const extension = getFileExtension(fileName);
  return textExtensions.includes(extension);
};
