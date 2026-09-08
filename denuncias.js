document.addEventListener('DOMContentLoaded', () => {

    const rotulosTipo = {
        bullying: 'Bullying',
        agressao: 'Agressão',
        'apelidos/xingos': 'Apelidos/Ofensas',
        exclusao: 'Exclusão',
        cyberbullying: 'Cyberbullying',
        outro: 'Outro'
    };

    const listaEl = document.getElementById('lista-denuncias');
    const totalMesEl = document.getElementById('total-mes');
    const totalFiltradoEl = document.getElementById('total-filtrado');
    const mensagemVaziaEl = document.getElementById('mensagem-vazio');
    const botoesFiltroTipo = document.querySelectorAll('.opcao-filtro');
    const inputDataInicio = document.getElementById('data-inicio');
    const inputDataFim = document.getElementById('data-fim');
    const btnLimparFiltros = document.getElementById('limpar-filtros');

    let tipoAtivo = 'todos';

    function carregarDenuncias() {
        return JSON.parse(localStorage.getItem('denuncias') || '[]');
    }

    function formatarData(isoString) {
        const data = new Date(isoString);
        return data.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function contarDenunciasDoMesAtual(denuncias) {
        const agora = new Date();
        return denuncias.filter(d => {
            const data = new Date(d.data);
            return data.getMonth() === agora.getMonth() &&
                   data.getFullYear() === agora.getFullYear();
        }).length;
    }

    function aplicarFiltros(denuncias) {
        return denuncias.filter(d => {
            if (tipoAtivo !== 'todos' && d.tipo !== tipoAtivo) {
                return false;
            }

            const dataDenuncia = new Date(d.data);

            if (inputDataInicio.value) {
                const inicio = new Date(inputDataInicio.value + 'T00:00:00');
                if (dataDenuncia < inicio) return false;
            }

            if (inputDataFim.value) {
                const fim = new Date(inputDataFim.value + 'T23:59:59');
                if (dataDenuncia > fim) return false;
            }

            return true;
        });
    }

    function renderizarCard(denuncia) {
        const card = document.createElement('div');
        card.className = 'card-denuncia';
        card.innerHTML = `
            <div class="card-denuncia-topo">
                <span class="badge-tipo">${rotulosTipo[denuncia.tipo] || denuncia.tipo}</span>
                <span class="data-denuncia">${formatarData(denuncia.data)}</span>
            </div>
            <p class="relato-denuncia">${denuncia.relato}</p>
            ${denuncia.turma ? `<p class="turma-denuncia">Turma: ${denuncia.turma}</p>` : ''}
        `;
        return card;
    }

    function renderizar() {
        const todasDenuncias = carregarDenuncias();
        const filtradas = aplicarFiltros(todasDenuncias)
            .sort((a, b) => new Date(b.data) - new Date(a.data));

        totalMesEl.textContent = contarDenunciasDoMesAtual(todasDenuncias);
        totalFiltradoEl.textContent = filtradas.length;

        listaEl.innerHTML = '';

        if (filtradas.length === 0) {
            mensagemVaziaEl.style.display = 'block';
        } else {
            mensagemVaziaEl.style.display = 'none';
            filtradas.forEach(d => listaEl.appendChild(renderizarCard(d)));
        }
    }

    botoesFiltroTipo.forEach(botao => {
        botao.addEventListener('click', () => {
            botoesFiltroTipo.forEach(b => b.classList.remove('ativo'));
            botao.classList.add('ativo');
            tipoAtivo = botao.dataset.tipo;
            renderizar();
        });
    });

    inputDataInicio.addEventListener('change', renderizar);
    inputDataFim.addEventListener('change', renderizar);

    btnLimparFiltros.addEventListener('click', () => {
        inputDataInicio.value = '';
        inputDataFim.value = '';
        tipoAtivo = 'todos';
        botoesFiltroTipo.forEach(b => b.classList.remove('ativo'));
        document.querySelector('.opcao-filtro[data-tipo="todos"]').classList.add('ativo');
        renderizar();
    });

    renderizar();
});