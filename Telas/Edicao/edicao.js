document.addEventListener('DOMContentLoaded', () => {

    // --- 1. ESTADO DA APLICAÇÃO ---
    let allLaudos = [];
    let selectedLaudos = new Set();
    let currentPage = 1;
    let itemsPerPage = 4;

    // --- 2. SELETORES DO DOM ---
    const tableBody = document.getElementById('table-body');
    const paginationContainer = document.getElementById('pagination-container');
    const selectAllBtn = document.getElementById('select-all-text');
    const deselectAllBtn = document.getElementById('deselect-all-text');
    const selectedCountSpan = document.getElementById('selected-count-balloon');
    const validateDataBtn = document.getElementById('validate-data-btn');
    const footerBar = document.querySelector('.footer-bar');
    const cardFooter = document.querySelector('.card-footer');

    // --- 3. DADOS DE TESTE (MOCK) ---
    function createMockData() {
        allLaudos = [];
        const getDetails = (i) => ({
            loc_endereco: 'Rua XXXXXXXXXX', loc_numero: String(i).padStart(3, '0'),
            loc_complemento: (i % 3 === 0) ? 'Apto ' + i : null, loc_bairro: 'XXXXX',
            loc_cep: 'XXXXX', loc_pais: 'XXXXX', loc_estado: 'XXXXXX',
            loc_cidade: (i % 2 === 0) ? 'XXXXXXXXXX' : null, loc_regiao: 'XXXXXX',
            loc_confFrente: null, loc_confFundo: 'XXXXXXXXXXXXXX', loc_confDireita: null,
            loc_confEsquerda: 'XXXXXXXXXXXXXX', loc_pontoRef: 'XXXXXXXXXX', loc_obs: 'XXXXXXXXXXXXXX',
            loc_coordS: null, loc_coordW: 'XXXXXXXXXXXXXX', carac_areaTerreno: 'XXXXXXXXXXX',
            carac_areaConstruida: (i % 2 === 0) ? 'XXXXXXXXXXX' : null, carac_unidadeMedida: 'XXXXXXXXXXXXXX',
            carac_estadoConserv: 'XXXXXXXXXXXXXX', carac_limitAdmin: null, fin_critVal: 'XXXXXXXXXXX',
            fin_dataVal: null, fin_numDoc: (i % 4 === 0) ? 'DOC-00' + i : null,
            fin_valConstNova: 'XXXXXXXXXXXXXX', fin_valAreaConst: 'XXXXXXXXXXXXXX',
            fin_valTerreno: 'XXXXXXXXXXXXXX', fin_valTotal: 'XXXXXXXXXXXXXX', fin_obs: 'XXXXXXXXXXXXXX'
        });

        const getTooltip = (acao) => {
            if (acao === 'Prosseguir') return 'Muitos dados extraídos, prosseguir para fazer a exportação.';
            if (acao === 'Revisar Campos') return 'Revise os campos faltantes do laudo e preencha manualmente.';
            if (acao === 'Descartado') return 'Descartado por possuir poucos dados extraídos.';
            return '';
        };

        for (let i = 1; i <= 50; i++) {
            const totalDados = 30;
            const dadosOK = Math.floor(Math.random() * (totalDados + 1));
            const percentNum = Math.round((dadosOK / totalDados) * 100);
            let acao = percentNum >= 90 ? 'Prosseguir' : (percentNum >= 40 ? 'Revisar Campos' : 'Descartado');
            
            allLaudos.push({
                id: i, nomeArquivo: `Laudo_${String(i).padStart(3, '0')}.pdf`,
                nomeLaudo: `LA ${String(i).padStart(3, '0')} SAD/XXX`,
                dadosExtraidos: `${dadosOK}/${totalDados}`, percentual: `${percentNum}%`,
                confiabilidade: `${percentNum}%`, acaoRecomendada: acao,
                tooltipText: getTooltip(acao),
                detalhes: getDetails(i),
                detalhes_edited: {} 
            });
        }
    }

    // --- 4. FUNÇÕES DE RENDERIZAÇÃO ---
    function renderTable() {
        tableBody.innerHTML = '';
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageItems = allLaudos.slice(startIndex, endIndex);

        if (pageItems.length === 0 && allLaudos.length > 0) {
            currentPage = Math.max(1, currentPage - 1);
            render();
            return;
        }

        pageItems.forEach(laudo => {
            const isChecked = selectedLaudos.has(laudo.id);
            const tr = document.createElement('tr');
            const isErrorRow = laudo.acaoRecomendada === 'Descartado';
            if (isErrorRow) tr.classList.add('row-error');
            const getStatusClass = (acao) => (acao === 'Prosseguir' ? 'status-success' : (acao === 'Revisar Campos' ? 'status-warning' : (acao === 'Descartado' ? 'status-danger' : '')));
            const getConfidenceClass = (confStr) => {
                const confNum = parseInt(confStr.replace('%', ''), 10);
                return confNum >= 90 ? 'confidence-success' : (confNum >= 40 ? 'confidence-warning' : 'confidence-danger');
            };
            const confidenceClass = getConfidenceClass(laudo.confiabilidade);
            const statusClass = getStatusClass(laudo.acaoRecomendada);

            tr.innerHTML = `
                <td>
                    <div class="custom-checkbox ${isErrorRow ? 'checkbox-error disabled' : ''}">
                        <input type="checkbox" class="row-checkbox" data-id="${laudo.id}" ${isChecked ? 'checked' : ''} ${isErrorRow ? 'disabled' : ''}>
                        <span class="checkmark">${isErrorRow ? '×' : '✓'}</span>
                    </div>
                </td>
                <td>${laudo.id}</td>
                <td>
                    <a href="#" class="laudo-name-link" data-id="${laudo.id}">
                        ${laudo.nomeArquivo}
                        <span class="laudo-link-icon"></span>
                    </a>
                </td>
                <td>${laudo.dadosExtraidos}</td>
                <td>${laudo.percentual}</td>
                <td>
                    <div class="confidence-bar">
                        <div class="confidence-track">
                            <div class="confidence-value ${confidenceClass}" style="width: ${laudo.confiabilidade};"></div>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="status-wrapper">
                        <div class="info-tooltip">
                            <svg class="info-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/><path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.064.293.006.399.287.47l.45.083.082.38-2.29.287-.082-.38.45-.083c.294-.07.352-.176.288-.469l.738-3.468c.064-.293-.006-.399-.287-.47l-.45-.083-.082-.38zm.05-3.466.083-.38-2.29-.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.064.293-.006.399.287.47l.45.083.082.38-2.29-.287-.082-.38.45-.083c.294-.07.352-.176.288-.469l.738-3.468c.064-.293.006-.399-.287-.47l-.45-.083L8.06 3.1z"/></svg>
                            <span class="tooltip-text">${laudo.tooltipText}</span>
                        </div>
                        <div class="status-pill ${statusClass}">
                            <span>${laudo.acaoRecomendada}</span>
                        </div>
                    </div>
                </td>
                <td>
                    <button class="btn-delete" data-id="${laudo.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/><path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/></svg>
                    </button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }
    function updateSelectedCount() {
        const count = selectedLaudos.size;
        if (count === 0) {
            selectedCountSpan.textContent = 'Nenhum laudo selecionado';
            selectedCountSpan.classList.remove('active');
        } else {
            selectedCountSpan.textContent = count === 1 ? '1 laudo selecionado' : `${count} laudos selecionados`;
            selectedCountSpan.classList.add('active');
        }
    }
    function renderPagination() {
        const totalPages = Math.ceil(allLaudos.length / itemsPerPage);
        paginationContainer.innerHTML = '';
        const startItem = allLaudos.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
        const endItem = Math.min(startItem + itemsPerPage - 1, allLaudos.length);
        paginationContainer.insertAdjacentHTML('afterbegin', `<span class="pagination-info">${startItem}-${endItem} de ${allLaudos.length}</span>`);
        if (totalPages <= 1) return;
        let buttonsHTML = '';
        buttonsHTML += `<button class="page-btn" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>&laquo;</button>`;
        let startPage, endPage;
        if (totalPages <= 3) {
            startPage = 1; endPage = totalPages;
        } else {
            if (currentPage === 1) {
                startPage = 1; endPage = 3;
            } else if (currentPage >= totalPages - 1) {
                startPage = totalPages - 2; endPage = totalPages;
            } else {
                startPage = currentPage - 1; endPage = currentPage + 1;
            }
        }
        for (let i = startPage; i <= endPage; i++) {
            buttonsHTML += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }
        buttonsHTML += `<button class="page-btn" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>&raquo;</button>`;
        paginationContainer.insertAdjacentHTML('beforeend', buttonsHTML);
    }
    function render() {
        renderTable();
        renderPagination();
        updateSelectedCount();
    }
    function updateValidateButtonState() {
        validateDataBtn.disabled = selectedLaudos.size === 0;
    }

    // --- 5. LÓGICA DO MODAL (CONFIRMAÇÃO) ---
    let modal;
    function createConfirmationModal() {
        const template = document.getElementById('template-modal-confirmacao');
        if (!template) return;
        const modalClone = template.content.cloneNode(true);
        document.body.appendChild(modalClone);

        modal = document.getElementById('confirmation-modal');
        const modalCloseBtn = document.getElementById('modal-close-btn');
        const modalConfirmBtn = document.getElementById('modal-confirm-validate');

        modalCloseBtn.addEventListener('click', hideModal);
        modal.addEventListener('click', (e) => { if (e.target === modal) hideModal(); });
        
        modalConfirmBtn.addEventListener('click', () => {
            allLaudos = allLaudos.filter(laudo => !selectedLaudos.has(laudo.id));
            selectedLaudos.clear();
            currentPage = 1;
            render();
            hideModal();
            updateValidateButtonState();
        });
    }
    function showModal() { if(modal) modal.classList.remove('hidden'); }
    function hideModal() { if(modal) modal.classList.add('hidden'); }

    // --- 6. LÓGICA DO TOAST (NOTIFICAÇÃO) ---
    function createToastContainer() {
        const toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        document.body.prepend(toastContainer);
    }
    function showToast(message) {
        const toastContainer = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast-message success';
        toast.innerHTML = `<span><svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 0C3.58 0 0 3.58 0 8C0 12.42 3.58 16 8 16C12.42 16 16 12.42 16 8C16 3.58 12.42 0 8 0ZM7 11.5L3.5 8L4.91 6.59L7 8.67L11.09 4.59L12.5 6L7 11.5Z" fill="#3E8635"/></svg> ${message}</span><a href="#" class="toast-clear">Limpar</a>`;
        toastContainer.appendChild(toast);
        toast.querySelector('.toast-clear').addEventListener('click', (e) => { e.preventDefault(); toast.remove(); });
        setTimeout(() => { if (toast) toast.remove(); }, 5000);
    }

    // --- 7. LÓGICA DO MODAL (DETALHES) ---
    let detailsModal;
    let currentLaudoId = null;
    let detailSpans = [];
    let msgSuccess;
    let msgDefault;

    function createDetailsModal() {
        const template = document.getElementById('template-modal-detalhes');
        if (!template) return;
        const modalClone = template.content.cloneNode(true);
        document.body.appendChild(modalClone);

        detailsModal = document.getElementById('details-modal');
        detailSpans = detailsModal.querySelectorAll('#details-modal-body span[id^="detail-"]');
        msgSuccess = document.getElementById('edit-success-msg');
        msgDefault = document.getElementById('edit-status-default');

        document.getElementById('details-close-btn').addEventListener('click', hideDetailsModal);
        detailsModal.addEventListener('click', (e) => {
            if (e.target === detailsModal) hideDetailsModal();
        });
        document.getElementById('modal-edit-btn').addEventListener('click', toggleEditMode);
    }

    function showDetailsModal(laudoId) {
        if (!detailsModal) return;
        
        currentLaudoId = laudoId;
        const laudo = allLaudos.find(l => l.id === laudoId);
        if (!laudo) return;

        setDisplayMode(laudo, false); 
        msgSuccess.classList.add('hidden');
        msgDefault.classList.remove('hidden');
        
        detailsModal.querySelector('#details-title').textContent = `Detalhes do Laudo ${laudo.nomeLaudo}`;
        detailsModal.classList.remove('hidden');
    }

    function hideDetailsModal() {
        if(detailsModal) detailsModal.classList.add('hidden');
        currentLaudoId = null;
    }
    
    function updateDetail(span, laudo) {
        const key = span.id.replace('detail-', '');
        const value = laudo.detalhes[key];
        const isEdited = laudo.detalhes_edited[key] === true;
        let displayValue = value || 'Não encontrado';
        
        if (isEdited) {
            displayValue = `<span class="edited-asterisk">*</span>${displayValue}`;
        }
        
        span.innerHTML = displayValue;

        if (value) {
            span.classList.remove('not-found');
        } else {
            span.classList.add('not-found');
        }
    }

    function setEditMode(laudo) {
        const editBtn = document.getElementById('modal-edit-btn');
        editBtn.textContent = 'Salvar Alterações';
        detailsModal.classList.add('edit-mode');
        msgSuccess.classList.add('hidden');
        msgDefault.classList.add('hidden');

        detailSpans.forEach(span => {
            const key = span.id.replace('detail-', '');
            const value = laudo.detalhes[key] || '';
            
            span.textContent = value;
            span.contentEditable = 'true';
        });
    }

    function setDisplayMode(laudo, saveData = false) {
        const editBtn = document.getElementById('modal-edit-btn');
        editBtn.textContent = 'Editar Dados';
        detailsModal.classList.remove('edit-mode');

        detailSpans.forEach(span => {
            if (saveData) {
                const key = span.id.replace('detail-', '');
                const newValue = span.textContent;
                const originalValue = laudo.detalhes[key] || '';
                
                if (originalValue !== newValue) {
                    laudo.detalhes[key] = newValue;
                    laudo.detalhes_edited[key] = true;
                }
            }
            span.contentEditable = 'false';
            updateDetail(span, laudo);
        });

        if (saveData) {
            msgDefault.classList.add('hidden');
            msgSuccess.classList.remove('hidden');
            setTimeout(() => {
                msgSuccess.classList.add('hidden');
                msgDefault.classList.remove('hidden');
            }, 2000);
        } else {
            // Garante que a mensagem default esteja visível ao carregar
            msgDefault.classList.remove('hidden');
        }
    }

    function toggleEditMode() {
        if (!currentLaudoId) return;
        const laudo = allLaudos.find(l => l.id === currentLaudoId);
        if (!laudo) return;
        const isEditMode = detailsModal.classList.contains('edit-mode');
        if (isEditMode) {
            setDisplayMode(laudo, true);
        } else {
            setEditMode(laudo);
        }
    }

    // --- 8. CRIAÇÃO DE ELEMENTOS DINÂMICOS ---
    function createItemsPerPageSelector() {
        const selectorContainer = document.createElement('div');
        selectorContainer.classList.add('items-per-page');
        selectorContainer.innerHTML = `<label for="items-per-page-select">Itens por página</label><select id="items-per-page-select"><option value="4" selected>4</option><option value="8">8</option><option value="16">16</option><option value="32">32</option></select>`;
        const bottomRow = document.createElement('div');
        bottomRow.classList.add('card-footer-bottom-row');
        const paginationEl = document.getElementById('pagination-container');
        bottomRow.appendChild(selectorContainer);
        if (paginationEl) bottomRow.appendChild(paginationEl);
        cardFooter.appendChild(bottomRow);
        document.getElementById('items-per-page-select').addEventListener('change', (e) => {
            itemsPerPage = parseInt(e.target.value, 10);
            currentPage = 1;
            render();
        });
    }

    // --- 9. EVENT LISTENERS ---
    validateDataBtn.addEventListener('click', () => {
        if (selectedLaudos.size > 0) showModal();
        else alert('Por favor, selecione pelo menos um laudo para validar.');
    });

    selectAllBtn.addEventListener('click', () => {
        allLaudos.forEach(laudo => {
            if (laudo.acaoRecomendada !== 'Descartado') selectedLaudos.add(laudo.id);
        });
        render();
        updateValidateButtonState();
    });
    
    deselectAllBtn.addEventListener('click', () => {
        if (confirm('Tem certeza que deseja excluir TODOS os laudos?')) {
            allLaudos = [];
            selectedLaudos.clear();
            currentPage = 1;
            render();
            showToast('Todos os laudos foram excluídos.');
            updateValidateButtonState();
        }
    });

    // (CORRIGIDO) O listener da tabela agora usa 'nomeArquivo' no toast
    tableBody.addEventListener('click', (e) => {
        const target = e.target;
        const deleteButton = target.closest('.btn-delete');
        const checkbox = target.closest('.custom-checkbox');
        const laudoLink = target.closest('.laudo-name-link');
        
        if (deleteButton) {
            const id = parseInt(deleteButton.dataset.id, 10);
            
            // (CORREÇÃO) Busca o nome ANTES de deletar
            const laudoParaExcluir = allLaudos.find(laudo => laudo.id === id);
            const nomeArquivo = laudoParaExcluir ? laudoParaExcluir.nomeArquivo : `ID ${id}`;

            allLaudos = allLaudos.filter(laudo => laudo.id !== id);
            selectedLaudos.delete(id);
            render();
            
            showToast(`Laudo ${nomeArquivo} excluído com sucesso`); // <-- CORRIGIDO
            updateValidateButtonState();

        } else if (checkbox) {
            if (checkbox.classList.contains('disabled')) return;
            const input = checkbox.querySelector('.row-checkbox');
            if (target.tagName !== 'INPUT') input.checked = !input.checked;
            const id = parseInt(input.dataset.id, 10);
            if (input.checked) selectedLaudos.add(id); else selectedLaudos.delete(id);
            updateSelectedCount();
            updateValidateButtonState();
        } else if (laudoLink) {
            e.preventDefault();
            const id = parseInt(laudoLink.dataset.id, 10);
            showDetailsModal(id);
        }
    });

    paginationContainer.addEventListener('click', (e) => {
        const target = e.target.closest('.page-btn');
        if (target && !target.disabled) {
            currentPage = parseInt(target.dataset.page, 10);
            render();
        }
    });

    // --- 10. INICIALIZAÇÃO ---
    function init() {
        createMockData();
        createItemsPerPageSelector();
        createToastContainer();
        createConfirmationModal();
        createDetailsModal();
        render();
        validateDataBtn.disabled = true;
    }

    init();
});