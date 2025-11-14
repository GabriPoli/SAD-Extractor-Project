const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const selectFileLink = document.getElementById('selectFileLink');
const fileList = document.getElementById('fileList');

let uploadedFiles = []; // Array para armazenar os arquivos

// Funções de manipulação e atualização (conceituais)
function handleFiles(files) {
    const newFiles = Array.from(files).filter(file => {
        // Validação de formato (PDF, DOCX)
        return file.name.match(/\.(pdf|docx)$/i);
    });

    if (newFiles.length === 0 && files.length > 0) {
        // Alerta para tipos não suportados
        alert("Atenção: Apenas arquivos PDF e DOCX são aceitos, conforme especificado nos Formatos suportados: PDF, DOCX.");
        return;
    }

    uploadedFiles = uploadedFiles.concat(newFiles);
    updateFileList();
}

function updateFileList() {
    fileList.innerHTML = '';
    
    if (uploadedFiles.length === 0) {
        // ... (código para lista vazia)
        return;
    }

    uploadedFiles.forEach((file, index) => {
        const listItem = document.createElement('li');
        const fileSizeKB = (file.size / 1024).toFixed(2);
        
        // --- NOVO FORMATO DE VISUALIZAÇÃO DO ARQUIVO ---
        listItem.innerHTML = `
            <span class="file-info">
                <span class="check-icon">\u2713</span> 
                ${file.name} (${fileSizeKB} KB)
            </span>
            <button class="remove-file-btn" data-index="${index}">Remover</button>
        `;
        // ---------------------------------------------

        fileList.appendChild(listItem);
    });
}

// 1. Evento de Clique no Link
selectFileLink.addEventListener('click', (e) => {
    e.preventDefault();
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

// 2. Eventos Drag and Drop
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    handleFiles(files);
});

// 3. Lógica de Remoção (Seção de lista de arquivos não mostrada no Figma [1, 2], mas crucial para a aplicação)
fileList.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-file-btn')) {
        const indexToRemove = parseInt(e.target.dataset.index);
        uploadedFiles.splice(indexToRemove, 1);
        updateFileList();
    }
});

// Inicialização
updateFileList();