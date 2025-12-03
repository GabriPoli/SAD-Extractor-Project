document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const emailInput = document.getElementById('email').value.trim().toLowerCase();
    const passwordInput = document.getElementById('password').value; // Se houver campo de senha

    let userData = {
        email: emailInput,
        nome: '',
        tipo: '',
        redirectUrl: '',
        permissoes: []
    };

    // Lógica condicional baseada nos e-mails fornecidos
    if (emailInput === 'cadastro@sad.pe.gov.br') {
        userData.nome = 'Usuário de Cadastro';
        userData.tipo = 'cadastro';
        userData.redirectUrl = 'http://127.0.0.1:5500/SAD-Extractor-Project/Telas/Dashboard_Cadastro/Upload/upload.html';
        userData.permissoes = ['upload', 'edicao', 'exportacao', 'historico_laudos'];
        
    } else if (emailInput === 'gestor@sad.pe.gov.br') {
        userData.nome = 'Gestor do Sistema';
        userData.tipo = 'gestor';
        userData.redirectUrl = 'Telas/Dashboard-Gestor'; // Ajuste conforme necessário
        userData.permissoes = ['upload', 'edicao', 'exportacao', 'historico_laudos', 'historico_usuarios', 'indicadores'];
        
    } else if (emailInput === 'admin@sad.pe.gov.br') {
        userData.nome = 'Administrador do Sistema';
        userData.tipo = 'admin';
        userData.redirectUrl = 'Telas/Dashboard-Administrador'; // Ajuste conforme necessário
        userData.permissoes = ['upload', 'edicao', 'exportacao', 'historico_laudos', 'historico_usuarios', 'indicadores', 'configuracoes'];
        
    } else {
        // Usuário padrão ou não reconhecido
        alert(`Falha! E-mail [${emailInput}] não reconhecido.`);
        return;
    }

    // Salvar dados do usuário no sessionStorage
    sessionStorage.setItem('usuarioLogado', JSON.stringify(userData));
    
    console.log(`Usuário logado: ${userData.nome} (${userData.tipo})`);
    console.log(`Permissões: ${userData.permissoes.join(', ')}`);
    
    alert(`Sucesso! Bem-vindo, ${userData.nome}`);
    
    // Redirecionar
    window.location.href = userData.redirectUrl;
});