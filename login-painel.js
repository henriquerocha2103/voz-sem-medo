document.addEventListener('DOMContentLoaded', () => {
    const SENHA_CORRETA = '8034'; // troque para a senha que a direção vai usar

    const overlayLogin = document.getElementById('overlay-login');
    const conteudoPainel = document.getElementById('conteudo-painel');
    const inputSenha = document.getElementById('senha-painel');
    const btnEntrar = document.getElementById('btn-entrar-painel');
    const erroLogin = document.getElementById('erro-login');

    // se já entrou antes nesta aba, não pede senha de novo
    if (sessionStorage.getItem('painel-autenticado') === 'true') {
        liberarAcesso();
    }

    btnEntrar.addEventListener('click', tentarEntrar);
    inputSenha.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') tentarEntrar();
    });

    function tentarEntrar() {
        if (inputSenha.value === SENHA_CORRETA) {
            sessionStorage.setItem('painel-autenticado', 'true');
            liberarAcesso();
        } else {
            erroLogin.style.display = 'block';
            inputSenha.value = '';
        }
    }

    function liberarAcesso() {
        overlayLogin.style.display = 'none';
        conteudoPainel.style.display = 'block';
    }
});