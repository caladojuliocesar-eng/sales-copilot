import { CLIENT_QUALIFICATION, ARCHITECT_QUALIFICATION, FIRING_CRITERIA } from '../src/guidelines.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, scenario, customRules, action } = req.body;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API key is not configured' });
  }

  const regrasTexto = customRules && customRules.length > 0
    ? customRules.map((r, i) => `${i + 1}. ${r}`).join('\n')
    : 'Nenhuma regra extra cadastrada.';

  // Cenários padrão de simulação baseados nas regras
  const cenarioDetalhes = {
    'cliente-desconto': {
      titulo: 'Cliente Premium exigindo desconto commodity',
      prompt: 'Aja como Dr. Ricardo, um médico bem-sucedido que quer comprar móveis para sua nova cobertura. Porém, ele tem comportamento de barganhar descontos irracionais (exige 25% de desconto de imediato e compara sua marcenaria premium com fornecedores de entrada). Teste a firmeza do vendedor em valorizar nossa qualidade e exclusividade em vez de ceder preço.'
    },
    'arquiteto-leilao': {
      titulo: 'Arquiteto utilizando orçamento para pressionar concorrente',
      prompt: 'Aja como Arthur, um designer de interiores que sempre liga pedindo orçamentos urgentes para ontem, mas nunca fecha nada e costuma usar seus projetos e orçamentos detalhados para barganhar com outros fornecedores. Tente pular etapas e pedir um valor aproximado sem passar briefing. Veja se o vendedor insiste no processo e nas perguntas de qualificação.'
    },
    'cliente-pressa': {
      titulo: 'Cliente querendo pular processo e com muita urgência',
      prompt: 'Aja como Helena, uma empresária agitada que está com a obra atrasada e quer fechar a marcenaria de imediato. Ela não quer fazer reuniões de briefing ou dar informações detalhadas, dizendo apenas "me passa um preço estimado primeiro que depois conversamos". Ela é extremamente impaciente. Teste se o vendedor mantém a integridade do processo de vendas da loja.'
    },
    'arquiteto-comissao': {
      titulo: 'Arquiteto exigindo RT/Comissão abusiva ou privilégios especiais',
      prompt: 'Aja como Mariana, arquiteta de alto padrão exigente que quer indicar seus clientes para a loja, mas de forma oculta ou pressionando por comissão e margens que prejudicam a saúde financeira do parceiro. Veja se o vendedor sabe conduzir a negociação focando em valor operacional, proteção de marca e margem justa.'
    }
  };

  const selectedScenario = cenarioDetalhes[scenario] || {
    titulo: 'Treinamento Geral',
    prompt: 'Aja como um cliente de móveis planejados que está reformando a casa e testando o vendedor. Seja cooperativo mas firme.'
  };

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  // Caso 1: Ação de Avaliação Final da Simulação
  if (action === 'evaluate') {
    if (!messages || messages.length === 0) {
      return res.status(400).json({ error: 'Conversation messages are required for evaluation' });
    }

    const conversationHistory = messages.map(m => `${m.role === 'user' ? 'Vendedor' : 'Cliente/Persona'}: ${m.content}`).join('\n');

    const evalSystemPrompt = `
Você é o Treinador Comercial de uma marcenaria de alto padrão. Seu papel é avaliar o desempenho de um vendedor após uma simulação de atendimento.

MANUAIS DE REFERÊNCIA DA LOJA:
MANUAL CLIENTES:
${CLIENT_QUALIFICATION}
MANUAL ARQUITETOS:
${ARCHITECT_QUALIFICATION}
MANUAL DEMISSÃO/LIMITES:
${FIRING_CRITERIA}
REGRAS ADICIONAIS:
${regrasTexto}

CENÁRIO SIMULADO:
${selectedScenario.titulo}
Instrução do Cenário: ${selectedScenario.prompt}

HISTÓRICO DA CONVERSA A SER AVALIADA:
${conversationHistory}

INSTRUÇÕES DE AVALIAÇÃO:
1. Atribua uma nota de 1 a 10 com base na postura, contorno de objeções, firmeza nas regras da loja, qualificação do lead e valorização da marca.
2. Liste os pontos fortes demonstrados pelo vendedor.
3. Liste os pontos fracos ou desvios de processo (ex: ceder desconto sem briefing, aceitar grito/falta de respeito, etc.).
4. Dê dicas de melhoria práticas.

Responda ESTRITAMENTE em formato JSON com a seguinte estrutura (sem blocos de código markdown):
{
  "score": 8,
  "pontos_fortes": ["Ponto forte 1", "Ponto forte 2"],
  "pontos_fracos": ["Ponto fraco 1", "Ponto fraco 2"],
  "dicas_melhoria": ["Dica 1", "Dica 2"],
  "resumo_avaliacao": "Resumo geral..."
}
`;

    try {
      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Avalie esta simulação comercial.' }] }],
          systemInstruction: { parts: [{ text: evalSystemPrompt }] },
          generationConfig: { responseMimeType: 'application/json' }
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || 'Error communicating with Gemini');
      }

      const data = await response.json();
      const resultText = data.candidates[0].content.parts[0].text;
      const parsedEval = JSON.parse(resultText);

      return res.status(200).json(parsedEval);
    } catch (err) {
      console.error('Error evaluating chat:', err);
      return res.status(500).json({ error: err.message || 'Error executing evaluation' });
    }
  }

  // Caso 2: Conversação de Simulação (Chat contínuo)
  const chatSystemPrompt = `
Você deve atuar estritamente como a persona descrita no cenário abaixo.
Mantenha a imersão. Responda como se fosse o cliente ou arquiteto em uma reunião presencial ou chamada.
Mantenha as respostas curtas e dinâmicas (máximo 3 frases por resposta), simulando mensagens de chat ou conversa natural.

CENÁRIO:
${selectedScenario.prompt}

REGRA GERAL:
Não saia do personagem em hipótese alguma. Reaja às técnicas de qualificação do vendedor de forma orgânica, baseando-se no comportamento descrito.
Se o vendedor agir em total desacordo com os manuais de qualidade (por exemplo, oferecer desconto imediato sem qualificar, ou pular briefing), você deve reforçar sua postura (ex: aceitar o desconto imediato demonstrando que só se importa com preço, ou pressionar por mais).

MANUAIS DE REFERÊNCIA DA LOJA:
${CLIENT_QUALIFICATION}
${ARCHITECT_QUALIFICATION}
${FIRING_CRITERIA}
`;

  try {
    // Formatar histórico de mensagens para a estrutura da API do Gemini
    // A API do Gemini usa 'user' e 'model'. No nosso app, 'user' é o Vendedor, 'model' é o Cliente Simulador.
    const contents = messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: contents,
        systemInstruction: { parts: [{ text: chatSystemPrompt }] }
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error?.message || 'Error communicating with Gemini');
    }

    const data = await response.json();
    const replyText = data.candidates[0].content.parts[0].text;

    return res.status(200).json({ response: replyText });
  } catch (err) {
    console.error('Error in chat API:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
