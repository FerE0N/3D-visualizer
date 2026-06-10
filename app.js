// ==========================================================================
// Elementos del DOM
// ==========================================================================
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const viewerContainer = document.getElementById('viewer-container');
const modelViewer = document.getElementById('model-viewer');
const closeViewerBtn = document.getElementById('close-viewer');
const toast = document.getElementById('toast');

// Estado
let currentObjectUrl = null;

// ==========================================================================
// Event Listeners: Drag & Drop
// ==========================================================================
// Prevenir comportamiento por defecto para permitir soltar
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Estilos visuales al arrastrar
['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.add('dragover'), false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.remove('dragover'), false);
});

// Manejar archivos soltados
dropZone.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

// ==========================================================================
// Event Listeners: Input de Archivo Clásico (Click)
// ==========================================================================
dropZone.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', function() {
    handleFiles(this.files);
});

// ==========================================================================
// Lógica Principal de Carga de Modelo
// ==========================================================================
function handleFiles(files) {
    if (files.length === 0) return;
    
    const file = files[0];
    
    // Validación de formato
    const validExtensions = ['.glb', '.gltf'];
    const fileName = file.name.toLowerCase();
    const isValid = validExtensions.some(ext => fileName.endsWith(ext));

    if (!isValid) {
        showToast('Formato no soportado. Por favor sube un archivo .glb o .gltf');
        return;
    }

    // Limpiar URL anterior si existe para evitar fugas de memoria
    if (currentObjectUrl) {
        URL.revokeObjectURL(currentObjectUrl);
    }

    try {
        // Crear URL local en memoria (muy rápido, no requiere servidor)
        currentObjectUrl = URL.createObjectURL(file);
        
        // Asignar al visor
        modelViewer.src = currentObjectUrl;
        
        // Transición de UI
        dropZone.classList.add('hidden');
        viewerContainer.classList.remove('hidden');
        
    } catch (error) {
        console.error("Error cargando el modelo:", error);
        showToast('Error al cargar el modelo 3D.');
    }
}

// ==========================================================================
// Event Listeners: Controles del Visor
// ==========================================================================
closeViewerBtn.addEventListener('click', () => {
    // Transición de UI
    viewerContainer.classList.add('hidden');
    dropZone.classList.remove('hidden');
    
    // Limpiar memoria
    if (currentObjectUrl) {
        URL.revokeObjectURL(currentObjectUrl);
        currentObjectUrl = null;
    }
    modelViewer.src = "";
    fileInput.value = "";
});

// Barra de progreso de model-viewer
modelViewer.addEventListener('progress', (event) => {
    const progressBar = event.target.querySelector('.progress-bar');
    const updateBar = event.target.querySelector('.update-bar');
    
    updateBar.style.width = `${event.detail.totalProgress * 100}%`;
    
    if (event.detail.totalProgress === 1) {
        progressBar.classList.add('hide');
    } else {
        progressBar.classList.remove('hide');
        if (event.detail.totalProgress === 0) {
            updateBar.style.width = '0%';
        }
    }
});

// ==========================================================================
// Utilidades: Alertas (Toast)
// ==========================================================================
let toastTimeout;

function showToast(message) {
    toast.textContent = message;
    toast.classList.remove('hidden');
    
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.add('hidden');
    }, 4000);
}
