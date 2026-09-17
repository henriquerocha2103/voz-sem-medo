import { db } from "./firebase-config.js";
import { collection, addDoc, Timestamp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    const botaoEnviar = document.querySelector('button[type="submit"]');
    const textarea = document.querySelector('textarea');
    const inputSerie = document.querySelector('input[name="serie"]');

    const overlayConsentimento = document.getElementById('overlay-consentimento');
    const overlayConfirmacao = document.getElementById('overlay-confirmacao');
    const checkboxTermos = document.getElementById('aceite-termos');
    const btnCancelar = document.getElementById('btn-cancelar-consentimento');
    const btnConfirmar = document.getElementById('btn-confirmar-consentimento');
    const btnFechar = document.getElementById('btn-fechar-confirmacao');

    botaoEnviar.addEventListener('click', (e) => {
        e.preventDefault();

        const ocorrenciaSelecionada = document.querySelector('input[name="ocorrencia"]:checked');
        const periodosSelecionados = document.querySelectorAll('input[name="periodo"]:checked');

        if (!ocorrenciaSelecionada) {
            alert('Por favor, selecione o tipo de ocorrência.');
            return;
        }
        if (!textarea.value.trim()) {
            alert('Por favor, conte com suas palavras o que aconteceu.');
            return;
        }
        if (periodosSelecionados.length === 0) {
            alert('Por favor, selecione quando a situação aconteceu.');
            return;
        }

        overlayConsentimento.style.display = 'flex';
    });

    checkboxTermos.addEventListener('change', () => {
        btnConfirmar.disabled = !checkboxTermos.checked;
    });

    btnCancelar.addEventListener('click', () => {
        overlayConsentimento.style.display = 'none';
        checkboxTermos.checked = false;
        btnConfirmar.disabled = true;
    });

    btnConfirmar.addEventListener('click', async () => {
        btnConfirmar.disabled = true;
        btnConfirmar.textContent = 'Enviando...';

        await enviarRegistro();

        overlayConsentimento.style.display = 'none';
        checkboxTermos.checked = false;
        btnConfirmar.textContent = 'Confirmar e enviar';
    });

    btnFechar.addEventListener('click', () => {
        overlayConfirmacao.style.display = 'none';
    });

    async function enviarRegistro() {
        const ocorrencia = document.querySelector('input[name="ocorrencia"]:checked').value;
        const periodos = Array.from(document.querySelectorAll('input[name="periodo"]:checked'))
            .map(input => input.value);
        const relato = textarea.value.trim();
        const serie = inputSerie.value.trim();

        const registro = {
            tipo: ocorrencia,
            periodos: periodos,
            relato: relato,
            turma: serie,
            data: Timestamp.now()
        };

        try {
            await addDoc(collection(db, "registros"), registro);
            overlayConfirmacao.style.display = 'flex';
            limparFormulario();
        } catch (erro) {
            console.error("Erro ao enviar denúncia:", erro);
            alert('Não foi possível enviar o registro. Tente novamente em instantes.');
        }
    }

    function limparFormulario() {
        document.querySelectorAll('input[name="ocorrencia"]').forEach(radio => {
            radio.checked = false;
        });
        document.querySelectorAll('input[name="periodo"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        textarea.value = '';
        inputSerie.value = '';
    }
});