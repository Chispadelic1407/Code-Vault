import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Folder, Sparkles, Loader2 } from 'lucide-react';

// Import optimized components
import ProjectSidebar from './components/ProjectSidebar';
import FileView from './components/FileView';
import AICoderView from './components/AICoderView';
import FileEditor from './components/FileEditor';
import { CreateProjectModal } from './components/Modal';

// Import custom hooks and utilities
import useFileOperations from './hooks/useFileOperations';
import { generateProjectId, validateProjectName } from './utils/fileUtils';
// External dependency loader
const addJSZipScript = () => {
    if (!document.getElementById('jszip-script')) {
        const script = document.createElement('script');
        script.id = 'jszip-script';
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"; 
        script.async = true;
        document.head.appendChild(script);
    }
};

// Main Application Component
const App = () => {
    // Application state
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [projects, setProjects] = useState([]);
    const [files, setFiles] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [newProjectName, setNewProjectName] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreatingProject, setIsCreatingProject] = useState(false);
    
    // Tab and loading states
    const [activeTab, setActiveTab] = useState('files');
    const [isDownloading, setIsDownloading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    
    // AI Assistant states
    const [aiFileId, setAiFileId] = useState('');
    const [aiFileContent, setAiFileContent] = useState('');
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [isAIGenerating, setIsAIGenerating] = useState(false);
    
    const fileInputRef = useRef(null);

    // Custom hooks
    const fileOperations = useFileOperations(files, setFiles, selectedProjectId);

    // Memoized filtered files for current project
    const currentProjectFiles = useMemo(() => {
        return files.filter(file => file.projectId === selectedProjectId);
    }, [files, selectedProjectId]);
    // Initialize application
    useEffect(() => {
        addJSZipScript();
        loadPersistedData();
        setTimeout(() => setIsLoading(false), 1000);
    }, []);

    // Update AI file content when selection changes
    useEffect(() => {
        if (aiFileId) { 
            const file = currentProjectFiles.find(f => f.id === aiFileId); 
            setAiFileContent(file?.content || ''); 
        } else { 
            setAiFileContent(''); 
        }
    }, [aiFileId, currentProjectFiles]);

    // Persist data to localStorage
    useEffect(() => {
        const dataToSave = { projects, files };
        localStorage.setItem('codeVaultData', JSON.stringify(dataToSave));
    }, [projects, files]);

    // Load persisted data
    const loadPersistedData = useCallback(() => {
        try {
            const savedData = localStorage.getItem('codeVaultData');
            if (savedData) {
                const { projects: savedProjects, files: savedFiles } = JSON.parse(savedData);
                setProjects(savedProjects || []);
                setFiles(savedFiles || []);
            }
        } catch (error) {
            console.error('Error loading persisted data:', error);
        }
    }, []);

    // Project operations
    const handleCreateProject = useCallback(async () => {
        const validation = validateProjectName(newProjectName);
        if (!validation.isValid) {
            alert(validation.error);
            return;
        }

        // Check if project already exists
        const existingProject = projects.find(p => p.name === newProjectName);
        if (existingProject) {
            alert('A project with this name already exists');
            return;
        }

        setIsCreatingProject(true);
        try {
            const newProject = {
                id: generateProjectId(),
                name: newProjectName,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            setProjects(prev => [...prev, newProject]);
            setNewProjectName('');
            setIsModalOpen(false);
            setSelectedProjectId(newProject.id);
        } catch (error) {
            console.error('Error creating project:', error);
            alert('Failed to create project');
        } finally {
            setIsCreatingProject(false);
        }
    }, [newProjectName, projects]);

    const handleDeleteProject = useCallback(async (projectId) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;

        const confirmDelete = window.confirm(`Are you sure you want to delete "${project.name}" and all its files?`);
        if (!confirmDelete) return;

        try {
            setProjects(prev => prev.filter(p => p.id !== projectId));
            setFiles(prev => prev.filter(f => f.projectId !== projectId));
            
            if (selectedProjectId === projectId) {
                setSelectedProjectId(null);
                setSelectedFile(null);
            }
        } catch (error) {
            console.error('Error deleting project:', error);
            alert('Failed to delete project');
        }
    }, [projects, selectedProjectId]);

    // File operations with error handling
    const handleCreateFile = useCallback(async (fileName) => {
        try {
            const newFile = await fileOperations.createFile(fileName);
            if (newFile) {
                // Add project association
                setFiles(prev => prev.map(f => 
                    f.id === newFile.id ? { ...f, projectId: selectedProjectId } : f
                ));
            }
        } catch (error) {
            alert(error.message);
        }
    }, [fileOperations, selectedProjectId]);
    const handleFileUpload = useCallback(async (event) => {
        setIsUploading(true);
        try {
            const newFiles = await fileOperations.handleFileUpload(event);
            if (newFiles) {
                // Add project association
                setFiles(prev => prev.map(f => {
                    const uploadedFile = newFiles.find(nf => nf.id === f.id);
                    return uploadedFile ? { ...f, projectId: selectedProjectId } : f;
                }));
            }
        } catch (error) {
            alert(error.message);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    }, [fileOperations, selectedProjectId]);

    const handleDownloadProjectZip = useCallback(async () => {
        setIsDownloading(true);
        try {
            await fileOperations.handleDownloadProjectZip(projects, selectedProjectId);
        } catch (error) {
            alert(error.message);
        } finally {
            setIsDownloading(false);
        }
    }, [fileOperations, projects, selectedProjectId]);

    // AI operations
    const handleSendMessageToAI = useCallback(async () => {
        if (!aiFileContent || !chatInput.trim()) return;

        setChatMessages(prev => [...prev, { role: 'user', content: chatInput }]);
        setIsAIGenerating(true);

        try {
            // Mock response for demo purposes
            setTimeout(() => {
                setChatMessages(prev => [...prev, { 
                    role: 'assistant', 
                    content: "I'm a demo AI assistant. In a real implementation, this would connect to an actual AI service to analyze your code and provide helpful responses." 
                }]);
                setIsAIGenerating(false);
                setChatInput('');
            }, 2000);
        } catch (error) {
            console.error('Error communicating with AI:', error);
            setChatMessages(prev => [...prev, { 
                role: 'assistant', 
                content: "There was an error processing your request." 
            }]);
            setIsAIGenerating(false);
            setChatInput('');
        }
    }, [aiFileContent, chatInput]);

    // Memoized event handlers
    const handleProjectSelect = useCallback((projectId) => {
        setSelectedProjectId(projectId);
        setSelectedFile(null);
        setAiFileId('');
    }, []);

    const handleOpenModal = useCallback(() => {
        setIsModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setNewProjectName('');
    }, []);

    const handleEditFile = useCallback((file) => {
        setSelectedFile(file);
    }, []);

    const handleCloseEditor = useCallback(() => {
        setSelectedFile(null);
    }, []);

    const handleSaveFile = useCallback(async (fileId, content) => {
        try {
            await fileOperations.updateFileContent(fileId, content);
        } catch (error) {
            alert('Failed to save file: ' + error.message);
        }
    }, [fileOperations]);

    // Main render function
    if (isLoading) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-900 text-white">
                <Loader2 className="animate-spin text-cyan-400" size={48} />
                <p className="mt-4 text-lg">Loading Code Vault...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-900 text-white">
                <p className="mt-4 text-lg text-red-500">Error: {error}</p>
                <p className="text-gray-400 mt-2">Please refresh the page to try again.</p>
            </div>
        );
    }

    return (
        <div className="h-screen w-full bg-gray-900 text-white font-sans flex flex-col items-center justify-center p-4">
            <main className="w-full h-full max-w-7xl bg-gray-800/20 rounded-lg shadow-2xl flex flex-col relative overflow-hidden border border-gray-700">
                {/* Tab Navigation */}
                <div className="flex border-b border-gray-700 shrink-0">
                    <button 
                        onClick={() => setActiveTab('files')} 
                        className={`py-2 px-4 flex items-center gap-2 font-medium transition-colors ${
                            activeTab === 'files' 
                                ? 'text-cyan-400 border-b-2 border-cyan-400' 
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <Folder size={16}/> My Files
                    </button>
                    <button 
                        onClick={() => setActiveTab('ai')} 
                        className={`py-2 px-4 flex items-center gap-2 font-medium transition-colors ${
                            activeTab === 'ai' 
                                ? 'text-indigo-400 border-b-2 border-indigo-400' 
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <Sparkles size={16}/> AI Assistant
                    </button>
                </div>

                {/* Main Content */}
                <div className="flex flex-grow overflow-hidden">
                    <ProjectSidebar
                        projects={projects}
                        selectedProjectId={selectedProjectId}
                        onProjectSelect={handleProjectSelect}
                        onCreateProject={handleOpenModal}
                        onDeleteProject={handleDeleteProject}
                    />
                    
                    <div className="flex-grow relative">
                        {activeTab === 'files' && (
                            <FileView
                                files={currentProjectFiles}
                                selectedProjectId={selectedProjectId}
                                projects={projects}
                                isDownloading={isDownloading}
                                isUploading={isUploading}
                                onCreateFile={handleCreateFile}
                                onDownloadFile={fileOperations.handleDownloadFile}
                                onDownloadProjectZip={handleDownloadProjectZip}
                                onFileUpload={handleFileUpload}
                                onEditFile={handleEditFile}
                                onDeleteFile={fileOperations.deleteFile}
                                fileInputRef={fileInputRef}
                            />
                        )}
                        
                        {activeTab === 'ai' && (
                            <AICoderView
                                files={currentProjectFiles}
                                aiFileId={aiFileId}
                                chatMessages={chatMessages}
                                chatInput={chatInput}
                                isAIGenerating={isAIGenerating}
                                onFileSelect={setAiFileId}
                                onChatInputChange={setChatInput}
                                onSendMessage={handleSendMessageToAI}
                            />
                        )}
                    </div>
                </div>

                {/* Modals and Overlays */}
                {selectedFile && (
                    <FileEditor
                        file={selectedFile}
                        onClose={handleCloseEditor}
                        onSave={handleSaveFile}
                    />
                )}

                <CreateProjectModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    projectName={newProjectName}
                    onProjectNameChange={setNewProjectName}
                    onCreateProject={handleCreateProject}
                    isCreating={isCreatingProject}
                />
            </main>
        </div>
    );
};

export default App;
