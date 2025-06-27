# Code-Vault

import React, { useState, useEffect, useRef } from 'react';
import { Folder, FileText, Plus, Download, Trash2, Edit, X, Save, ArrowLeft, Loader2, Code, Server, FileJson, FileCode2, Route, ToyBrick, Database, MessageSquare, Send, Sparkles, Box, Bot, User as UserIcon, Upload } from 'lucide-react';
// --- Dependencia Externa (JSZip) ---
const addJSZipScript = () => {
    if (!document.getElementById('jszip-script')) {
        const script = document.createElement('script');
        script.id = 'jszip-script';
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"; 
        script.async = true;
        document.head.appendChild(script);
    }
};
// --- Componente Principal de la Aplicación ---
const App = () => {
    // --- Estados de la Aplicación ---
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [projects, setProjects] = useState([]);
    const [files, setFiles] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [newProjectName, setNewProjectName] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    // --- Estados para nuevas funcionalidades ---
    const [activeTab, setActiveTab] = useState('files');
    const [isDownloading, setIsDownloading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    // Estados del Asistente IA
    const [aiFileId, setAiFileId] = useState('');
    const [aiFileContent, setAiFileContent] = useState('');
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [isAIGenerating, setIsAIGenerating] = useState(false);
    // Estados de Firebase (ahora eliminados)
    const fileInputRef = useRef(null);
    // --- LÓGICA DE INICIALIZACIÓN Y CARGA ---
    useEffect(() => {
        addJSZipScript();
        setTimeout(() => {
            setIsLoading(false);
        }, 1000); // Simular carga
    }, []);
    // --- EFECTOS PARA ESCUCHAR CAMBIOS EN TIEMPO REAL ---
    useEffect(() => {
        if(aiFileId) { 
            const file = files.find(f => f.id === aiFileId); 
            if(file) setAiFileContent(file.content); 
        } else { 
            setAiFileContent(''); 
        }
    }, [aiFileId, files]);
    // --- Funciones CRUD y de la App ---
    const handleCreateProject = async () => { /* ... */ };
    const handleDeleteProject = async (projectId) => { /* ... */ };
    const handleCreateFile = async (fileName, content = `// Archivo: ${fileName}
`) => { if (!fileName.trim() || !selectedProjectId) return; const newFile = { id: `file-${Date.now()}`, name: fileName, content, createdAt: new Date() }; setFiles(prev => [...prev, newFile]); };
    const handleDeleteFile = async (fileId) => { setFiles(prev => prev.filter(f => f.id !== fileId)); };
    const handleUpdateFileContent = async (fileId, newContent) => { setFiles(prev => prev.map(f => (f.id === fileId ? { ...f, content: newContent } : f))); };
    const handleDownloadFile = (fileName, content) => { const blob = new Blob([content], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = fileName; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); };
    const handleDownloadProjectZip = async () => {
        if (!window.JSZip) {
            alert("JSZip no está disponible aún. Inténtalo en unos segundos.");
            return;
        }

        setIsDownloading(true);
        const zip = new JSZip();
        files.forEach(file => {
            zip.file(file.name, file.content);
        });

        try {
            const content = await zip.generateAsync({ type: "blob" });
            const projectName = projects.find(p => p.id === selectedProjectId)?.name || "proyecto";
            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${projectName}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Error al generar el ZIP:", err);
        } finally {
            setIsDownloading(false);
        }
    };
    // --- NUEVA FUNCIONALIDAD: Subida de Archivos ---
    const handleFileUpload = async (event) => {
        if (!selectedProjectId) return;
        const uploadedFiles = event.target.files;
        if (!uploadedFiles || uploadedFiles.length === 0) return;
        setIsUploading(true);
        const filePromises = Array.from(uploadedFiles).map(file => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    resolve({ name: file.name, content: e.target.result });
                };
                reader.onerror = (e) => reject(e);
                reader.readAsText(file);
            });
        });
        try {
            const fileContents = await Promise.all(filePromises);
            const updatedFiles = [
                ...files,
                ...fileContents.map((fileData, index) => ({
                    id: `file-${Date.now() + index}`,
                    ...fileData,
                })),
            ];
            setFiles(updatedFiles);
        } catch (error) {
            console.error("Error subiendo archivos:", error);
            alert("Hubo un error al leer los archivos.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };
    // --- Función para enviar mensajes a la IA ---
    const handleSendMessageToAI = async () => {
        if (!aiFileContent || !chatInput.trim()) return;

        const prompt = `
            Eres un asistente técnico especializado en desarrollo de software.
            Analiza el siguiente código y responde a esta pregunta: "${chatInput}"
            
            Código proporcionado:
            ${aiFileContent}
        `;

        setChatMessages(prev => [...prev, { role: 'user', content: chatInput }]);
        setIsAIGenerating(true);

        try {
            const response = await fetch('https://api.mistral.ai/v1/chat',  {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer qKWHHXM8wL4DpiMUZf8eb5WSzaGgZEL2`
                },
                body: JSON.stringify({
                    prompt: prompt,
                    max_tokens: 150 // Ajusta según sea necesario
                })
            });

            if (!response.ok) {
                throw new Error("Error en la respuesta de la API");
            }

            const data = await response.json();
            const aiResponse = data.choices[0].message.content; // Ajusta según la estructura de la respuesta
            setChatMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
        } catch (err) {
            console.error("Error al comunicarse con la IA:", err);
            setChatMessages(prev => [...prev, { role: 'assistant', content: "Hubo un error procesando tu solicitud." }]);
        } finally {
            setIsAIGenerating(false);
            setChatInput('');
        }
    };
    // --- Componentes de Renderizado ---
    const getFileIcon = (fileName) => {
        if (fileName.endsWith('.js')) return <FileCode2 size={18} className="text-yellow-400" />;
        if (fileName.endsWith('.css')) return <FileCode2 size={18} className="text-blue-400" />;
        if (fileName.endsWith('.json')) return <FileJson size={18} className="text-green-400" />;
        if (fileName.endsWith('.html')) return <FileCode2 size={18} className="text-orange-400" />;
        return <FileText size={18} className="text-gray-400" />;
    };
    const renderProjectSidebar = () => (
        <aside className="w-1/4 min-w-[280px] bg-gray-800/50 backdrop-blur-sm p-4 flex flex-col rounded-l-lg border-r border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2"><Server className="text-cyan-400" /> Proyectos</h2>
            <button onClick={() => setIsModalOpen(true)} className="w-full mb-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"><Plus size={18} /> Crear Proyecto</button>
            <div className="flex-grow overflow-y-auto pr-2">
                 {projects.map(project => (
                    <div key={project.id} onClick={() => { setSelectedProjectId(project.id); setSelectedFile(null); }} className={`group flex items-center justify-between p-3 my-1 rounded-lg cursor-pointer ${selectedProjectId === project.id ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-300 hover:bg-gray-700/50'}`}>
                        <div className="flex items-center gap-3"><Folder size={18} /><span className="font-medium">{project.name}</span></div>
                    </div>
                ))}
            </div>
            <div className="text-xs text-gray-500 mt-4 text-center">CodeVault v3.0</div>
        </aside>
    );
    const renderFileView = () => (
        <div className="flex-grow p-6 overflow-y-auto">
            {!selectedProjectId ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500"><Folder size={64} /><p className="mt-4 text-xl">Selecciona un proyecto para empezar</p></div>
            ) : (
                <>
                    <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                        <h2 className="text-2xl font-bold text-white">{projects.find(p => p.id === selectedProjectId)?.name}</h2>
                        <div className="flex gap-2">
                           <input type="file" multiple ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                           <button onClick={() => fileInputRef.current.click()} disabled={isUploading} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors disabled:bg-gray-500">{isUploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />} Subir Archivos</button>
                           <button onClick={handleDownloadProjectZip} disabled={isDownloading} className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors disabled:bg-gray-500">{isDownloading ? <Loader2 className="animate-spin" size={18} /> : <Box size={18} />} Descargar ZIP</button>
                        </div>
                    </div>
                     {files.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 pt-16"><FileText size={48} /><p className="mt-4 text-lg">Este proyecto está vacío.</p><p className="text-sm">Puedes subir archivos existentes o crearlos desde cero.</p></div>
                     ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {files.map(file => (
                                <div key={file.id} className="bg-gray-800 p-4 rounded-lg flex flex-col justify-between">
                                    <div className="flex items-center gap-3 mb-4 min-w-0">{getFileIcon(file.name)}<span className="text-white font-medium truncate" title={file.name}>{file.name}</span></div>
                                    <div className="flex items-center gap-2 mt-auto"><button onClick={() => handleDownloadFile(file.name, file.content)} className="flex-1 bg-gray-700 hover:bg-cyan-600 text-white py-1 px-2 rounded flex items-center justify-center gap-1 text-sm"><Download size={14} /> Descargar</button><button onClick={() => setSelectedFile(file)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-1 px-2 rounded flex items-center justify-center gap-1 text-sm"><Edit size={14} /> Editar</button><button onClick={() => handleDeleteFile(file.id)} className="bg-red-800/50 hover:bg-red-600 text-white p-2 rounded"><Trash2 size={14} /></button></div>
                                </div>
                            ))}
                        </div>
                     )}
                </>
            )}
        </div>
    );
    const renderAICoderView = () => (
        <div className="p-6 h-full flex flex-col">
            <h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-2">
                <Bot size={24} /> Asistente IA
            </h2>

            {/* Selector de archivo */}
            <select
                value={aiFileId}
                onChange={(e) => setAiFileId(e.target.value)}
                className="w-full bg-gray-700 text-white p-2 mb-4 rounded"
            >
                <option value="">Selecciona un archivo</option>
                {files.map(file => (
                    <option key={file.id} value={file.id}>{file.name}</option>
                ))}
            </select>

            {/* Área de chat */}
            <div className="flex-grow overflow-y-auto mb-4 bg-gray-800 p-4 rounded-lg">
                {chatMessages.length === 0 ? (
                    <p className="text-gray-400">Escribe una pregunta sobre el archivo seleccionado.</p>
                ) : (
                    chatMessages.map((msg, index) => (
                        <div key={index} className={`mb-4 ${msg.role === 'user' ? 'text-right' : ''}`}>
                            <div className={`inline-block p-3 rounded-lg ${msg.role === 'user' ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                                {msg.content}
                            </div>
                            <small className="block mt-1 text-xs text-gray-500">
                                {msg.role === 'user' ? 'Tú' : 'IA'}
                            </small>
                        </div>
                    ))
                )}
            </div>

            {/* Input de mensaje */}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Haz una pregunta sobre el código..."
                    className="flex-grow p-2 bg-gray-700 text-white rounded"
                    disabled={!aiFileId}
                />
                <button
                    onClick={handleSendMessageToAI}
                    disabled={isAIGenerating || !chatInput.trim() || !aiFileId}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded disabled:bg-gray-500"
                >
                    {isAIGenerating ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                </button>
            </div>
        </div>
    );
    const renderModal = () => (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
                <h3 className="text-lg font-bold mb-4 text-white">Crear Nuevo Proyecto</h3>
                <input
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="Nombre del proyecto"
                    className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
                />
                <div className="flex justify-end gap-2">
                    <button onClick={() => setIsModalOpen(false)} className="bg-gray-600 text-white px-4 py-2 rounded">Cancelar</button>
                    <button onClick={handleCreateProject} className="bg-cyan-600 text-white px-4 py-2 rounded">Crear</button>
                </div>
            </div>
        </div>
    );
    const renderEditorView = () => {
        const file = files.find(f => f.id === selectedFile?.id);
        return (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-40">
                <div className="bg-gray-900 p-4 rounded-lg w-3/4 h-3/4 flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-white font-bold">{file?.name}</h3>
                        <button onClick={() => setSelectedFile(null)}><X className="text-gray-400" /></button>
                    </div>
                    <textarea
                        value={file?.content || ''}
                        onChange={(e) => handleUpdateFileContent(file.id, e.target.value)}
                        className="flex-grow bg-gray-800 text-white p-2 rounded resize-none"
                    />
                </div>
            </div>
        );
    };
    // --- Renderizado Principal ---
    if (isLoading) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-900 text-white">
                <Loader2 className="animate-spin text-cyan-400" size={48} />
                <p className="mt-4 text-lg">Cargando bóveda...</p>
            </div>
        );
    }
    if (error) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-900 text-white">
                <p className="mt-4 text-lg text-red-500">Error: {error}</p>
                <p className="text-gray-400 mt-2">Por favor, refresca la página para reintentar.</p>
            </div>
        );
    }
    return (
        <div className="h-screen w-full bg-gray-900 text-white font-sans flex flex-col items-center justify-center p-4">
            <main className="w-full h-full max-w-7xl bg-gray-800/20 rounded-lg shadow-2xl flex flex-col relative overflow-hidden border border-gray-700">
                <div className="flex border-b border-gray-700 shrink-0">
                    <button onClick={() => setActiveTab('files')} className={`py-2 px-4 flex items-center gap-2 font-medium transition-colors ${activeTab === 'files' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'}`}><Folder size={16}/> Mis Archivos</button>
                    <button onClick={() => setActiveTab('ai')} className={`py-2 px-4 flex items-center gap-2 font-medium transition-colors ${activeTab === 'ai' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400 hover:text-white'}`}><Sparkles size={16}/> Asistente IA</button>
                </div>
                <div className="flex flex-grow overflow-hidden">
                    {renderProjectSidebar()}
                    <div className="flex-grow relative">
                       {activeTab === 'files' && renderFileView()}
                       {activeTab === 'ai' && renderAICoderView()}
                    </div>
                </div>
                {selectedFile && renderEditorView()}
                {isModalOpen && renderModal()}
            </main>
        </div>
    );
};
export default App;
