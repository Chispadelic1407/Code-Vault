import { useCallback } from 'react';
import { downloadFile, readFileAsText, generateFileId, validateFileName } from '../utils/fileUtils';

export const useFileOperations = (files, setFiles, selectedProjectId) => {
  const createFile = useCallback(async (fileName, content = `// File: ${fileName}
`) => {
    if (!fileName.trim() || !selectedProjectId) return;
    
    const validation = validateFileName(fileName);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }
    
    // Check if file already exists
    const existingFile = files.find(f => f.name === fileName);
    if (existingFile) {
      throw new Error('A file with this name already exists');
    }
    
    const newFile = {
      id: generateFileId(),
      name: fileName,
      content,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setFiles(prev => [...prev, newFile]);
    return newFile;
  }, [files, setFiles, selectedProjectId]);

  const deleteFile = useCallback(async (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  }, [setFiles]);

  const updateFileContent = useCallback(async (fileId, newContent) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId 
        ? { ...f, content: newContent, updatedAt: new Date() }
        : f
    ));
  }, [setFiles]);

  const handleDownloadFile = useCallback((fileName, content) => {
    try {
      downloadFile(fileName, content);
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }, []);

  const handleDownloadProjectZip = useCallback(async (projects, selectedProjectId) => {
    if (!window.JSZip) {
      throw new Error("JSZip is not available yet. Please try again in a few seconds.");
    }

    const zip = new JSZip();
    files.forEach(file => {
      zip.file(file.name, file.content);
    });

    try {
      const content = await zip.generateAsync({ type: "blob" });
      const projectName = projects.find(p => p.id === selectedProjectId)?.name || "project";
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error generating ZIP:", err);
      throw new Error("Failed to generate ZIP file");
    }
  }, [files]);

  const handleFileUpload = useCallback(async (event) => {
    if (!selectedProjectId) return;
    
    const uploadedFiles = event.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    const filePromises = Array.from(uploadedFiles).map(async (file) => {
      try {
        const content = await readFileAsText(file);
        return { name: file.name, content };
      } catch (error) {
        console.error(`Error reading file ${file.name}:`, error);
        throw new Error(`Failed to read file: ${file.name}`);
      }
    });

    try {
      const fileContents = await Promise.all(filePromises);
      const newFiles = fileContents.map((fileData, index) => ({
        id: generateFileId(),
        ...fileData,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      setFiles(prev => [...prev, ...newFiles]);
      return newFiles;
    } catch (error) {
      console.error("Error uploading files:", error);
      throw error;
    }
  }, [selectedProjectId, setFiles]);

  return {
    createFile,
    deleteFile,
    updateFileContent,
    handleDownloadFile,
    handleDownloadProjectZip,
    handleFileUpload
  };
};

export default useFileOperations;
