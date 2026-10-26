// Seleção dos elementos do DOM
const inputMensagem = document.getElementById('mensagem');
const btnEnviar = document.getElementById('btnEnviar');
const btnFalar = document.getElementById('btnFalar');
const conversaContainer = document.getElementById('conversa');
const statusTexto = document.getElementById('status');
const cardsSugestoes = document.querySelectorAll('.card-sugestao');

// Verificação do suporte à API Web Speech (Reconhecimento de Voz)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = false;

    // Eventos do reconhecimento de voz
    recognition.onstart = () => {
        statusTexto.textContent = "🎙️ Ouvindo... Pode falar!";
        btnFalar.style.backgroundColor = "#ff4d4d";
    };

    recognition.onend = () => {
        statusTexto.textContent = "";
        btnFalar.style.backgroundColor = "#a1aaff";
    };

    recognition.onresult = (event) => {
        const textoGravado = event.results[0][0].transcript;
        processarMensagemUsuario(textoGravado);
    };

    recognition.onerror = (event) => {
        statusTexto.textContent = "Erro ao reconhecer a voz: " + event.error;
        btnFalar.style.backgroundColor = "#a1aaff";
    };
} else {
    statusTexto.textContent = "Seu navegador não suporta reconhecimento de voz.";
}

// Evento ao clicar no botão do microfone
btnFalar.addEventListener('click', () => {
    if (recognition) {
        try {
            recognition.start();
        } catch (erro) {
            recognition.stop();
        }
    } else {
        alert("Reconhecimento de voz não disponível neste navegador.");
    }
});

// Eventos de envio por texto (Botão e Tecla Enter)
btnEnviar.addEventListener('click', enviarMensagemTexto);
inputMensagem.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        enviarMensagemTexto();
    }
});

// Evento ao clicar nos Cards de Sugestões / Palavras-chave
cardsSugestoes.forEach(card => {
    card.addEventListener('click', () => {
        const mensagemCard = card.getAttribute('data-mensagem');
        if (mensagemCard) {
            processarMensagemUsuario(mensagemCard);
        }
    });
});

function enviarMensagemTexto() {
    const texto = inputMensagem.value.trim();
    if (texto !== "") {
        processarMensagemUsuario(texto);
        inputMensagem.value = "";
    }
}

// Processa a mensagem do usuário, adiciona ao chat, calcula resposta e fala em áudio
function processarMensagemUsuario(textoUsuario) {
    // 1. Adiciona pergunta do usuário na tela
    adicionarMensagem(textoUsuario, 'usuario');

    // 2. Obtém a resposta do robô com base nas palavras-chave
    const respostaBot = obterRespostaBot(textoUsuario);

    // 3. Adiciona a resposta em texto na tela e reproduz áudio
    setTimeout(() => {
        adicionarMensagem(respostaBot, 'bot');
        falarTexto(respostaBot);
    }, 400);
}

// Lógica de verificação das palavras-chave
function obterRespostaBot(texto) {
    const t = texto.toLowerCase();

    if (t.includes('olá') || t.includes('ola') || t.includes('oi')) {
        return "Olá! Como posso ajudar?";
    } else if (t.includes('horário') || t.includes('horario')) {
        return "Nosso horário de atendimento é das 8h às 18h";
    } else if (t.includes('curso') || t.includes('cursos')) {
        return "Temos vários cursos de DEV, Mecatrônica e Redes de Computadores";
    } else if (t.includes('local') || t.includes('endereço') || t.includes('endereco')) {
        return "Consulte a secretaria para receber as informações de endereço e as orientações de atendimento";
    } else if (t.includes('obrigada') || t.includes('obrigado')) {
        return "Por nada! Foi um prazer ajudar";
    } else {
        return "Desculpe, não entendi sua pergunta. Pode repetir?";
    }
}

// Função para renderizar as mensagens na tela
function adicionarMensagem(texto, remetente) {
    const div = document.createElement('div');
    div.classList.add('mensagem', remetente);
    div.textContent = texto;
    conversaContainer.appendChild(div);
    conversaContainer.scrollTop = conversaContainer.scrollHeight;
}

// Função de Síntese de Voz (Text-to-Speech)
function falarTexto(texto) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Interrompe áudios anteriores
        const fala = new SpeechSynthesisUtterance(texto);
        fala.lang = 'pt-BR';
        fala.rate = 1.0;
        window.speechSynthesis.speak(fala);
    }
}