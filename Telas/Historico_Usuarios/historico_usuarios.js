document.addEventListener('DOMContentLoaded', () => {
    
    // --- ESTADO ---
    let logs = [];
    let currentPage = 1;
    // CONFIGURAÇÃO DE PAGINAÇÃO: Default 4 itens (opções 4, 8, 16)
    let itemsPerPage = 4;
    
    // --- ELEMENTOS ---
    const tableBody = document.getElementById('table-body');
    const paginationWrapper = document.getElementById('pagination-wrapper');

    // --- MOCK DATA ---
    function createMockData() {
        const users = [
            { name: 'Carlos Silva', email: 'carlos.silva@sad.pe.gov.br' },
            { name: 'Mariana Souza', email: 'mariana.souza@sad.pe.gov.br' },
            { name: 'Roberto Lima', email: 'roberto.lima@sad.pe.gov.br' },
            { name: 'Ana Pereira', email: 'ana.pereira@sad.pe.gov.br' }
        ];

        const actions = ['Upload', 'Edição', 'Exclusão', 'Exportação'];
        
        logs = [];

        for (let i = 1; i <= 40; i++) {
            const user = users[Math.floor(Math.random() * users.length)];
            const action = actions[Math.floor(Math.random() * actions.length)];
            
            const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
            const hour = String(Math.floor(Math.random() * 23)).padStart(2, '0');
            const minute = String(Math.floor(Math.random() * 59)).padStart(2, '0');
            const dateString = `${day}/11/2025 ${hour}:${minute}`;

            logs.push({
                id: i,
                user: user,
                action: action,
                docName: `Laudo_${String(i).padStart(3, '0')}.pdf`,
                date: dateString
            });
        }
        logs.reverse(); 
    }

    function getInitials(name) {
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    }

    function getActionClass(action) {
        return action.toLowerCase().replace('ã', 'a').replace('ç', 'c');
    }

    // --- RENDER ---
    function render() {
        if(!tableBody) return;
        tableBody.innerHTML = '';
        
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const pageItems = logs.slice(start, end);

        if (pageItems.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px">Nenhum registro encontrado.</td></tr>';
            return;
        }

        pageItems.forEach(log => {
            const tr = document.createElement('tr');
            const initials = getInitials(log.user.name);
            const actionClass = getActionClass(log.action);

            tr.innerHTML = `
                <td>
                    <div class="user-cell">
                        <div class="user-avatar">${initials}</div>
                        <div class="user-info-text">
                            <span class="user-name">${log.user.name}</span>
                            <span class="user-email">${log.user.email}</span>
                        </div>
                    </div>
                </td>
                <td><span class="action-badge ${actionClass}">${log.action}</span></td>
                <td><a href="#" class="laudo-link">${log.docName}</a></td>
                <td><span class="date-text">${log.date}</span></td>
            `;
            tableBody.appendChild(tr);
        });

        renderPagination();
    }

    function renderPagination() {
        if (!paginationWrapper) return;
        const totalPages = Math.ceil(logs.length / itemsPerPage);
        
        // OPÇÕES ATUALIZADAS: 4, 8, 16
        paginationWrapper.innerHTML = `
            <div class="pagination-controls">
                <span>Itens por página</span>
                <select class="page-size-select" id="items-per-page">
                    <option value="4" ${itemsPerPage===4?'selected':''}>4</option>
                    <option value="8" ${itemsPerPage===8?'selected':''}>8</option>
                    <option value="16" ${itemsPerPage===16?'selected':''}>16</option>
                </select>
                <span style="margin-left: 10px;">Página ${currentPage} de ${totalPages}</span>
                <button class="page-nav-btn" data-action="prev" ${currentPage===1?'disabled':''}>‹</button>
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

    // Init
    createMockData();
    render();
});