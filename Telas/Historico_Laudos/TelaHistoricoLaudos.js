document.addEventListener('DOMContentLoaded', () => {
    
    // --- ESTADO ---
    let allLaudos = [];
    let filteredLaudos = [];
    let selectedLaudos = new Set();
    let currentPage = 1;
    // CORREÇÃO: Default 4 itens por página
    let itemsPerPage = 4; 
    let selectedExportFormat = null;
    let itemToDelete = null; 

    // --- ELEMENTOS DOM ---
    const tableBody = document.getElementById('table-body');
    const paginationWrapper = document.getElementById('pagination-wrapper');
    const selectedCountBadge = document.getElementById('selected-count-balloon');
    const btnDownload = document.getElementById('btn-download');
    const successMsg = document.getElementById('download-success-msg');
    const selectAllBtn = document.getElementById('select-all-text');
    const deleteAllBtn = document.getElementById('deselect-all-text');
    
    // Elementos do Modal de Detalhes
    const detailsModal = document.getElementById('details-modal');
    const btnCloseDetails = document.getElementById('btn-close-details');

    // --- MOCK ---
    function createMockData() {
        const types = ['bom', 'regular', 'precario', 'otimo']; 
        
        const getDetails = (i) => ({
            endereco: `Rua Histórica, ${i * 20}`, numero: `${i * 3}`, complemento: 'Sala Comercial',
            bairro: 'Centro Histórico', cep: '50000-000', pais: 'Brasil', estado: 'PE', cidade: 'Recife', regiao: 'Metropolitana',
            confrontanteFrente: 'Praça Central', confrontanteFundo: 'Rua de Trás', confrontanteDireita: 'Lote Vizinho 1', confrontanteEsquerda: 'Lote Vizinho 2',
            pontoReferencia: 'Próximo ao Marco Zero', observacaoLoc: 'Área tombada', coordS: '-8.063', coordW: '-34.871',
            areaTerreno: `${500 + i}m²`, areaConstruida: `${400 + i}m²`, unidadeMedida: 'm²', estadoConservacao: types[(i-1)%4].charAt(0).toUpperCase() + types[(i-1)%4].slice(1), limitacaoAdm: 'Sim',
            criterioValoracao: 'Método Evolutivo', dataValoracao: '15/01/2024', numDocumento: `LA ${String(i).padStart(3, '0')}/2024`,
            valorConstrucao: `R$ ${600000 + (i*1000)},00`, valorAreaConstruida: 'R$ 4.500/m²', valorTerreno: `R$ ${800000 + (i*1000)},00`, 
            valorTotal: `R$ ${1400000 + (i*2000)},00`, observacaoFin: 'Laudo arquivado'
        });

        for (let i = 1; i <= 24; i++) {
            const typeIndex = (i - 1) % 4; 
            const conservacaoClass = types[typeIndex];
            
            const details = getDetails(i);

            allLaudos.push({
                id: i,
                numDocumento: details.numDocumento,
                endereco: details.endereco,
                coordS: details.coordS,
                coordW: details.coordW,
                valorTotal: details.valorTotal,
                dataExtract: '28/11/2025',
                conservacao: conservacaoClass, 
                details: details
            });
        }
        filteredLaudos = [...allLaudos];
    }

    // --- RENDER ---
    function render() {
        if(!tableBody) return;
        tableBody.innerHTML = '';
        
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const pageItems = filteredLaudos.slice(start, end);
        
        if (pageItems.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:20px">Nenhum laudo encontrado.</td></tr>';
            return;
        }

        pageItems.forEach(item => {
            const isChecked = selectedLaudos.has(item.id);
            const tr = document.createElement('tr');
            
            const eyeIcon = `<div class="eye-btn" title="Ver detalhes"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/><path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/></svg></div>`;

            tr.innerHTML = `
                <td><div class="custom-checkbox"><input type="checkbox" data-id="${item.id}" ${isChecked ? 'checked' : ''}></div></td>
                <td>
                    <div class="doc-name-wrapper">
                        <a href="#" class="laudo-link" data-id="${item.id}">${item.numDocumento}</a>
                        ${eyeIcon}
                    </div>
                </td>
                <td>${item.endereco}</td>
                <td>${item.coordS}</td>
                <td>${item.coordW}</td>
                <td><span class="status-badge ${item.conservacao}">${item.conservacao}</span></td>
                <td>${item.valorTotal}</td>
                <td>${item.dataExtract}</td>
                <td style="text-align: right;"><button class="btn-trash" data-id="${item.id}"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/><path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/></svg></button></td>
            `;
            tableBody.appendChild(tr);
        });

        renderPagination();
        updateFooterBar();
    }

function renderPagination() {
        if (!paginationWrapper) return;
        
        const totalItems = filteredLaudos.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        
        // Segurança: Ajusta página atual se sair dos limites
        if (currentPage > totalPages && totalPages > 0) currentPage = totalPages;
        if (totalPages === 0) currentPage = 1;

        const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
        const endItem = Math.min(currentPage * itemsPerPage, totalItems);

        // Monta o HTML
        let html = `
            <div class="pagination-controls">
                <span>Itens por página</span>
                <select class="page-size-select" id="items-per-page">
                    <option value="4" ${itemsPerPage===4?'selected':''}>4</option>
                    <option value="8" ${itemsPerPage===8?'selected':''}>8</option>
                    <option value="12" ${itemsPerPage===12?'selected':''}>12</option>
                </select>
                
                <div class="pagination-divider"></div>
                
                <span id="pagination-info" class="pagination-info">${startItem}-${endItem} de ${totalItems}</span>
                
                <div class="pagination-buttons-right" style="display: flex; gap: 10px; margin-left: 15px; align-items: center;">
                    <button class="page-nav-btn" data-action="prev" ${currentPage===1 || totalPages===0 ?'disabled':''}>‹</button>
                    
                    <span class="current-page-indicator">${currentPage}</span>
                    
                    <button class="page-nav-btn" data-action="next" ${currentPage===totalPages || totalPages===0 ?'disabled':''}>›</button>
                </div>
            </div>
        `;
        paginationWrapper.innerHTML = html;

        // --- LISTENERS ---

        // Mudar itens por página
        document.getElementById('items-per-page').addEventListener('change', (e) => {
            itemsPerPage = parseInt(e.target.value);
            currentPage = 1; 
            render();
        });
        
        // Botão Anterior
        const prevBtn = paginationWrapper.querySelector('[data-action="prev"]');
        if(prevBtn) prevBtn.addEventListener('click', () => { 
            if(currentPage > 1) { currentPage--; render(); } 
        });

        // Botão Próximo
        const nextBtn = paginationWrapper.querySelector('[data-action="next"]');
        if(nextBtn) nextBtn.addEventListener('click', () => { 
            if(currentPage < totalPages) { currentPage++; render(); } 
        });
    }

    function updateFooterBar() {
        const count = selectedLaudos.size;
        selectedCountBadge.textContent = count === 1 ? '1 selecionado' : `${count} selecionados`;
        
        const allSelected = filteredLaudos.length > 0 && filteredLaudos.every(f => selectedLaudos.has(f.id));
        if(selectAllBtn) selectAllBtn.textContent = allSelected ? "Desmarcar tudo" : "Selecionar tudo";

        if(count > 0) {
            selectedCountBadge.classList.remove('hidden');
            if(selectedExportFormat) btnDownload.disabled = false;
        } else {
            selectedCountBadge.classList.add('hidden');
            btnDownload.disabled = true;
        }
    }

    // --- MODAL DE DETALHES ---
    const fieldMap = {
        loc: [
            {key:'endereco', l:'Endereço'}, {key:'numero', l:'Número'}, {key:'complemento', l:'Complemento'}, 
            {key:'bairro', l:'Bairro'}, {key:'cep', l:'CEP'}, {key:'pais', l:'País'}, {key:'estado', l:'Estado'}, 
            {key:'cidade', l:'Cidade/Município'}, {key:'regiao', l:'Região'}, {key:'coordS', l:'Coord. S'}, {key:'coordW', l:'Coord. W'}
        ],
        carac: [
            {key:'areaTerreno', l:'Área do terreno'}, {key:'areaConstruida', l:'Área construída'}, 
            {key:'unidadeMedida', l:'Unidade'}, {key:'estadoConservacao', l:'Conservação'}, 
            {key:'limitacaoAdm', l:'Limitação Adm.'}
        ],
        fin: [
            {key:'criterioValoracao', l:'Critério'}, {key:'dataValoracao', l:'Data'}, 
            {key:'numDocumento', l:'Documento'}, {key:'valorConstrucao', l:'Valor Construção'}, 
            {key:'valorAreaConstruida', l:'Valor/m²'}, {key:'valorTerreno', l:'Valor Terreno'}, 
            {key:'valorTotal', l:'Valor Total'}, {key:'observacaoFin', l:'Obs. Financeira'}
        ]
    };

    function openDetailsModal(id) {
        const file = allLaudos.find(f => f.id === id);
        if (!file) return;
        
        document.getElementById('modal-laudo-title').textContent = `Detalhes de ${file.numDocumento}`;
        
        const renderGroup = (map, containerId) => {
            const container = document.getElementById(containerId);
            container.innerHTML = '';
            map.forEach(f => {
                const val = file.details[f.key];
                const displayVal = (val && val !== '') ? val : 'Não encontrado';
                const isMissing = !val || val === '';

                const div = document.createElement('div');
                div.className = 'field-item';
                const label = `<label class="field-label">${f.l}</label>`;
                const value = `<span class="field-value ${isMissing ? 'missing' : ''}">${displayVal}</span>`;
                
                div.innerHTML = label + value;
                container.appendChild(div);
            });
        };

        renderGroup(fieldMap.loc, 'grid-localizacao');
        renderGroup(fieldMap.carac, 'grid-caracteristicas');
        renderGroup(fieldMap.fin, 'grid-financeiros');

        detailsModal.classList.remove('hidden');
    }

    btnCloseDetails.addEventListener('click', () => {
        detailsModal.classList.add('hidden');
    });

    // --- LISTENERS ---
    
    const templateModal = document.getElementById('template-modal-confirmacao');
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = templateModal.innerHTML;
    document.body.appendChild(modalContainer.firstElementChild);
    
    const confirmModal = document.getElementById('confirmation-modal');
    const btnCancel = document.getElementById('btn-cancel-delete');
    const btnConfirm = document.getElementById('btn-confirm-delete');

    function openConfirmModal(idOrAll) {
        itemToDelete = idOrAll;
        confirmModal.classList.remove('hidden');
    }

    btnCancel.addEventListener('click', () => confirmModal.classList.add('hidden'));
    
    btnConfirm.addEventListener('click', () => {
        if (itemToDelete === 'ALL') {
            allLaudos = []; 
            filteredLaudos = [];
            selectedLaudos.clear();
        } else if (typeof itemToDelete === 'number') {
            allLaudos = allLaudos.filter(l => l.id !== itemToDelete);
            filteredLaudos = filteredLaudos.filter(l => l.id !== itemToDelete);
            selectedLaudos.delete(itemToDelete);
        }
        confirmModal.classList.add('hidden');
        render();
    });

    tableBody.addEventListener('click', (e) => {
        const link = e.target.closest('.laudo-link');
        if (link) {
            e.preventDefault();
            openDetailsModal(parseInt(link.dataset.id));
            return;
        }

        const eyeBtn = e.target.closest('.eye-btn');
        if (eyeBtn) {
            const tr = eyeBtn.closest('tr');
            const id = parseInt(tr.querySelector('.custom-checkbox input').dataset.id);
            openDetailsModal(id);
            return;
        }

        if (e.target.closest('.custom-checkbox')) {
            const cb = e.target.closest('.custom-checkbox').querySelector('input');
            if(cb) {
                const id = parseInt(cb.dataset.id);
                if(cb.checked) selectedLaudos.add(id); else selectedLaudos.delete(id);
                updateFooterBar();
            }
            return;
        }

        const btnTrash = e.target.closest('.btn-trash');
        if(btnTrash) {
            openConfirmModal(parseInt(btnTrash.dataset.id));
        }
    });

    if(selectAllBtn) {
        selectAllBtn.addEventListener('click', () => {
            const allSelected = filteredLaudos.length > 0 && filteredLaudos.every(f => selectedLaudos.has(f.id));
            if (allSelected) {
                selectedLaudos.clear();
            } else {
                filteredLaudos.forEach(l => selectedLaudos.add(l.id));
            }
            render();
        });
    }

    if(deleteAllBtn) {
        deleteAllBtn.addEventListener('click', () => {
            if(filteredLaudos.length > 0) openConfirmModal('ALL');
        });
    }

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

    createMockData();
    render();
});