# Code Vault - IDE en el Navegador

Este es un Entorno de Desarrollo Integrado (IDE) simple que funciona en el navegador y permite a los usuarios gestionar proyectos, crear y editar archivos, e interactuar con un asistente de IA simulado para el análisis de código. Todos los datos se almacenan localmente en el `localStorage` del navegador.

## Características

*   **Gestión de Proyectos:**
    *   Crear nuevos proyectos.
    *   Cambiar entre proyectos.
    *   Eliminar proyectos (esto también eliminará todos los archivos asociados).
*   **Operaciones de Archivos:**
    *   Crear nuevos archivos de texto dentro de un proyecto.
    *   Subir archivos desde tu sistema local a un proyecto.
    *   Editar el contenido de los archivos con un editor de texto simple.
    *   Guardar cambios en los archivos.
    *   Descargar archivos individuales.
    *   Descargar un proyecto entero como un archivo ZIP.
    *   Eliminar archivos de un proyecto.
*   **Asistente de IA (Simulado):**
    *   Seleccionar un archivo del proyecto actual para su análisis.
    *   Enviar mensajes o preguntas sobre el contenido del archivo seleccionado.
    *   Recibir respuestas simuladas de la IA (actualmente es un marcador de posición).
*   **Persistencia:**
    *   Los proyectos y archivos se guardan en el `localStorage` del navegador, por lo que tu trabajo persiste entre sesiones en el mismo navegador.

## Cómo Ejecutarlo

1.  Asegúrate de tener un navegador web moderno (ej. Chrome, Firefox, Edge, Safari).
2.  Clona o descarga los archivos del proyecto.
3.  Abre el archivo `index.html` directamente en tu navegador web.
    *   **Nota:** Debido a las restricciones de seguridad del navegador (CORS) al usar el protocolo `file:///` para importaciones de módulos ES (incluso con Babel Standalone), se recomienda servir los archivos a través de un servidor HTTP local simple.
        *   Si tienes Python: `python -m http.server` en la raíz del proyecto, luego navega a `http://localhost:8000/index.html`.
        *   Usando Node.js: `npx serve` en la raíz del proyecto, luego navega a la URL local proporcionada.
        *   O usa cualquier otro servidor HTTP simple.
    *   Si abres `index.html` directamente mediante `file:///`, algunos navegadores podrían bloquear la carga de `CodeVault.jsx` y sus dependencias.

## Stack Tecnológico

*   **Frontend:**
    *   React (vía CDN)
    *   TailwindCSS (vía CDN para estilos)
    *   Lucide Icons (para iconos de interfaz de usuario)
*   **Transpilación en el Navegador:**
    *   Babel Standalone (para transpilar JSX y manejar módulos ES6 directamente en el navegador)
*   **Manejo de Archivos:**
    *   JSZip (para crear archivos ZIP para la descarga de proyectos)
*   **Almacenamiento:**
    *   `localStorage` del navegador

## Estructura del Proyecto

*   `index.html`: El punto de entrada principal para la aplicación.
*   `CodeVault.jsx`: El componente raíz de React para la aplicación.
*   `components/`: Contiene componentes individuales de React para diferentes partes de la interfaz de usuario (ej. `FileEditor.jsx`, `ProjectSidebar.jsx`).
*   `hooks/`: Contiene hooks personalizados de React (ej. `useFileOperations.js`).
*   `utils/`: Contiene funciones de utilidad (ej. `fileUtils.js`).
*   `README.md`: Este archivo.

Este proyecto demuestra la construcción de una aplicación React sin un paso de compilación tradicional, dependiendo de CDNs y transpilación en el navegador.
