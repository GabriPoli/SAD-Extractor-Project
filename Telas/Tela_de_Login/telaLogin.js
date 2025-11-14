document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Impede o envio tradicional do formulário

    const emailInput = document.getElementById('email').value.trim().toLowerCase();
    // Em um sistema real, a senha também seria validada no backend.

    let redirectUrl = '';

    // Lógica condicional baseada nos e-mails fornecidos
    if (emailInput === 'cadastro@sad.pe.gov.br') {
        // Caminho 1: Usuário de Cadastro (Ex: Responsável por incluir novos laudos)
        redirectUrl = 'http://127.0.0.1:5500/SAD-Extractor-Project/Telas/Dashboard_Cadastro/Upload/upload.html'; 
        console.log('E-mail reconhecido como Cadastro. Redirecionando para: ' + redirectUrl);
        alert(`Sucesso! E-mail [${emailInput}] logado. Rota conceitual: ${redirectUrl}`);
    
    } else if (emailInput === 'gestor@sad.pe.gov.br') {
        // Caminho 2: Usuário Gestor (Ex: Responsável por visualizar relatórios e dashboards)
        redirectUrl = 'Telas/Dashboard-Gestor';
        console.log('E-mail reconhecido como Gestor. Redirecionando para: ' + redirectUrl);
        alert(`Sucesso! E-mail [${emailInput}] logado. Rota conceitual: ${redirectUrl}`);
    
    } else if (emailInput === 'admin@sad.pe.gov.br') {
        // Caminho 3: Usuário Administrador (Ex: Responsável por gerenciar acessos e configurações)
        redirectUrl = 'Telas/Dashboard-Administrador';
        console.log('E-mail reconhecido como Admin. Redirecionando para: ' + redirectUrl);
        alert(`Sucesso! E-mail [${emailInput}] logado. Rota conceitual: ${redirectUrl}`);
    
    } else {
        // Usuário padrão ou não reconhecido (Ex: Servidor comum com acesso limitado)
        redirectUrl = 'Telas/Tela_de_login';
        console.log('E-mail padrão/não reconhecido. Redirecionando para: ' + redirectUrl);
        alert(`Falha! E-mail [${emailInput}] não reconhecido. Rota conceitual: ${redirectUrl}`);
    }

    window.location.href = redirectUrl;

});