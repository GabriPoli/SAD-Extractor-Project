document.addEventListener('DOMContentLoaded', () => {
    // CORREÇÃO DE EMERGÊNCIA: Fechar qualquer modal aberto
    const modal = document.getElementById('confirmation-modal');
    if (modal && !modal.classList.contains('hidden')) {
        modal.classList.add('hidden');
        console.log('Modal fechado forçadamente na inicialização');
    }

    // --- 1. ESTADO DA APLICAÇÃO ---
    let allLaudos = [];
    let selectedLaudos = new Set();
    let currentPage = 1;
    let itemsPerPage = 4;
    let itemToDelete = null;

    // --- 2. SELETORES DO DOM ---
    const tableBody = document.getElementById('table-body');
    const paginationWrapper = document.getElementById('pagination-wrapper');
    const selectedBadge = document.getElementById('selected-count-badge');
    const selectAllBtn = document.getElementById('select-all-text');
    const deselectAllBtn = document.getElementById('deselect-all-text');
    const btnValidate = document.getElementById('btn-validate');

    // --- 3. DADOS DE TESTE (MOCK) ---
    function createMockData() {
        allLaudos = [];
        
        const getDetails = (i) => ({
            endereco: `Rua Exemplo, ${i * 10}`,
            bairro: 'Centro',
            cidade: 'Recife',
            area: `${100 + i}m²`,
            valor: `R$ ${200000 + (i * 1000)},00`
        });

        const getTooltip = (acao) => {
            if (acao === 'Prosseguir') return 'Dados suficientes. Pronto para exportação.';
            if (acao === 'Revisar Campos') return 'Atenção: Revise os campos faltantes.';
            if (acao === 'Descartado') return 'Erro: Poucos dados extraídos.';
            return '';
        };

        for (let i = 1; i <= 50; i++) {
            const totalDados = 30;
            let dadosOK = Math.floor(Math.random() * (totalDados + 1)); 
            let percentNum = Math.round((dadosOK / totalDados) * 100);
            
            let acao = 'Prosseguir';
            if (percentNum < 40) acao = 'Descartado';
            else if (percentNum < 90) acao = 'Revisar Campos';

            if (i === 1) { acao = 'Revisar Campos'; percentNum = 40; }
            if (i === 2) { acao = 'Prosseguir'; percentNum = 100; }
            if (i === 3) { acao = 'Prosseguir'; percentNum = 70; }
            if (i === 4) { acao = 'Descartado'; percentNum = 10; }

            allLaudos.push({
                id: i,
                nomeArquivo: `Laudo_${String(i).padStart(3, '0')}.pdf`,
                nomeLaudo: `LA ${String(i).padStart(3, '0')} SAD/PE`,
                dadosExtraidos: `${Math.floor((percentNum/100)*30)}/30`,
                percentual: `${percentNum}%`,
                confiabilidadeVal: percentNum,
                acaoRecomendada: acao,
                tooltipText: getTooltip(acao),
                detalhes: getDetails(i),
                detalhes_edited: {} 
            });
        }
    }

    // --- 4. FUNÇÕES DE RENDERIZAÇÃO ---
    function renderTable() {
        if (!tableBody) {
            console.error('tableBody não encontrado');
            return;
        }
        
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
            
            let rowClass = '';
            let barColorClass = '';
            let textClass = '';
            let iconHtml = '';
            let actionIcon = '';

            if (isDiscarded) {
                rowClass = 'row-discarded';
                barColorClass = 'status-red';
                textClass = 'action-text red';
                iconHtml = `<div class="discard-icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/></svg></div>`;
                actionIcon = `<svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg>`;
            } else {
                iconHtml = `<div class="custom-checkbox"><input type="checkbox" class="row-checkbox" data-id="${laudo.id}" ${isChecked ? 'checked' : ''}></div>`;
                
                if (laudo.acaoRecomendada === 'Prosseguir') {
                    barColorClass = 'status-green';
                    textClass = 'action-text green';
                    actionIcon = `<svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/></svg>`;
                } else {
                    barColorClass = 'status-yellow';
                    textClass = 'action-text yellow';
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
                <td>
                    <div class="action-cell ${textClass}">
                       ${actionIcon} <span>${laudo.acaoRecomendada}</span>
                    </div>
                </td>
                <td style="text-align: right;">
                    <button class="btn-trash" data-id="${laudo.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/><path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/></svg>
                    </button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    function updateSelectedCount() {
        if (!selectedBadge || !btnValidate) return;
        
        const count = selectedLaudos.size;
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
                <div class="page-numbers">
                    <span class="active">${currentPage}</span>
                </div>
                <button class="page-nav-btn" data-action="next" ${currentPage===totalPages?'disabled':''}>›</button>
            </div>
        `;
        paginationWrapper.innerHTML = html;

        paginationWrapper.addEventListener('change', (e) => {
            if (e.target.id === 'items-per-page') {
                itemsPerPage = parseInt(e.target.value);
                currentPage = 1;
                render();
            }
        });

        paginationWrapper.addEventListener('click', (e) => {
            const target = e.target;
            if (target.dataset.action === 'prev' && currentPage > 1) {
                currentPage--;
                render();
            } else if (target.dataset.action === 'next' && currentPage < totalPages) {
                currentPage++;
                render();
            }
        });
    }

    function render() {
        renderTable();
        renderPagination();
        updateSelectedCount();
    }

    // --- 5. LÓGICA DO MODAL ---
    function setupModal() {
        let modal = document.getElementById('confirmation-modal');
        
        if (!modal) {
            const template = document.getElementById('template-modal-confirmacao');
            if (template) {
                const clone = template.content.cloneNode(true);
                document.body.appendChild(clone);
                modal = document.getElementById('confirmation-modal');
            }
        }
        
        if (!modal) {
            console.error('Modal não encontrado');
            return;
        }

        // GARANTIR que o modal comece fechado
        modal.classList.add('hidden');

        const btnCancel = document.getElementById('btn-cancel-delete');
        const btnConfirm = document.getElementById('btn-confirm-delete');
        
        if (!btnCancel || !btnConfirm) {
            console.error('Botões do modal não encontrados');
            return;
        }

        const title = modal.querySelector('h3');
        const text = modal.querySelector('p');

        btnCancel.onclick = () => { 
            modal.classList.add('hidden'); 
            itemToDelete = null; 
        };
        
        btnConfirm.onclick = () => {
            if (itemToDelete === 'ALL') {
                allLaudos = [];
                selectedLaudos.clear();
                showToast('Todos os laudos foram excluídos.');
            } else if (itemToDelete === 'VALIDATE') {
                const count = selectedLaudos.size;
                allLaudos = allLaudos.filter(l => !selectedLaudos.has(l.id));
                selectedLaudos.clear();
                showToast(`${count} laudos validados e enviados para exportação.`);
            } else if (itemToDelete) {
                const laudo = allLaudos.find(l => l.id === itemToDelete);
                const nome = laudo ? laudo.nomeArquivo : 'Item';
                allLaudos = allLaudos.filter(l => l.id !== itemToDelete);
                selectedLaudos.delete(itemToDelete);
                showToast(`Laudo ${nome} excluído com sucesso.`);
            }
            
            modal.classList.add('hidden');
            itemToDelete = null;
            if ((currentPage - 1) * itemsPerPage >= allLaudos.length && currentPage > 1) currentPage--;
            render();
        };

        window.openModal = (action, id = null) => {
            if (action === 'DELETE_ONE') {
                itemToDelete = id;
                title.textContent = 'Confirmar Exclusão';
                text.textContent = 'Tem certeza que deseja excluir este item?';
                btnConfirm.className = 'btn-danger';
                btnConfirm.textContent = 'Excluir';
            } else if (action === 'DELETE_ALL') {
                itemToDelete = 'ALL';
                title.textContent = 'Excluir Tudo';
                text.textContent = 'Tem certeza que deseja excluir TODOS os laudos?';
                btnConfirm.className = 'btn-danger';
                btnConfirm.textContent = 'Excluir Tudo';
            } else if (action === 'VALIDATE') {
                itemToDelete = 'VALIDATE';
                title.textContent = 'Validar Dados';
                text.textContent = `Confirma a validação de ${selectedLaudos.size} laudos selecionados?`;
                btnConfirm.className = 'btn-primary';
                btnConfirm.style.backgroundColor = '#0047bb';
                btnConfirm.style.color = 'white';
                btnConfirm.textContent = 'Confirmar';
            }
            modal.classList.remove('hidden');
        }
    }

    // --- 6. LÓGICA DO TOAST ---
    function createToastStyles() {
        const style = document.createElement('style');
        style.innerHTML = `
            #toast-container { position: fixed; top: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px; }
            .toast-message { 
                background: #fff; border-left: 4px solid #22c55e; 
                padding: 15px 20px; border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); 
                display: flex; align-items: center; gap: 10px; font-size: 0.9rem; color: #333; min-width: 300px; 
                animation: slideIn 0.3s ease-out;
            }
            .toast-message svg { color: #22c55e; width: 20px; height: 20px; }
            @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        `;
        document.head.appendChild(style);
        
        const container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    function showToast(message) {
        const container = document.getElementById('toast-container');
        if(!container) return;
        
        const toast = document.createElement('div');
        toast.className = 'toast-message';
        toast.innerHTML = `
            <svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm3.5 6.5-4 4a.5.5 0 0 1-.7 0l-2-2a.5.5 0 0 1 .7-.7L7 9.29l3.65-3.64a.5.5 0 0 1 .7.7z"/></svg>
            <span>${message}</span>
        `;
        container.appendChild(toast);
        setTimeout(() => { 
            toast.style.opacity = '0'; 
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    // --- 7. EVENT LISTENERS ---
    btnValidate.addEventListener('click', () => {
        console.log('Validar clicado, selecionados:', selectedLaudos.size);
        if (selectedLaudos.size > 0) window.openModal('VALIDATE');
    });

    selectAllBtn.addEventListener('click', () => {
        console.log('Select All clicado');
        allLaudos.forEach(laudo => {
            if (laudo.acaoRecomendada !== 'Descartado') selectedLaudos.add(laudo.id);
        });
        render();
    });

    deselectAllBtn.addEventListener('click', () => {
        console.log('Delete All clicado');
        if(allLaudos.length > 0) window.openModal('DELETE_ALL');
    });

    tableBody.addEventListener('click', (e) => {
        const target = e.target;
        
        const btnTrash = target.closest('.btn-trash');
        if (btnTrash) {
            const id = parseInt(btnTrash.dataset.id);
            window.openModal('DELETE_ONE', id);
            return;
        }

        if (target.classList.contains('row-checkbox') || target.closest('.custom-checkbox')) {
            const checkbox = target.classList.contains('row-checkbox') ? target : target.querySelector('.row-checkbox');
            if (checkbox) {
                const id = parseInt(checkbox.dataset.id);
                if (checkbox.checked) {
                    selectedLaudos.add(id);
                } else {
                    selectedLaudos.delete(id);
                }
                updateSelectedCount();
            }
            return;
        }

        const laudoLink = target.closest('.laudo-link');
        if (laudoLink) {
            e.preventDefault();
            const id = parseInt(laudoLink.dataset.id);
            console.log('Abrir laudo:', id);
            return;
        }
    });

    // --- 8. INICIALIZAÇÃO ---
    function init() {
        console.log('Inicializando aplicação...');
        
        if (!tableBody) {
            console.error('Elemento table-body não encontrado!');
            return;
        }
        if (!selectAllBtn) {
            console.error('Botão select-all-text não encontrado!');
            return;
        }
        if (!deselectAllBtn) {
            console.error('Botão deselect-all-text não encontrado!');
            return;
        }
        if (!btnValidate) {
            console.error('Botão btn-validate não encontrado!');
            return;
        }

        createToastStyles();
        createMockData();
        setupModal();
        render();
        updateSelectedCount();
        
        console.log('Aplicação inicializada com sucesso!');
    }

    init();
});