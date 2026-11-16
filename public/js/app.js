const btnInvocar = document.getElementById('btn-invocar');
const selectMonstro = document.getElementById('select-monstro');
const containerResultado = document.getElementById('resultado-aventura');


btnInvocar.addEventListener('click', () => {
    const monstroEscolhido = selectMonstro.value;
    carregarAventura(monstroEscolhido);
});


async function carregarListaMonstros() {
    try {
        const resposta = await fetch('/api/monstros');
        const monstros = await resposta.json();

        selectMonstro.innerHTML = '';
        monstros.forEach((m) => {
            const option = document.createElement('option');
            option.value = m.index;
            option.textContent = m.name;
            selectMonstro.appendChild(option);
        });

        selectMonstro.value = 'goblin';
        carregarAventura('goblin');
    } catch (erro) {
        console.error('Erro ao carregar lista de monstros:', erro);
    }
}


async function carregarAventura(monstro) {
    containerResultado.innerHTML = '<p>Consultando os tomos antigos...</p>';

    try {
        const resposta = await fetch(`/api/aventura/${monstro}`);
        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.erro || 'Erro ao carregar dados.');
        }

        renderizarDOM(dados.monstro, dados.oraculo);
    } catch (erro) {
        containerResultado.innerHTML = `<p>Falha na invocação: ${erro.message}</p>`;
    }
}


function renderizarDOM(monstro, oraculo) {
    containerResultado.innerHTML = '';

    const urlImagem = monstro.image 
        ? `https://www.dnd5eapi.co${monstro.image}` 
        : '';

    const cardMonstro = document.createElement('article');
    cardMonstro.className = 'card';
    cardMonstro.innerHTML = `
        <h2>${monstro.name}</h2>
        ${urlImagem ? `<img src="${urlImagem}" alt="Ilustração de ${monstro.name}">` : ''}
        <p><strong>Tamanho:</strong> ${monstro.size} | <strong>Tipo:</strong> ${monstro.type}</p>
        <p><strong>Pontos de Vida (HP):</strong> ${monstro.hit_points}</p>
        <p><strong>Desafio (CR):</strong> ${monstro.challenge_rating}</p>
    `;

    const cardOraculo = document.createElement('article');
    cardOraculo.className = 'card';
    cardOraculo.innerHTML = `
        <h2>Oráculo da Taverna (#${oraculo.id})</h2>
        <blockquote class="profecia">"${oraculo.advice}"</blockquote>
        <p style="margin-top: 0.75rem; font-size: 0.85rem; opacity: 0.7;">
            <em>Original: "${oraculo.original}"</em>
        </p>
    `;

    containerResultado.appendChild(cardMonstro);
    containerResultado.appendChild(cardOraculo);
}

btnAleatorio.addEventListener('click', () => {
    const opcoes = selectMonstro.options;
    const indiceSorteado = Math.floor(Math.random() * opcoes.length);
    selectMonstro.selectedIndex = indiceSorteado;
    carregarAventura(selectMonstro.value);
});


carregarListaMonstros();