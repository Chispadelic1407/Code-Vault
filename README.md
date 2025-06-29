# Code Vault - In-Browser IDE

This is a simple in-browser Integrated Development Environment (IDE) that allows users to manage projects, create and edit files, and interact with a mock AI assistant for code analysis. All data is stored locally in the browser's localStorage.

## Features

*   **Project Management:**
    *   Create new projects.
    *   Switch between projects.
    *   Delete projects (this will also delete all associated files).
*   **File Operations:**
    *   Create new text files within a project.
    *   Upload files from your local system into a project.
    *   Edit file content with a simple text editor.
    *   Save file changes.
    *   Download individual files.
    *   Download an entire project as a ZIP archive.
    *   Delete files from a project.
*   **AI Assistant (Mock):**
    *   Select a file from the current project for analysis.
    *   Send messages or questions about the selected file's content.
    *   Receive mock responses from the AI (currently a placeholder).
*   **Persistence:**
    *   Projects and files are saved in the browser's `localStorage`, so your work persists across sessions on the same browser.

## How to Run

1.  Ensure you have a modern web browser (e.g., Chrome, Firefox, Edge, Safari).
2.  Clone or download the project files.
3.  Open the `index.html` file directly in your web browser.
    *   **Note:** Due to browser security restrictions (CORS) when using `file:///` protocol for ES module imports (even with Babel Standalone), it's recommended to serve the files through a simple local HTTP server.
        *   If you have Python: `python -m http.server` in the project root, then navigate to `http://localhost:8000/index.html`.
        *   Using Node.js: `npx serve` in the project root, then navigate to the provided local URL.
        *   Or use any other simple HTTP server.
    *   If you open `index.html` directly via `file:///`, some browsers might block the loading of `CodeVault.jsx` and its dependencies.

## Tech Stack

*   **Frontend:**
    *   React (via CDN)
    *   TailwindCSS (via CDN for styling)
    *   Lucide Icons (for UI icons)
*   **In-Browser Transpilation:**
    *   Babel Standalone (to transpile JSX and handle ES6 modules directly in the browser)
*   **File Handling:**
    *   JSZip (for creating ZIP archives for project download)
*   **Storage:**
    *   Browser `localStorage`

## Project Structure

*   `index.html`: The main entry point for the application.
*   `CodeVault.jsx`: The root React component for the application.
*   `components/`: Contains individual React components for different parts of the UI (e.g., `FileEditor.jsx`, `ProjectSidebar.jsx`).
*   `hooks/`: Contains custom React hooks (e.g., `useFileOperations.js`).
*   `utils/`: Contains utility functions (e.g., `fileUtils.js`).
*   `README.md`: This file.

This project demonstrates building a React application without a traditional build step, relying on CDNs and in-browser transpilation.
