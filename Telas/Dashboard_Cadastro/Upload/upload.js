document.addEventListener('DOMContentLoaded', () => {
    
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const selectFileLink = document.getElementById('selectFileLink');
    const fileList = document.getElementById('fileList');
    const uploadActionArea = document.getElementById('uploadActionArea');
    const btnProcessar = document.getElementById('btn-processar');

    let uploadedFiles = [];

    // --- FUNÇÕES ---

    function handleFiles(files) {
        const newFiles = Array.from(files).filter(file => {
            return file.name.match(/\.(pdf|docx)$/i);
        });

        if (newFiles.length === 0 && files.length > 0) {
            alert("Apenas arquivos PDF e DOCX são aceitos.");
            return;
        }

        uploadedFiles = uploadedFiles.concat(newFiles);
        updateFileList();
    }

    function updateFileList() {
        fileList.innerHTML = '';
        
        if (uploadedFiles.length === 0) {
            uploadActionArea.classList.add('hidden');
            return;
        }

        uploadActionArea.classList.remove('hidden');

        uploadedFiles.forEach((file, index) => {
            const listItem = document.createElement('li');
            const fileSizeKB = (file.size / 1024).toFixed(2);
            
            listItem.innerHTML = `
                <div class="file-info">
                    <span class="check-icon">✓</span> 
                    ${file.name} <span style="color:#9ca3af; font-size:0.85em; margin-left:5px;">(${fileSizeKB} KB)</span>
                </div>
                <button class="remove-file-btn" data-index="${index}">Remover</button>
            `;
            fileList.appendChild(listItem);
        });
    }

    // --- EVENT LISTENERS ---

    // Clique no link "clique para selecionar"
    selectFileLink.addEventListener('click', (e) => {
        e.preventDefault();
        fileInput.click();
    });

    // Clique na área inteira (opcional, para facilitar)
    dropZone.addEventListener('click', (e) => {
        if(e.target !== selectFileLink) {
            fileInput.click();
        }
    });

    // Alteração no Input File
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
        // Limpa o value para permitir selecionar o mesmo arquivo novamente se quiser
        fileInput.value = ''; 
    });

    // Drag and Drop Visuals
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
        handleFiles(e.dataTransfer.files);
    });

    // Remover arquivo
    fileList.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-file-btn')) {
            e.stopPropagation(); // Evita bolha
            const index = parseInt(e.target.dataset.index);
            uploadedFiles.splice(index, 1);
            updateFileList();
        }
    });

    // Botão Processar (Simulação)
    btnProcessar.addEventListener('click', () => {
        alert(`Processando ${uploadedFiles.length} arquivos... Redirecionando para Edição.`);
        // window.location.href = 'edicao.html'; // Exemplo de redirecionamento
    });
});