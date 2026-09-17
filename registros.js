import { db } from "./firebase-config.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {

    const rotulosTipo = {
        bullying: 'Bullying',
        agressao: 'Agressão',
        'apelidos/xingos': 'Apelidos/Ofensas',
        exclusao: 'Exclusão',
        cyberbullying: 'Cyberbullying',
        outro: 'Outro'
    };

    const rotulosPeriodo = {
        manha: 'Manhã',
        tarde: 'Tarde',
        noite: 'Noite',
        recreio: 'Recreio'
    };

    const listaEl = document.getElementById('lista-denuncias');
    const totalMesEl = document.getElementById('total-mes');
    const totalFiltradoEl = document.getElementById('total-filtrado');
    const mensagemVaziaEl = document.getElementById('mensagem-vazio');
    const botoesFiltroTipo = document.querySelectorAll('#filtro-tipo .opcao-filtro');
    const botoesFiltroPeriodo = document.querySelectorAll('#filtro-periodo .opcao-filtro');
    const inputDataInicio = document.getElementById('data-inicio');
    const inputDataFim = document.getElementById('data-fim');
    const btnLimparFiltros = document.getElementById('limpar-filtros');

    let tipoAtivo = 'todos';
    let periodoAtivo = 'todos';
    let todasDenunciasCache = [];

    async function carregarDenuncias() {
        const snapshot = await getDocs(collection(db, "registros"));
        return snapshot.docs.map(doc => {
            const dados = doc.data();
            return {
                id: doc.id,
                ...dados,
                data: dados.data.toDate().toISOString() // converte Timestamp do Firebase para string ISO
            };
        });
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

    function formatarPeriodos(periodos) {
        if (!periodos || periodos.length === 0) return '—';
        return periodos.map(p => rotulosPeriodo[p] || p).join(', ');
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

            if (periodoAtivo !== 'todos') {
                const periodosDenuncia = d.periodos || [];
                if (!periodosDenuncia.includes(periodoAtivo)) {
                    return false;
                }
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
            <p class="periodo-denuncia">Período: ${formatarPeriodos(denuncia.periodos)}</p>
            <p class="relato-denuncia">${denuncia.relato}</p>
            ${denuncia.turma ? `<p class="turma-denuncia">Turma: ${denuncia.turma}</p>` : ''}
        `;
        return card;
    }

    function renderizarLista() {
        const filtradas = aplicarFiltros(todasDenunciasCache)
            .sort((a, b) => new Date(b.data) - new Date(a.data));

        totalMesEl.textContent = contarDenunciasDoMesAtual(todasDenunciasCache);
        totalFiltradoEl.textContent = filtradas.length;

        listaEl.innerHTML = '';

        if (filtradas.length === 0) {
            mensagemVaziaEl.style.display = 'block';
        } else {
            mensagemVaziaEl.style.display = 'none';
            filtradas.forEach(d => listaEl.appendChild(renderizarCard(d)));
        }
    }

    async function renderizar() {
        listaEl.innerHTML = '<p class="vazio">Carregando denúncias...</p>';
        todasDenunciasCache = await carregarDenuncias();
        renderizarLista();
    }

    botoesFiltroTipo.forEach(botao => {
        botao.addEventListener('click', () => {
            botoesFiltroTipo.forEach(b => b.classList.remove('ativo'));
            botao.classList.add('ativo');
            tipoAtivo = botao.dataset.tipo;
            renderizarLista();
        });
    });

    botoesFiltroPeriodo.forEach(botao => {
        botao.addEventListener('click', () => {
            botoesFiltroPeriodo.forEach(b => b.classList.remove('ativo'));
            botao.classList.add('ativo');
            periodoAtivo = botao.dataset.periodo;
            renderizarLista();
        });
    });

    inputDataInicio.addEventListener('change', renderizarLista);
    inputDataFim.addEventListener('change', renderizarLista);

    btnLimparFiltros.addEventListener('click', () => {
        inputDataInicio.value = '';
        inputDataFim.value = '';

        tipoAtivo = 'todos';
        botoesFiltroTipo.forEach(b => b.classList.remove('ativo'));
        document.querySelector('#filtro-tipo .opcao-filtro[data-tipo="todos"]').classList.add('ativo');

        periodoAtivo = 'todos';
        botoesFiltroPeriodo.forEach(b => b.classList.remove('ativo'));
        document.querySelector('#filtro-periodo .opcao-filtro[data-periodo="todos"]').classList.add('ativo');

        renderizarLista();
    });

    renderizar();
});