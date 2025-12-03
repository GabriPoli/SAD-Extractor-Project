// auth.js - Gerencia autenticação e controle de acesso

class AuthManager {
    constructor() {
        this.usuario = null;
        this.inicializar();
    }

    inicializar() {
        const usuarioSalvo = sessionStorage.getItem('usuarioLogado');
        if (usuarioSalvo) {
            this.usuario = JSON.parse(usuarioSalvo);
        }
    }

    getUsuario() {
        return this.usuario;
    }

    estaLogado() {
        return this.usuario !== null;
    }

    getNomeUsuario() {
        return this.usuario ? this.usuario.nome : 'Visitante';
    }

    getTipoUsuario() {
        return this.usuario ? this.usuario.tipo : 'visitante';
    }

    temPermissao(pagina) {
        if (!this.usuario) return false;
        
        const permissoesPorTipo = {
            'cadastro': ['upload', 'edicao', 'exportacao', 'historico_laudos'],
            'gestor': ['upload', 'edicao', 'exportacao', 'historico_laudos', 'historico_usuarios', 'indicadores'],
            'admin': ['upload', 'edicao', 'exportacao', 'historico_laudos', 'historico_usuarios', 'indicadores', 'configuracoes']
        };

        const permissoesUsuario = permissoesPorTipo[this.usuario.tipo] || [];
        return permissoesUsuario.includes(pagina);
    }

    podeAcessarPagina(pagina) {
        const mapaPermissoes = {
            'upload.html': 'upload',
            'upload': 'upload',
            'edicao.html': 'edicao',
            'edicao': 'edicao',
            'exportacao.html': 'exportacao',
            'exportacao': 'exportacao',
            'TelaHistoricoLaudos.html': 'historico_laudos',
            'historico_laudos': 'historico_laudos',
            'historico_usuarios.html': 'historico_usuarios',
            'historico_usuarios': 'historico_usuarios',
            'IndicadoresSAD.html': 'indicadores',
            'indicadores': 'indicadores',
            'TelaGerenciamento.html': 'configuracoes',
            'configuracoes': 'configuracoes'
        };

        const permissaoNecessaria = mapaPermissoes[pagina];
        
        if (!permissaoNecessaria) {
            console.warn(`Página não mapeada: ${pagina}`);
            return true;
        }

        return this.temPermissao(permissaoNecessaria);
    }

    logout() {
        sessionStorage.removeItem('usuarioLogado');
        this.usuario = null;
        
        // Verificar de qual página está saindo para determinar o caminho correto
        const currentPath = window.location.pathname;
        
        // Mapeamento dos caminhos baseado na estrutura
        if (currentPath.includes('/Dashboard_Cadastro/Upload/')) {
            // Para upload.html: ../../../Tela_de_Login/telaLogin.html
            window.location.href = '../../../Tela_de_Login/telaLogin.html';
        } else if (currentPath.includes('/Edicao/') || 
                   currentPath.includes('/Exportacao/') ||
                   currentPath.includes('/Historico_Laudos/') ||
                   currentPath.includes('/Historico_Usuarios/') ||
                   currentPath.includes('/IndicadoresSAD/') ||
                   currentPath.includes('/Gerenciamento_Usuarios/')) {
            // Para outras páginas em Telas/: ../../Tela_de_Login/telaLogin.html
            window.location.href = '../../Tela_de_Login/telaLogin.html';
        } else {
            // Fallback padrão
            window.location.href = '../../Tela_de_Login/telaLogin.html';
        }
    }
}

// Criar instância global
const auth = new AuthManager();