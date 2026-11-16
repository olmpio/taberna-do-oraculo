
const express = require('express');

const path = require('path');


const app = express();

const PORT = 3000;

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/monstros', async (req, res) => {
    try {
        const resposta = await fetch('https://www.dnd5eapi.co/api/monsters');

        const dados = await resposta.json();

        return res.status(200).json(dados.results);
    } catch (erro) {
        return res.status(500).json({ erro: 'Erro ao listar monstros da D&D API.' });
    }
});

app.get('/api/aventura/:monstro', async (req, res) => {
    const monstroIndex = req.params.monstro.toLowerCase();

    try {
        const [resDnd, resAdvice] = await Promise.all([
            fetch(`https://www.dnd5eapi.co/api/monsters/${monstroIndex}`),
            fetch('https://api.adviceslip.com/advice')
        ]);

        if (!resDnd.ok) {
            return res.status(404).json({ erro: 'Monstro não encontrado no bestiário.' });
        }

        const [dadosMonstro, dadosOraculo] = await Promise.all([
            resDnd.json(),
            resAdvice.json()
        ]);

        const textoOriginal = dadosOraculo.slip.advice;

        const textoCodificado = encodeURIComponent(textoOriginal);

        const resTraducao = await fetch(`https://api.mymemory.translated.net/get?q=${textoCodificado}&langpair=en|pt-BR`);

        const dadosTraducao = await resTraducao.json();

        const textoTraduzido = dadosTraducao?.responseData?.translatedText || textoOriginal;

        return res.status(200).json({
            monstro: dadosMonstro,
            oraculo: {
                id: dadosOraculo.slip.id,
                advice: textoTraduzido,
                original: textoOriginal
            }
        });
    } catch (erro) {
        return res.status(500).json({ erro: 'Erro ao consultar as APIs simultaneamente.' });
    }
});

app.get('/api/oraculo/busca/:termo', async (req, res) => {
    const termo = encodeURIComponent(req.params.termo);

    try {
        const resposta = await fetch(`https://api.adviceslip.com/advice/search/${termo}`);

        const dados = await resposta.json();

        if (dados.message) {
            return res.status(404).json({ erro: 'Nenhuma profecia encontrada para este termo.' });
        }

        return res.status(200).json(dados.slips);
    } catch (erro) {
        return res.status(500).json({ erro: 'Erro ao pesquisar no Oráculo.' });
    }
});

app.get('/api/oraculo/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const resposta = await fetch(`https://api.adviceslip.com/advice/${id}`);

        const dados = await resposta.json();

        if (dados.message) {
            return res.status(404).json({ erro: 'Profecia não encontrada para este ID.' });
        }

        return res.status(200).json(dados.slip);
    } catch (erro) {
        return res.status(500).json({ erro: 'Erro ao buscar profecia por ID.' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});