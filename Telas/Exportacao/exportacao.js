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

    // --- MOCK DATA (Apenas dados validados, similar ao print) ---
    function createMockData() {
        const patterns = [
            { extracted: '17/17', percent: '100%', reliability: 100, color: 'green' },
            { extracted: '12/17', percent: '70%', reliability: 70, color: 'yellow' },
            { extracted: '17/17', percent: '100%', reliability: 100, color: 'green' },
            { extracted: '15/17', percent: '85%', reliability: 85, color: 'green' }
        ];

        for (let i = 1; i <= 20; i++) {
            const pattern = patterns[(i - 1) % 4];
            files.push({
                id: i,
                name: `Laudo_xxx.pdf`, // Nome genérico como no print
                extracted: pattern.extracted,
                percent: pattern.percent,
                reliabilityVal: pattern.reliability,
                barColor: pattern.color
            });
        }
    }

    // --- RENDERIZAÇÃO ---
    function renderTable() {
        tableBody.innerHTML = '';
        const start = (currentPage - 1) * itemsPerPage;
        const pageItems = files.slice(start, start + itemsPerPage);

        pageItems.forEach(file => {
            const isSelected = selectedFiles.has(file.id);
            const barClass = file.barColor === 'yellow' ? 'reliability-bar yellow' : 'reliability-bar';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div class="custom-checkbox">
                        <input type="checkbox" class="row-checkbox" data-id="${file.id}" ${isSelected ? 'checked' : ''}>
                    </div>
                </td>
                <td>${file.id}</td>
                <td>
                    <div class="doc-link-wrapper">
                        <a href="#" class="laudo-link">${file.name}</a>
                        <svg class="eye-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                    </div>
                </td>
                <td>${file.extracted}</td>
                <td>${file.percent}</td>
                <td>
                    <div class="reliability-track">
                        <div class="${barClass}" style="width: ${file.reliabilityVal}%"></div>
                    </div>
                </td>
                <td>
                    <span class="action-text">Prosseguir</span>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    function renderPagination() {
        const totalItems = files.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        const startItem = (currentPage - 1) * itemsPerPage + 1;
        const endItem = Math.min(currentPage * itemsPerPage, totalItems);

        paginationWrapper.innerHTML = `
            <div class="pagination-controls">
                <span>Itens por página</span>
                <select class="page-size-select" id="items-per-page">
                    <option value="4" ${itemsPerPage===4?'selected':''}>4</option>
                    <option value="8" ${itemsPerPage===8?'selected':''}>8</option>
                </select>
                <span style="margin-left: 10px;">${startItem}-${endItem} de ${totalItems}</span>
                <button class="page-nav-btn" id="prev-btn">‹</button>
                <div class="page-numbers">
                    <span class="active">${currentPage}</span>
                </div>
                <button class="page-nav-btn" id="next-btn">›</button>
            </div>
        `;

        document.getElementById('items-per-page').addEventListener('change', (e) => {
            itemsPerPage = parseInt(e.target.value); currentPage = 1; render();
        });
        document.getElementById('prev-btn').addEventListener('click', () => { if(currentPage > 1) { currentPage--; render(); }});
        document.getElementById('next-btn').addEventListener('click', () => { if(currentPage < totalPages) { currentPage++; render(); }});
    }

    function updateFooterState() {
        const count = selectedFiles.size;
        
        // Atualiza Badge
        if (count > 0) {
            selectedBadge.textContent = count === 1 ? '1 laudo selecionado' : `${count} laudos selecionados`;
            selectedBadge.classList.remove('hidden');
        } else {
            selectedBadge.classList.add('hidden');
        }

        // Habilita/Desabilita Botão (Precisa selecionar arquivos E formato)
        if (count > 0 && exportFormat !== "") {
            btnDownload.disabled = false;
        } else {
            btnDownload.disabled = true;
        }
    }

    function render() {
        renderTable();
        renderPagination();
        updateFooterState();
    }

    // --- FUNÇÃO TOAST ---
    function showToast(message) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast-message';
        toast.innerHTML = `<svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM6.79 10.828L3.5 7.538 4.672 6.366l2.118 2.118 4.538-4.538 1.172 1.172-5.71 5.71z"/></svg> ${message}`;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    }

    // --- LISTENERS ---

    // Checkbox Individual
    tableBody.addEventListener('change', (e) => {
        if(e.target.type === 'checkbox') {
            const id = parseInt(e.target.dataset.id);
            if(e.target.checked) selectedFiles.add(id); else selectedFiles.delete(id);
            updateFooterState();
        }
    });

    // Selecionar Tudo
    selectAllBtn.addEventListener('click', () => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        // Seleciona todos da página atual
        files.slice(start, end).forEach(f => selectedFiles.add(f.id));
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
        
        // Reset após download (opcional)
        setTimeout(() => {
            selectedFiles.clear();
            formatSelect.value = "";
            exportFormat = "";
            render();
        }, 2000);
    });

    // INIT
    createMockData();
    render();
});
