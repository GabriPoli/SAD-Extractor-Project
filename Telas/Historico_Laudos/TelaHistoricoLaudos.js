document.addEventListener('DOMContentLoaded', () => {
    
    // --- ESTADO ---
    let allLaudos = [];
    let filteredLaudos = [];
    let selectedLaudos = new Set();
    let currentPage = 1;
    let itemsPerPage = 4;
    let selectedExportFormat = null;
    
    // Controle de Exclusão: Pode ser um ID (número) ou 'ALL' (string)
    let itemToDelete = null; 

    // --- ELEMENTOS DOM ---
    const tableBody = document.getElementById('table-body');
    const paginationWrapper = document.getElementById('pagination-wrapper');
    const selectedCountBadge = document.getElementById('selected-count-balloon');
    const btnDownload = document.getElementById('btn-download');
    const successMsg = document.getElementById('download-success-msg');
    const selectAllBtn = document.getElementById('select-all-text');
    const deleteAllBtn = document.getElementById('deselect-all-text'); // ID do botão "Excluir tudo"
    
    // --- GERAÇÃO DE DADOS MOCK ---
    function createMockData() {
        const types = ['bom', 'regular', 'precario', 'otimo']; 
        
        for (let i = 1; i <= 24; i++) {
            const typeIndex = (i - 1) % 4; 
            const conservacaoClass = types[typeIndex];
            
            allLaudos.push({
                id: i,
                numDocumento: `LA ${String(i).padStart(3, '0')} SAD/PE`,
                endereco: `Rua Exemplo, ${i * 10}`,
                coordS: `8°03'14.5"S`,
                coordW: `34°52'52.1"W`,
                estadoConservacaoClass: conservacaoClass,
                valorImovel: `R$ ${(200 + i * 10)}.000,00`,
                dataExtracao: `2${i%9}/11/2025`
            });
        }
        filteredLaudos = [...allLaudos];
    }

    // --- CONFIGURAÇÃO E ABERTURA DO MODAL ---
    function setupModal() {
        const template = document.getElementById('template-modal-confirmacao');
        if (!template) return;

        // Clona o template se o modal ainda não existir no body
        if (!document.getElementById('confirmation-modal')) {
            const clone = template.content.cloneNode(true);
            document.body.appendChild(clone);
        }

        const modal = document.getElementById('confirmation-modal');
        const btnCancel = document.getElementById('btn-cancel-delete');
        const btnConfirm = document.getElementById('btn-confirm-delete');

        // Configura os eventos dos botões do modal
        if (btnCancel) {
            btnCancel.onclick = () => {
                modal.classList.add('hidden');
                itemToDelete = null;
            };
        }

        if (btnConfirm) {
            btnConfirm.onclick = () => {
                executeDelete(); // Executa a exclusão
                modal.classList.add('hidden');
            };
        }
    }

    function openModal(action, id = null) {
        const modal = document.getElementById('confirmation-modal');
        const modalText = modal.querySelector('p');
        const modalTitle = modal.querySelector('h3');

        if (!modal) return;

        if (action === 'ALL') {
            itemToDelete = 'ALL';
            modalTitle.textContent = "Excluir Tudo";
            modalText.textContent = "Tem certeza que deseja excluir TODOS os laudos? Essa ação não pode ser desfeita.";
        } else {
            itemToDelete = id;
            modalTitle.textContent = "Confirmar Exclusão";
            modalText.textContent = "Tem certeza que deseja excluir este item permanentemente?";
        }

        modal.classList.remove('hidden');
    }

    // --- LÓGICA DE EXCLUSÃO (Unitária e Total) ---
    function executeDelete() {
        if (itemToDelete === 'ALL') {
            // Apaga tudo
            allLaudos = [];
            filteredLaudos = [];
            selectedLaudos.clear();
        } else if (itemToDelete !== null) {
            // Apaga apenas o ID selecionado
            const id = parseInt(itemToDelete);
            allLaudos = allLaudos.filter(item => item.id !== id);
            filteredLaudos = filteredLaudos.filter(item => item.id !== id);
            selectedLaudos.delete(id);
        }

        // Reseta paginação e renderiza
        if (filteredLaudos.length === 0) currentPage = 1;
        render();
        itemToDelete = null;
    }

    // --- RENDERIZAÇÃO ---
    function renderTable() {
        if (!tableBody) return;
        tableBody.innerHTML = '';
        
        const start = (currentPage - 1) * itemsPerPage;
        const pageItems = filteredLaudos.slice(start, start + itemsPerPage);

        if(pageItems.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding: 20px;">Nenhum laudo encontrado.</td></tr>';
            return;
        }

        pageItems.forEach(item => {
            const isChecked = selectedLaudos.has(item.id);
            const tr = document.createElement('tr');
            
            tr.innerHTML = `
                <td>
                    <div class="custom-checkbox">
                        <input type="checkbox" data-id="${item.id}" ${isChecked ? 'checked' : ''}>
                    </div>
                </td>
                <td>
                    <div class="doc-link-wrapper">
                        <a href="#" class="laudo-link">${item.numDocumento}</a>
                        <svg class="eye-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                    </div>
                </td>
                <td>${item.endereco}</td>
                <td>${item.coordS}</td>
                <td>${item.coordW}</td>
                <td><span class="status-pill ${item.estadoConservacaoClass}"></span></td>
                <td>${item.valorImovel}</td>
                <td>${item.dataExtracao}</td>
                <td style="text-align: right;">
                    <button class="btn-trash" data-id="${item.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/><path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/></svg>
                    </button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    function renderPagination() {
        if (!paginationWrapper) return;
        
        const totalItems = filteredLaudos.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
        const endItem = Math.min(currentPage * itemsPerPage, totalItems);

        let html = `
            <div class="pagination-controls">
                <span>Itens por página</span>
                <select class="page-size-select" id="items-per-page">
                    <option value="4" ${itemsPerPage===4?'selected':''}>4</option>
                    <option value="8" ${itemsPerPage===8?'selected':''}>8</option>
                </select>
                <span style="margin-left: 15px;">${startItem}-${endItem} de ${totalItems}</span>
                <button class="page-nav-btn" data-action="prev" ${currentPage===1?'disabled':''}>‹</button>
                <div class="page-numbers">
                    <span class="${currentPage===1?'active':''}">1</span>
                    ${totalPages > 1 ? `<span class="${currentPage===2?'active':''}">2</span>` : ''}
                    ${totalPages > 2 ? `<span class="${currentPage===3?'active':''}">3</span>` : ''}
                </div>
                <button class="page-nav-btn" data-action="next" ${currentPage===totalPages || totalPages === 0?'disabled':''}>›</button>
            </div>
        `;
        paginationWrapper.innerHTML = html;

        document.getElementById('items-per-page').addEventListener('change', (e) => {
            itemsPerPage = parseInt(e.target.value);
            currentPage = 1;
            render();
        });
        
        const prevBtn = paginationWrapper.querySelector('[data-action="prev"]');
        const nextBtn = paginationWrapper.querySelector('[data-action="next"]');
        if(prevBtn) prevBtn.addEventListener('click', () => { if(currentPage>1) {currentPage--; render();} });
        if(nextBtn) nextBtn.addEventListener('click', () => { if(currentPage<totalPages) {currentPage++; render();} });
    }

    function updateFooterBar() {
        const count = selectedLaudos.size;
        if(selectedCountBadge) {
            selectedCountBadge.textContent = count === 0 
                ? 'Nenhum laudo selecionado' 
                : `${count} laudo${count > 1 ? 's' : ''} selecionado${count > 1 ? 's' : ''}`;
        }
        if(btnDownload) {
            btnDownload.disabled = !(count > 0 && selectedExportFormat);
        }
    }

    function render() {
        renderTable();
        renderPagination();
        updateFooterBar();
    }

    // --- EVENT LISTENERS ---
    
    if(tableBody) {
        tableBody.addEventListener('click', (e) => {
            // Checkbox
            if(e.target.type === 'checkbox') {
                const id = parseInt(e.target.dataset.id);
                if(e.target.checked) selectedLaudos.add(id);
                else selectedLaudos.delete(id);
                updateFooterBar();
            }

            // Lixeira (Exclusão Individual)
            const btnTrash = e.target.closest('.btn-trash');
            if (btnTrash) {
                const id = btnTrash.dataset.id;
                openModal('SINGLE', id);
            }
        });
    }

    // Botão Excluir Tudo
    if(deleteAllBtn) {
        deleteAllBtn.addEventListener('click', () => {
            if (allLaudos.length > 0) {
                openModal('ALL');
            }
        });
    }

    // Botão Selecionar Tudo
    if(selectAllBtn) {
        selectAllBtn.addEventListener('click', () => {
            const start = (currentPage - 1) * itemsPerPage;
            const pageItems = filteredLaudos.slice(start, start + itemsPerPage);
            pageItems.forEach(i => selectedLaudos.add(i.id));
            render();
        });
    }

    // Dropdown e Download (Mantidos)
    const dropdownBtn = document.getElementById('dropdown-btn');
    const dropdownMenu = document.getElementById('dropdown-menu');
    const selectedFormatText = document.getElementById('selected-format-text');

    if(dropdownBtn) {
        dropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });
        dropdownMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                selectedExportFormat = link.dataset.value;
                selectedFormatText.textContent = link.textContent;
                dropdownMenu.classList.remove('show');
                updateFooterBar();
            });
        });
        window.addEventListener('click', () => { if(dropdownMenu) dropdownMenu.classList.remove('show'); });
    }

    if(btnDownload) {
        btnDownload.addEventListener('click', () => {
            if(successMsg) {
                successMsg.classList.remove('hidden');
                setTimeout(() => successMsg.classList.add('hidden'), 3000);
            }
            selectedLaudos.clear();
            selectedExportFormat = null;
            selectedFormatText.textContent = "Selecionar formato";
            render();
        });
    }

    // Inicialização
    createMockData();
    setupModal();
    render();
});