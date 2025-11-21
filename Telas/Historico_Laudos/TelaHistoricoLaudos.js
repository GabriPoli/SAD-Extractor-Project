document.addEventListener('DOMContentLoaded', () => {
    console.log("Script historico.js carregado.");

    // --- 1. ESTADO DA APLICAÇÃO ---
    let allLaudos = [];
    let filteredLaudos = [];
    let selectedLaudos = new Set();
    let currentPage = 1;
    let itemsPerPage = 4;
    let selectedExportFormat = null;

    // --- 2. SELETORES ---
    const tableBody = document.getElementById('table-body');
    const selectAllBtn = document.getElementById('select-all-text');
    const deselectAllBtn = document.getElementById('deselect-all-text');
    const selectedCountSpan = document.getElementById('selected-count-balloon');
    const paginationWrapper = document.getElementById('pagination-wrapper');
    const searchBtn = document.querySelector('.search-form button');
    const inputDoc = document.querySelector('.search-form input[placeholder="N° do documento"]');
    const inputAddress = document.querySelector('.search-form input[placeholder="Endereço"]');
    
    const btnDownload = document.getElementById('btn-download');
    const dropdownBtn = document.getElementById('dropdown-btn');
    const selectedFormatText = document.getElementById('selected-format-text');
    const successMsg = document.getElementById('download-success-msg');

    if (!tableBody) console.error("ERRO CRÍTICO: Elemento 'table-body' não encontrado.");
    if (!paginationWrapper) console.error("ERRO CRÍTICO: Elemento 'pagination-wrapper' não encontrado.");

    // --- 3. DADOS DE TESTE ---
    function convertToDMS(value, isLatitude) {
        const absolute = Math.abs(value);
        const degrees = Math.floor(absolute);
        const minutesNotTruncated = (absolute - degrees) * 60;
        const minutes = Math.floor(minutesNotTruncated);
        const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(1);
        const direction = isLatitude ? (value >= 0 ? "N" : "S") : (value >= 0 ? "E" : "W");
        return `${degrees}°${String(minutes).padStart(2, '0')}'${String(seconds).padStart(4, '0')}"${direction}`;
    }

    function createMockData() {
        allLaudos = [];
        const getDetails = (i, lat, long) => ({
            loc_endereco: `Rua das Flores, ${i*10}`, loc_numero: String(i*10),
            loc_complemento: (i % 3 === 0) ? 'Apto ' + i : null, loc_bairro: 'Centro',
            loc_cep: '50000-000', loc_pais: 'Brasil', loc_estado: 'PE',
            loc_cidade: 'Recife', loc_regiao: 'Nordeste',
            loc_confFrente: 'Rua A', loc_confFundo: 'Terreno baldio', loc_confDireita: 'Casa 2',
            loc_confEsquerda: 'Casa 4', loc_pontoRef: 'Perto da praça', loc_obs: 'Nenhuma',
            loc_coordS: lat, loc_coordW: long, 
            carac_areaTerreno: `${200 + i}m²`, carac_areaConstruida: `${150 + i}m²`, 
            carac_unidadeMedida: 'm²', carac_estadoConserv: (i%2===0 ? 'Bom' : 'Regular'), 
            carac_limitAdmin: 'Nenhuma', fin_critVal: 'Comparativo',
            fin_dataVal: `2023-10-${String(i).padStart(2, '0')}`, fin_numDoc: `DOC-${String(i).padStart(3, '0')}`,
            fin_valConstNova: 'R$ 300.000,00', fin_valAreaConst: 'R$ 200.000,00',
            fin_valTerreno: 'R$ 100.000,00', fin_valTotal: `R$ ${400 + i}.000,00`, fin_obs: 'Avaliação padrão'
        });

        for (let i = 1; i <= 100; i++) { 
            const docNum = `DOC-${String(i).padStart(3, '0')}`;
            const date = new Date(2023, 9, i).toLocaleDateString('pt-BR');
            const rawLat = -(23 + (i * 0.05) % 1); 
            const rawLong = -(46 + (i * 0.03) % 1);
            const formattedLat = convertToDMS(rawLat, true);
            const formattedLong = convertToDMS(rawLong, false);
            const editedFields = {};
            if (i % 3 === 0) { editedFields['loc_endereco'] = true; editedFields['fin_valTotal'] = true; }

            allLaudos.push({
                id: i, numDocumento: docNum, endereco: `Rua das Flores, ${i*10}`,
                coordS: formattedLat, coordW: formattedLong, 
                estadoConservacao: (i%2===0 ? 'Bom' : 'Regular'), valorImovel: `R$ ${400 + i}.000,00`,
                dataExtracao: date, detalhes: getDetails(i, formattedLat, formattedLong), detalhes_edited: editedFields
            });
        }
        filteredLaudos = [...allLaudos];
    }

    // --- 4. PAGINAÇÃO ---
    function renderPaginationControls() {
        if (!paginationWrapper) return;
        paginationWrapper.innerHTML = '';
        if (filteredLaudos.length === 0) return;

        const totalPages = Math.ceil(filteredLaudos.length / itemsPerPage);
        const startItem = (currentPage - 1) * itemsPerPage + 1;
        const endItem = Math.min(currentPage * itemsPerPage, filteredLaudos.length);
        const totalItems = filteredLaudos.length;

        const selectorHTML = `
            <div class="items-per-page">
                <label for="items-per-page-select">Itens por página:</label>
                <select id="items-per-page-select">
                    <option value="4" ${itemsPerPage === 4 ? 'selected' : ''}>4</option>
                    <option value="8" ${itemsPerPage === 8 ? 'selected' : ''}>8</option>
                    <option value="16" ${itemsPerPage === 16 ? 'selected' : ''}>16</option>
                    <option value="32" ${itemsPerPage === 32 ? 'selected' : ''}>32</option>
                </select>
            </div>
        `;

        let buttonsHTML = `<div class="pagination-controls" id="pagination-buttons-container">`;
        buttonsHTML += `<span class="pagination-info">${startItem}-${endItem} de ${totalItems}</span>`;
        if (totalPages > 1) {
            buttonsHTML += `<button class="page-btn" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>&laquo;</button>`;
            let startPage = 1, endPage = totalPages;
            if (totalPages > 3) {
                if (currentPage === 1) { endPage = 3; }
                else if (currentPage >= totalPages - 1) { startPage = totalPages - 2; }
                else { startPage = currentPage - 1; endPage = currentPage + 1; }
            }
            for (let i = startPage; i <= endPage; i++) {
                buttonsHTML += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
            }
            buttonsHTML += `<button class="page-btn" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>&raquo;</button>`;
        }
        buttonsHTML += `</div>`;

        paginationWrapper.innerHTML = selectorHTML + buttonsHTML;

        const selectEl = document.getElementById('items-per-page-select');
        if(selectEl) {
            selectEl.addEventListener('change', (e) => { itemsPerPage = parseInt(e.target.value); currentPage = 1; render(); });
        }
        const buttonsContainer = document.getElementById('pagination-buttons-container');
        if(buttonsContainer) {
            buttonsContainer.addEventListener('click', (e) => {
                const btn = e.target.closest('.page-btn');
                if (btn && !btn.disabled) { currentPage = parseInt(btn.dataset.page); render(); }
            });
        }
    }

    // --- 5. RENDERIZAÇÃO ---
    function renderTable() {
        if (!tableBody) return;
        tableBody.innerHTML = '';
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageItems = filteredLaudos.slice(startIndex, endIndex);

        if (pageItems.length === 0 && filteredLaudos.length > 0) { currentPage = Math.max(1, currentPage - 1); render(); return; }
        if (pageItems.length === 0) { tableBody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding: 20px;">Nenhum laudo encontrado.</td></tr>'; return; }

        pageItems.forEach(laudo => {
            const isChecked = selectedLaudos.has(laudo.id);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><div class="custom-checkbox"><input type="checkbox" class="row-checkbox" data-id="${laudo.id}" ${isChecked ? 'checked' : ''}><span class="checkmark">✓</span></div></td>
                <td><a href="#" class="laudo-doc-link" data-id="${laudo.id}">${laudo.numDocumento}</a></td>
                <td>${laudo.endereco}</td>
                <td>${laudo.coordS}</td>
                <td>${laudo.coordW}</td>
                <td>${laudo.estadoConservacao}</td>
                <td>${laudo.valorImovel}</td>
                <td>${laudo.dataExtracao}</td>
                <td><button class="btn-delete" data-id="${laudo.id}"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/><path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/></svg></button></td>
            `;
            tableBody.appendChild(tr);
        });
    }

    function updateSelectedCount() {
        const count = selectedLaudos.size;
        if (selectedCountSpan) selectedCountSpan.textContent = count === 0 ? 'Nenhum laudo selecionado' : (count === 1 ? '1 laudo selecionado' : `${count} laudos selecionados`);
        if (btnDownload) btnDownload.disabled = (count === 0 || selectedExportFormat === null);
    }

    function render() { renderTable(); renderPaginationControls(); updateSelectedCount(); }

    // --- 6. MODAIS ---
    let modalConfirm;
    function createConfirmationModal() {
        const template = document.getElementById('template-modal-confirmacao');
        if (!template) { console.error("Template Modal Confirmação não encontrado"); return; }
        const clone = template.content.cloneNode(true);
        document.body.appendChild(clone);
        modalConfirm = document.getElementById('confirmation-modal');
        const closeBtnX = modalConfirm.querySelector('#modal-close-btn');
        const cancelBtn = modalConfirm.querySelector('#btn-cancel-delete');
        const confirmBtn = modalConfirm.querySelector('#btn-confirm-delete');
        const closeModal = () => hideConfirmModal();
        if(closeBtnX) closeBtnX.addEventListener('click', closeModal);
        if(cancelBtn) cancelBtn.addEventListener('click', closeModal);
        modalConfirm.addEventListener('click', (e) => { if (e.target === modalConfirm) closeModal(); });
        if(confirmBtn) confirmBtn.addEventListener('click', confirmDelete);
    }
    let idToDelete = null; 
    function showConfirmModal(id = null) { idToDelete = id; modalConfirm.classList.remove('hidden'); }
    function hideConfirmModal() { modalConfirm.classList.add('hidden'); idToDelete = null; }
    function confirmDelete() {
        if (idToDelete) {
            allLaudos = allLaudos.filter(l => l.id !== idToDelete);
            filteredLaudos = filteredLaudos.filter(l => l.id !== idToDelete);
            selectedLaudos.delete(idToDelete);
        } else {
            allLaudos = []; filteredLaudos = []; selectedLaudos.clear();
        }
        render(); hideConfirmModal();
    }

    let modalDetails;
    function createDetailsModal() {
        const template = document.getElementById('template-modal-detalhes');
        if (!template) { console.error("Template Modal Detalhes não encontrado"); return; }
        const clone = template.content.cloneNode(true);
        document.body.appendChild(clone);
        modalDetails = document.getElementById('details-modal');
        const closeBtn = modalDetails.querySelector('#details-close-btn');
        if(closeBtn) closeBtn.addEventListener('click', () => modalDetails.classList.add('hidden'));
        modalDetails.addEventListener('click', (e) => { if (e.target === modalDetails) modalDetails.classList.add('hidden'); });
    }
    function showDetails(id) {
        const laudo = allLaudos.find(l => l.id === id);
        if (!laudo) return;
        const updateDetail = (elementId, value, key) => {
            const el = modalDetails.querySelector(`#${elementId}`);
            if (el) {
                const isEdited = laudo.detalhes_edited && laudo.detalhes_edited[key];
                let displayValue = value || 'Não informado';
                if (isEdited) displayValue = `${displayValue}<span class="edited-asterisk">*</span>`;
                el.innerHTML = displayValue; el.classList.remove('not-found');
            }
        };
        modalDetails.querySelector('#details-title').textContent = `Detalhes do Laudo ${laudo.numDocumento}`;
        Object.keys(laudo.detalhes).forEach(key => { updateDetail(`detail-${key}`, laudo.detalhes[key], key); });
        modalDetails.classList.remove('hidden');
    }

    // --- 7. DROPDOWN E DOWNLOAD ---
    function setupDropdownAndDownload() {
        const dropdownMenu = document.getElementById('dropdown-menu');
        if (!dropdownBtn || !dropdownMenu) return;

        dropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation(); 
            dropdownMenu.classList.toggle('show');
        });

        document.addEventListener('click', (e) => {
            if (!dropdownBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownMenu.classList.remove('show');
            }
        });

        const links = dropdownMenu.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const text = link.textContent;
                selectedFormatText.textContent = text; 
                selectedExportFormat = link.dataset.value;
                dropdownMenu.classList.remove('show');
                updateSelectedCount(); 
            });
        });

        if(btnDownload) {
            btnDownload.addEventListener('click', () => {
                if(selectedLaudos.size > 0 && selectedExportFormat) {
                    const count = selectedLaudos.size;
                    // CORREÇÃO: Pluralização da mensagem
                    const msg = count === 1 ? 'laudo baixado com sucesso' : 'laudos baixados com sucesso';
                    successMsg.textContent = msg;
                    successMsg.classList.remove('hidden');

                    selectedLaudos.clear();
                    selectedExportFormat = null;
                    selectedFormatText.textContent = "Selecionar formato";

                    render();

                    setTimeout(() => {
                        successMsg.classList.add('hidden');
                    }, 3000);
                }
            });
        }
    }

    // Listeners
    if(searchBtn) {
        searchBtn.addEventListener('click', (e) => {
            e.preventDefault(); 
            const docTerm = inputDoc ? inputDoc.value.toLowerCase() : '';
            const addrTerm = inputAddress ? inputAddress.value.toLowerCase() : '';
            filteredLaudos = allLaudos.filter(l => {
                const matchDoc = l.numDocumento.toLowerCase().includes(docTerm);
                const matchAddr = l.endereco.toLowerCase().includes(addrTerm);
                return matchDoc && matchAddr;
            });
            currentPage = 1; render();
        });
    }
    if(selectAllBtn) selectAllBtn.addEventListener('click', () => { filteredLaudos.forEach(l => selectedLaudos.add(l.id)); render(); });
    if(deselectAllBtn) deselectAllBtn.addEventListener('click', () => { showConfirmModal(null); });

    if(tableBody) {
        tableBody.addEventListener('click', (e) => {
            const target = e.target;
            const deleteBtn = target.closest('.btn-delete');
            const docLink = target.closest('.laudo-doc-link');
            const checkbox = target.closest('.custom-checkbox');
            if (deleteBtn) { showConfirmModal(parseInt(deleteBtn.dataset.id)); } 
            else if (docLink) { e.preventDefault(); showDetails(parseInt(docLink.dataset.id)); } 
            else if (checkbox) {
                const input = checkbox.querySelector('input');
                if (target.tagName !== 'INPUT') input.checked = !input.checked;
                const id = parseInt(input.dataset.id);
                if (input.checked) selectedLaudos.add(id); else selectedLaudos.delete(id);
                updateSelectedCount();
            }
        });
    }

    function init() {
        createMockData();
        createConfirmationModal();
        createDetailsModal();
        setupDropdownAndDownload(); 
        render();
    }
    init();
});