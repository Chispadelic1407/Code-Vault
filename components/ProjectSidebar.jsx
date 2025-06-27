import React, { memo } from 'react';
import { Server, Plus, Folder, Trash2 } from 'lucide-react';

const ProjectSidebar = memo(({ 
  projects, 
  selectedProjectId, 
  onProjectSelect, 
  onCreateProject, 
  onDeleteProject 
}) => {
  return (
    <aside className="w-1/4 min-w-[280px] bg-gray-800/50 backdrop-blur-sm p-4 flex flex-col rounded-l-lg border-r border-gray-700">
      <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
        <Server className="text-cyan-400" /> Projects
      </h2>
      
      <button 
        onClick={onCreateProject} 
        className="w-full mb-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
      >
        <Plus size={18} /> New Project
      </button>
      
      <div className="flex-grow overflow-y-auto">
        {projects.length === 0 ? (
          <div className="text-center text-gray-400 mt-8">
            <Folder size={48} className="mx-auto mb-4 opacity-50" />
            <p>No projects yet</p>
            <p className="text-sm">Create your first project to get started</p>
          </div>
        ) : (
          <div className="space-y-2">
            {projects.map(project => (
              <div 
                key={project.id} 
                className={`p-3 rounded-lg cursor-pointer transition-colors flex items-center justify-between group ${
                  selectedProjectId === project.id 
                    ? 'bg-cyan-600 text-white' 
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
                onClick={() => onProjectSelect(project.id)}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Folder size={16} />
                  <span className="truncate">{project.name}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteProject(project.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-600 rounded transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
});

ProjectSidebar.displayName = 'ProjectSidebar';

export default ProjectSidebar;
