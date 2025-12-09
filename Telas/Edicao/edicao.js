document.addEventListener('DOMContentLoaded', () => {
    // CORREÇÃO DE EMERGÊNCIA: Fechar qualquer modal aberto
    const modal = document.getElementById('confirmation-modal');
    if (modal && !modal.classList.contains('hidden')) {
        modal.classList.add('hidden');
        console.log('Modal fechado forçadamente na inicialização');
    }
    const detailsModal = document.getElementById('details-modal');
    if (detailsModal) detailsModal.classList.add('hidden');

    // --- 1. ESTADO DA APLICAÇÃO ---
    let allLaudos = [];
    let selectedLaudos = new Set();
    let currentPage = 1;
    let itemsPerPage = 4;
    let itemToDelete = null;
    let currentEditingId = null;

    // --- 2. SELETORES DO DOM ---
    const tableBody = document.getElementById('table-body');
    const paginationWrapper = document.getElementById('pagination-wrapper');
    const selectedBadge = document.getElementById('selected-count-badge');
    const selectAllBtn = document.getElementById('select-all-text');
    const deselectAllBtn = document.getElementById('deselect-all-text');
    const btnValidate = document.getElementById('btn-validate');

    const btnConfirm = document.getElementById('btn-confirm-delete');
    const btnCloseDetails = document.getElementById('btn-close-details');
    const btnEditMode = document.getElementById('btn-edit-mode');
    const btnSaveChanges = document.getElementById('btn-save-changes');
    const successMessage = document.getElementById('success-message');

    // --- 3. DADOS DE TESTE (MOCK) ---
    function createMockData() {
        allLaudos = [];
        
        const getDetails = (i) => ({
            endereco: `Rua Exemplo, ${i * 10}`,
            numero: `${i * 12}`,
            complemento: Math.random() > 0.5 ? 'Apto 101' : '',
            bairro: 'Centro',
            cep: '50000-000',
            pais: 'Brasil',
            estado: 'PE',
            cidade: 'Recife',
            regiao: 'Metropolitana',
            confrontanteFrente: 'Rua Principal',
            confrontanteFundo: 'Lote 3',
            confrontanteDireita: 'Lote 1',
            confrontanteEsquerda: 'Lote 2',
            pontoReferencia: 'Ao lado da padaria',
            observacaoLoc: 'Terreno plano',
            coordS: '-8.123',
            coordW: '-34.567',
            areaTerreno: `${300 + i}m²`,
            areaConstruida: `${100 + i}m²`,
            unidadeMedida: 'm²',
            estadoConservacao: 'Bom',
            limitacaoAdm: 'Não',
            criterioValoracao: 'Comparativo Direto',
            dataValoracao: '28/11/2025',
            numDocumento: `DOC-${i}`,
            valorConstrucao: `R$ ${150000 + (i*1000)},00`,
            valorAreaConstruida: 'R$ 2.000/m²',
            valorTerreno: `R$ ${200000 + (i*1000)},00`,
            valorTotal: `R$ ${350000 + (i*2000)},00`,
            observacaoFin: 'Valores compatíveis com mercado'
        });

        const detailKeys = Object.keys(getDetails(1));

        for (let i = 1; i <= 50; i++) {
            const totalDados = detailKeys.length;
            let filledCount = Math.floor(Math.random() * (totalDados + 1));
            
            if (i === 1) filledCount = Math.floor(totalDados * 0.4); 
            if (i === 2) filledCount = totalDados;
            if (i === 3) filledCount = Math.floor(totalDados * 0.7);
            if (i === 4) filledCount = Math.floor(totalDados * 0.1);

            let percentNum = Math.round((filledCount / totalDados) * 100);
            
            let acao = 'Prosseguir';
            if (percentNum < 40) acao = 'Descartado';
            else if (percentNum < 90) acao = 'Revisar Campos';

            let details = getDetails(i);

            if (percentNum < 100) {
                const keysShuffled = [...detailKeys].sort(() => 0.5 - Math.random());
                const keysToRemove = keysShuffled.slice(0, totalDados - filledCount);
                keysToRemove.forEach(k => details[k] = null);
            }

            allLaudos.push({
                id: i,
                nomeArquivo: `Laudo_${String(i).padStart(3, '0')}.pdf`,
                nomeLaudo: `LA ${String(i).padStart(3, '0')} SAD/PE`,
                dadosExtraidos: `${filledCount}/${totalDados}`,
                percentual: `${percentNum}%`,
                confiabilidadeVal: percentNum,
                acaoRecomendada: acao,
                tooltipText: acao === 'Prosseguir' ? 'Dados completos.' : 'Dados faltantes.',
                detalhes: details,
                camposEditados: new Set()
            });
        }
    }

    // --- 4. RENDERIZAÇÃO ---
    function renderTable() {
        if (!tableBody) return;
        tableBody.innerHTML = '';
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageItems = allLaudos.slice(startIndex, endIndex);

        if (pageItems.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding: 20px;">Nenhum laudo encontrado.</td></tr>';
            return;
        }

        pageItems.forEach(laudo => {
            const isChecked = selectedLaudos.has(laudo.id);
            const isDiscarded = laudo.acaoRecomendada === 'Descartado';
            
            let rowClass = '', barColorClass = '', textClass = '', iconHtml = '', actionIcon = '';

            if (isDiscarded) {
                rowClass = 'row-discarded';
                barColorClass = 'status-red';
                textClass = 'action-text red';
                
                // X Quadrado Preenchido para item descartado
                iconHtml = `<div class="discard-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-x-square-fill" viewBox="0 0 16 16"><path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2zm3.354 4.646L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 1 1 .708-.708z"/></svg></div>`;
                
                actionIcon = `<svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg>`;
            } else {
                iconHtml = `<div class="custom-checkbox"><input type="checkbox" class="row-checkbox" data-id="${laudo.id}" ${isChecked ? 'checked' : ''}></div>`;
                if (laudo.acaoRecomendada === 'Prosseguir') {
                    barColorClass = 'status-green'; textClass = 'action-text green';
                    actionIcon = `<svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/></svg>`;
                } else {
                    barColorClass = 'status-yellow'; textClass = 'action-text yellow';
                    actionIcon = `<svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/></svg>`;
                }
            }

            const tr = document.createElement('tr');
            if(rowClass) tr.className = rowClass;

            tr.innerHTML = `
                <td>${iconHtml}</td>
                <td>${laudo.id}</td>
                <td>
                    <div class="doc-link-wrapper">
                        <a href="#" class="laudo-link" data-id="${laudo.id}">${laudo.nomeArquivo}</a>
                        <svg class="eye-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                    </div>
                </td>
                <td>${laudo.dadosExtraidos}</td>
                <td>${laudo.percentual}</td>
                <td class="${barColorClass}">
                    <div class="reliability-wrapper" title="${laudo.tooltipText}">
                        <div class="reliability-track">
                            <div class="reliability-bar" style="width: ${laudo.confiabilidadeVal}%"></div>
                        </div>
                    </div>
                </td>
                <td><div class="action-cell ${textClass}">${actionIcon} <span>${laudo.acaoRecomendada}</span></div></td>
                <td style="text-align: right;"><button class="btn-trash" data-id="${laudo.id}"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/><path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/></svg></button></td>
            `;
            tableBody.appendChild(tr);
        });
    }

    // --- FUNÇÕES AUXILIARES ---
    function updateSelectedCount() {
        if (!selectedBadge || !btnValidate) return;
        const count = selectedLaudos.size;
        
        // Verifica se todos os válidos estão selecionados
        const validLaudos = allLaudos.filter(l => l.acaoRecomendada !== 'Descartado');
        const allSelected = validLaudos.length > 0 && validLaudos.every(l => selectedLaudos.has(l.id));
        
        if (selectAllBtn) {
            selectAllBtn.textContent = allSelected ? "Desmarcar tudo" : "Selecionar tudo";
        }

        if (count > 0) {
            selectedBadge.textContent = count === 1 ? '1 laudo selecionado' : `${count} laudos selecionados`;
            selectedBadge.classList.remove('hidden');
            btnValidate.disabled = false;
        } else {
            selectedBadge.classList.add('hidden');
            btnValidate.disabled = true;
        }
    }

    function renderPagination() {
        if (!paginationWrapper) return;
        const totalPages = Math.ceil(allLaudos.length / itemsPerPage);
        const startItem = allLaudos.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
        const endItem = Math.min(startItem + itemsPerPage - 1, allLaudos.length);

        let html = `
            <div class="pagination-controls">
                <span>Itens por página</span>
                <select class="page-size-select" id="items-per-page">
                    <option value="4" ${itemsPerPage===4?'selected':''}>4</option>
                    <option value="8" ${itemsPerPage===8?'selected':''}>8</option>
                    <option value="16" ${itemsPerPage===16?'selected':''}>16</option>
                </select>
                <span style="margin-left: 10px;">${startItem}-${endItem} de ${allLaudos.length}</span>
                <button class="page-nav-btn" data-action="prev" ${currentPage===1?'disabled':''}>‹</button>
                <div class="page-numbers"><span class="active">${currentPage}</span></div>
                <button class="page-nav-btn" data-action="next" ${currentPage===totalPages?'disabled':''}>›</button>
            </div>
        `;
        paginationWrapper.innerHTML = html;
        
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

    function render() { renderTable(); renderPagination(); updateSelectedCount(); }

    // --- 5. LÓGICA DO MODAL ---
    function setupModal() {
        let modal = document.getElementById('confirmation-modal');
        if (!modal) return;
        
        const btnCancel = document.getElementById('btn-cancel-delete');
        const btnConfirm = document.getElementById('btn-confirm-delete');
        const title = modal.querySelector('h3');
        const text = modal.querySelector('#modal-message');

        btnCancel.onclick = () => { modal.classList.add('hidden'); itemToDelete = null; };
        
        btnConfirm.onclick = () => {
            if (itemToDelete === 'ALL') {
                allLaudos = []; selectedLaudos.clear(); showToast('Todos os laudos foram excluídos.');
            } else if (itemToDelete === 'VALIDATE') {
                const count = selectedLaudos.size;
                allLaudos = allLaudos.filter(l => !selectedLaudos.has(l.id));
                selectedLaudos.clear();
                
                if (count === 1) {
                    showToast('Laudo validado e enviado para exportação.');
                } else {
                    showToast(`${count} laudos validados e enviados para exportação.`);
                }
                
            } else if (itemToDelete) {
                const laudo = allLaudos.find(l => l.id === itemToDelete);
                const nome = laudo ? laudo.nomeArquivo : 'Item';
                allLaudos = allLaudos.filter(l => l.id !== itemToDelete);
                selectedLaudos.delete(itemToDelete);
                showToast(`Laudo ${nome} excluído com sucesso.`);
            }
            modal.classList.add('hidden'); itemToDelete = null;
            if ((currentPage - 1) * itemsPerPage >= allLaudos.length && currentPage > 1) currentPage--;
            render();
        };

        window.openModal = (action, id = null) => {
            btnConfirm.className = '';
            
            if (action === 'DELETE_ONE') {
                itemToDelete = id; title.textContent = 'Confirmar Exclusão'; text.textContent = 'Tem certeza que deseja excluir este item?'; btnConfirm.className = 'btn-danger'; btnConfirm.textContent = 'Excluir';
            } else if (action === 'DELETE_ALL') {
                itemToDelete = 'ALL'; title.textContent = 'Excluir Tudo'; text.textContent = 'Tem certeza que deseja excluir TODOS os laudos?'; btnConfirm.className = 'btn-danger'; btnConfirm.textContent = 'Excluir Tudo';
            } else if (action === 'VALIDATE') {
                itemToDelete = 'VALIDATE'; title.textContent = 'Validar Dados'; text.textContent = `Confirma a validação de ${selectedLaudos.size} laudos selecionados?`; 
                btnConfirm.className = 'btn-primary'; 
                btnConfirm.style.cursor = 'pointer'; 
                btnConfirm.textContent = 'Confirmar';
            }
            modal.classList.remove('hidden');
        }
    }

    // --- 6. TOAST ---
    function createToastStyles() { }
    
    function showToast(message) {
        let container = document.getElementById('toast-container');
        if(!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }
        
        const toast = document.createElement('div');
        toast.className = 'toast-message';
        
        // Ícone SVG: check-circle-fill (bola verde com check branco)
        toast.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-check-circle-fill" viewBox="0 0 16 16" style="color: #22c55e;">
          <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
        </svg><span>${message}</span>`;
        
        container.appendChild(toast);
        setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 4000);
    }

    // --- 7. EVENT LISTENERS ---
    
    btnValidate.addEventListener('click', () => { if (selectedLaudos.size > 0) window.openModal('VALIDATE'); });
    
    // Toggle Selecionar Tudo
    selectAllBtn.addEventListener('click', () => {
        const validLaudos = allLaudos.filter(l => l.acaoRecomendada !== 'Descartado');
        const allSelected = validLaudos.length > 0 && validLaudos.every(l => selectedLaudos.has(l.id));

        if (allSelected) selectedLaudos.clear();
        else validLaudos.forEach(l => selectedLaudos.add(l.id));
        
        render();
    });

    deselectAllBtn.addEventListener('click', () => { if(allLaudos.length > 0) window.openModal('DELETE_ALL'); });

    tableBody.addEventListener('click', (e) => {
        const target = e.target;
        const btnTrash = target.closest('.btn-trash');
        if (btnTrash) { window.openModal('DELETE_ONE', parseInt(btnTrash.dataset.id)); return; }

        if (target.classList.contains('row-checkbox') || target.closest('.custom-checkbox')) {
            const checkbox = target.classList.contains('row-checkbox') ? target : target.querySelector('.row-checkbox');
            if (checkbox) {
                const id = parseInt(checkbox.dataset.id);
                checkbox.checked ? selectedLaudos.add(id) : selectedLaudos.delete(id);
                updateSelectedCount();
            }
            return;
        }

        const laudoLink = target.closest('.laudo-link');
        if (laudoLink) {
            e.preventDefault();
            const id = parseInt(laudoLink.dataset.id);
            openDetailsModal(id);
            return;
        }
    });

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
        const laudo = allLaudos.find(l => l.id === id);
        if (!laudo) return;
        currentEditingId = id;
        document.getElementById('modal-laudo-title').textContent = `Detalhes do Laudo ${laudo.nomeLaudo}`;
        
        btnEditMode.classList.remove('hidden');
        btnSaveChanges.classList.add('hidden');
        successMessage.classList.add('hidden');
        
        renderDetailsFields(laudo, false);
        document.getElementById('details-modal').classList.remove('hidden');
    }

    function renderDetailsFields(laudo, isEditMode) {
        // Função para renderizar cada grupo de campos
        const renderGroup = (map, containerId) => {
            const container = document.getElementById(containerId);
            if (!container) return;
            
            container.innerHTML = '';
            
            map.forEach(field => {
                const value = laudo.detalhes[field.key];
                const isMissing = !value || value === '';
                const displayValue = isMissing ? 'Não encontrado' : value;
                const wasEdited = laudo.camposEditados.has(field.key);
                
                const div = document.createElement('div');
                div.className = 'field-item';
                
                // Criar label com asterisco se foi editado
                let labelHtml = `${field.l}`;
                if (wasEdited) {
                    labelHtml += ' <span class="edited-mark">*</span>';
                }
                
                // Conteúdo do campo (input ou texto)
                let contentHtml = '';
                if (isEditMode) {
                    contentHtml = `<input type="text" class="edit-input" data-key="${field.key}" value="${isMissing ? '' : value}" placeholder="...">`;
                } else {
                    const missingClass = isMissing ? 'missing' : '';
                    contentHtml = `<span class="field-value ${missingClass}">${displayValue}</span>`;
                }
                
                div.innerHTML = `
                    <label class="field-label">${labelHtml}</label>
                    ${contentHtml}
                `;
                
                container.appendChild(div);
            });
        };
        
        // Renderizar todos os grupos
        renderGroup(fieldMap.loc, 'grid-localizacao');
        renderGroup(fieldMap.carac, 'grid-caracteristicas');
        renderGroup(fieldMap.fin, 'grid-financeiros');
    }

    btnEditMode.addEventListener('click', () => {
        const laudo = allLaudos.find(l => l.id === currentEditingId);
        btnEditMode.classList.add('hidden');
        btnSaveChanges.classList.remove('hidden');
        successMessage.classList.add('hidden');
        renderDetailsFields(laudo, true);
    });

    btnSaveChanges.addEventListener('click', () => {
        const laudo = allLaudos.find(l => l.id === currentEditingId);
        const inputs = document.querySelectorAll('.edit-input');
        inputs.forEach(inp => {
            const key = inp.dataset.key;
            if(inp.value !== (laudo.detalhes[key] || '')) {
                laudo.detalhes[key] = inp.value;
                laudo.camposEditados.add(key);
            }
        });
        
        btnSaveChanges.classList.add('hidden');
        btnEditMode.classList.remove('hidden');
        successMessage.classList.remove('hidden');
        
        // Sumir mensagem de sucesso após 3 segundos
        setTimeout(() => {
            successMessage.classList.add('hidden');
        }, 3000);

        renderDetailsFields(laudo, false);
    });

    btnCloseDetails.addEventListener('click', () => {
        document.getElementById('details-modal').classList.add('hidden');
        currentEditingId = null;
    });

    // --- 8. INICIALIZAÇÃO ---
    function init() {
        console.log('Inicializando aplicação...');
        if (!tableBody || !selectAllBtn || !deselectAllBtn || !btnValidate) { console.error('Elementos essenciais não encontrados!'); return; }

        createToastStyles();
        createMockData();
        setupModal();
        render();
        updateSelectedCount();
        console.log('Aplicação inicializada com sucesso!');
    }

    init();
});