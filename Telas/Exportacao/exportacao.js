document.addEventListener('DOMContentLoaded', () => {

    // --- ESTADO ---
    let files = [];
    let selectedFiles = new Set();
    let currentPage = 1;
    let itemsPerPage = 4;
    let exportFormat = "";

    // --- ELEMENTOS ---
    const tableBody = document.getElementById('table-body');
    const paginationWrapper = document.getElementById('pagination-wrapper');
    const selectedBadge = document.getElementById('selected-count-badge');
    const selectAllBtn = document.getElementById('select-all-text');
    const btnDownload = document.getElementById('btn-download');
    const formatSelect = document.getElementById('export-format');
    
    // Elementos do Modal
    const detailsModal = document.getElementById('details-modal');
    const btnCloseDetails = document.getElementById('btn-close-details');

    // --- MOCK DATA ---
    function createMockData() {
        files = [];
        
        // CORREÇÃO: Ajustado para base de 30 campos mantendo as %
        const patterns = [
            { extracted: '30/30', percent: '100%', reliability: 100, color: 'green' },
            { extracted: '21/30', percent: '70%', reliability: 70, color: 'yellow' }, 
            { extracted: '30/30', percent: '100%', reliability: 100, color: 'green' },
            { extracted: '26/30', percent: '85%', reliability: 85, color: 'green' }
        ];

        const getDetails = (i) => ({
            endereco: `Rua da Exportação, ${i * 50}`, numero: `${i * 5}`, complemento: '',
            bairro: 'Boa Viagem', cep: '51020-000', pais: 'Brasil', estado: 'PE', cidade: 'Recife', regiao: 'Metropolitana',
            confrontanteFrente: 'Rua A', confrontanteFundo: 'Lote B', confrontanteDireita: 'Lote C', confrontanteEsquerda: 'Lote D',
            pontoReferencia: 'Próximo ao mercado', observacaoLoc: 'Localização privilegiada', coordS: '-8.123', coordW: '-34.567',
            areaTerreno: `${400 + i}m²`, areaConstruida: `${200 + i}m²`, unidadeMedida: 'm²', estadoConservacao: 'Ótimo', limitacaoAdm: 'Não',
            criterioValoracao: 'Comparativo Direto', dataValoracao: '28/11/2025', numDocumento: `DOC-EXP-${i}`,
            valorConstrucao: `R$ ${300000 + (i*1000)},00`, valorAreaConstruida: 'R$ 3.000/m²', valorTerreno: `R$ ${400000 + (i*1000)},00`, 
            valorTotal: `R$ ${700000 + (i*2000)},00`, observacaoFin: 'Pronto para exportação'
        });

        for (let i = 1; i <= 20; i++) {
            const pattern = patterns[(i - 1) % 4];
            const details = getDetails(i);
            const editedFields = new Set();

            if (i % 2 === 0) { editedFields.add('areaTerreno'); editedFields.add('valorTotal'); }
            if (i % 3 === 0) { editedFields.add('endereco'); }

            files.push({
                id: i,
                name: `Laudo_${String(i).padStart(3, '0')}.pdf`, 
                ...pattern,
                details: details,
                camposEditados: editedFields
            });
        }
    }

    // --- RENDER ---
    function render() {
        if(!tableBody) return;
        tableBody.innerHTML = '';
        const start = (currentPage - 1) * itemsPerPage;
        const pageFiles = files.slice(start, start + itemsPerPage);

        if (pageFiles.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:20px">Nenhum arquivo disponível.</td></tr>';
            return;
        }

        pageFiles.forEach(file => {
            const isChecked = selectedFiles.has(file.id);
            const tr = document.createElement('tr');
            
            const iconProceed = `<svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/></svg>`;
            
            tr.innerHTML = `
                <td><div class="custom-checkbox"><input type="checkbox" data-id="${file.id}" ${isChecked ? 'checked' : ''}></div></td>
                <td>${file.id}</td>
                <td>
                    <div class="doc-link-wrapper">
                        <a href="#" class="laudo-link" data-id="${file.id}">${file.name}</a>
                        <svg class="eye-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                    </div>
                </td>
                <td>${file.extracted}</td>
                <td>${file.percent}</td>
                <td class="status-${file.color}">
                    <div class="reliability-wrapper">
                        <div class="reliability-track"><div class="reliability-bar" style="width: ${file.reliability}%"></div></div>
                    </div>
                </td>
                <td><div class="action-cell action-text green">${iconProceed} <span>Prosseguir</span></div></td>
            `;
            tableBody.appendChild(tr);
        });

        renderPagination();
        updateFooterState();
    }

    function renderPagination() {
        if (!paginationWrapper) return;
        const totalPages = Math.ceil(files.length / itemsPerPage);
        const startItem = files.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
        const endItem = Math.min(startItem + itemsPerPage - 1, files.length);

        paginationWrapper.innerHTML = `
            <div class="pagination-controls">
                <span>Itens por página</span>
                <select class="page-size-select" id="items-per-page">
                    <option value="4" ${itemsPerPage===4?'selected':''}>4</option>
                    <option value="8" ${itemsPerPage===8?'selected':''}>8</option>
                    <option value="16" ${itemsPerPage===16?'selected':''}>16</option>
                </select>
                <span style="margin-left: 10px;">${startItem}-${endItem} de ${files.length}</span>
                <button class="page-nav-btn" data-action="prev" ${currentPage===1?'disabled':''}>‹</button>
                <div class="page-numbers"><span class="active">${currentPage}</span></div>
                <button class="page-nav-btn" data-action="next" ${currentPage===totalPages?'disabled':''}>›</button>
            </div>
        `;

        const select = paginationWrapper.querySelector('#items-per-page');
        if(select) select.addEventListener('change', (e) => { itemsPerPage = parseInt(e.target.value); currentPage = 1; render(); });
        
        paginationWrapper.querySelectorAll('.page-nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                if(action === 'prev' && currentPage > 1) { currentPage--; render(); }
                if(action === 'next' && currentPage < totalPages) { currentPage++; render(); }
            });
        });
    }

    function updateFooterState() {
        const count = selectedFiles.size;
        selectedBadge.textContent = count === 1 ? '1 laudo selecionado' : `${count} laudos selecionados`;
        
        const allSelected = files.length > 0 && files.every(f => selectedFiles.has(f.id));
        if(selectAllBtn) selectAllBtn.textContent = allSelected ? "Desmarcar tudo" : "Selecionar tudo";

        if(count > 0) {
            selectedBadge.classList.remove('hidden');
            if(exportFormat !== "") btnDownload.disabled = false;
        } else {
            selectedBadge.classList.add('hidden');
            btnDownload.disabled = true;
        }
    }

    function showToast(message) {
        let container = document.getElementById('toast-container');
        if(!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }
        const toast = document.createElement('div');
        toast.className = 'toast-message';
        toast.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-check-circle-fill" viewBox="0 0 16 16" style="color: #22c55e;"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/></svg> <span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    }

    // --- LÓGICA DO MODAL DE DETALHES ---
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
        const file = files.find(f => f.id === id);
        if (!file) return;
        
        document.getElementById('modal-laudo-title').textContent = `Detalhes de ${file.name}`;
        
        const renderGroup = (map, containerId) => {
            const container = document.getElementById(containerId);
            container.innerHTML = '';
            map.forEach(f => {
                const val = file.details[f.key];
                const displayVal = (val && val !== '') ? val : 'Não encontrado';
                const wasEdited = file.camposEditados.has(f.key);
                const isMissing = !val || val === '';

                const div = document.createElement('div');
                div.className = 'field-item';
                // Label com asterisco azul se foi editado
                const label = `<label class="field-label">${f.l}${wasEdited ? ' <span class="edited-mark">*</span>' : ''}</label>`;
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

    // Abrir Modal
    tableBody.addEventListener('click', (e) => {
        const link = e.target.closest('.laudo-link');
        if (link) {
            e.preventDefault();
            openDetailsModal(parseInt(link.dataset.id));
        }
    });

    // Checkbox Individual
    tableBody.addEventListener('change', (e) => {
        if(e.target.type === 'checkbox') {
            const id = parseInt(e.target.dataset.id);
            if(e.target.checked) selectedFiles.add(id); else selectedFiles.delete(id);
            updateFooterState();
        }
    });

    // Toggle Selecionar Tudo
    selectAllBtn.addEventListener('click', () => {
        const allSelected = files.length > 0 && files.every(f => selectedFiles.has(f.id));
        
        if (allSelected) {
            selectedFiles.clear();
        } else {
            files.forEach(f => selectedFiles.add(f.id));
        }
        render();
    });

    // Dropdown Change
    formatSelect.addEventListener('change', (e) => {
        exportFormat = e.target.value;
        updateFooterState();
    });

    // Download Click
    btnDownload.addEventListener('click', () => {
        const count = selectedFiles.size;
        const fmt = exportFormat.toUpperCase();
        showToast(`${count} arquivo(s) baixado(s) com sucesso no formato ${fmt}.`);
        
        setTimeout(() => {
            selectedFiles.clear();
            formatSelect.value = "";
            exportFormat = "";
            render();
        }, 1500);
    });

    // Init
    createMockData();
    render();
});