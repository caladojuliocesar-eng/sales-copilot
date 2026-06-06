import { CLIENT_QUALIFICATION, ARCHITECT_QUALIFICATION, FIRING_CRITERIA } from '../src/guidelines.js';

export default async function handler(req, res) {
  // Configurar CORS
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

  const { text, customRules, tipo } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text content is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API key is not configured' });
  }

  // Montar as regras adicionais
  const regrasTexto = customRules && customRules.length > 0
    ? customRules.map((r, i) => `${i + 1}. ${r}`).join('\n')
    : 'Nenhuma regra extra cadastrada.';

  // Selecionar o manual apropriado baseado no tipo de conversa
  let manualFoco = '';
  if (tipo === 'Cliente') {
    manualFoco = CLIENT_QUALIFICATION;
  } else if (tipo === 'Arquiteto') {
    manualFoco = ARCHITECT_QUALIFICATION;
  } else {
    manualFoco = `${CLIENT_QUALIFICATION}\n\n${ARCHITECT_QUALIFICATION}`;
  }

  const systemPrompt = `
Você é o Copiloto Comercial de uma loja/marcenaria de móveis planejados de alto padrão (mercado AAA).
Seu papel é analisar relatórios brutos de reuniões ou atendimentos ("brain dumps" em formato de áudio transcrito ou texto livre) enviados pelos vendedores.

Seu objetivo é cruzar o relato com nossos manuais e regras comerciais para estruturar os dados e apontar problemas, riscos e oportunidades.

MANUAL DE QUALIFICAÇÃO APLICÁVEL:
${manualFoco}

MANUAL DE DEMISSÃO DE CLIENTE/ARQUITETO:
${FIRING_CRITERIA}

DIRETRIZES EXTRAS DA LOJA:
${regrasTexto}

INSTRUÇÕES DE ANÁLISE:
1. Faça um resumo conciso (máximo 3 frases) da conversa.
2. Identifique e liste as DORES REAIS expressadas pelo cliente ou arquiteto.
3. Identifique SINAIS DE ALERTA (red flags) com base nas regras de "quando demitir" e nas regras extras da loja (exemplos: pede orçamento sem briefing, foca apenas em preço/desconto, desrespeito ao processo, etc.).
4. Defina PRÓXIMOS PASSOS práticos para o vendedor contornar essas objeções ou seguir o processo correto da loja.
5. Classifique o perfil (AAA, Medio, Risco).

Você DEVE responder ESTRITAMENTE em formato JSON. Não envolva a resposta em markdown de código. O formato JSON esperado é:
{
  "resumo": "Breve resumo...",
  "dores_identificadas": ["Dor 1", "Dor 2"],
  "sinais_de_alerta": ["Alerta 1", "Alerta 2"],
  "proximos_passos": ["Ação 1", "Ação 2"],
  "perfil": "AAA | Medio | Risco"
}
`;

  try {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `Analise este relato de conversa:\n\n"${text}"` }]
          }
        ],
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        generationConfig: {
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error?.message || 'Error communicating with Gemini');
    }

    const data = await response.json();
    const resultText = data.candidates[0].content.parts[0].text;
    
    // Parsear a resposta para garantir que está no formato correto
    const parsedResult = JSON.parse(resultText);

    return res.status(200).json(parsedResult);
  } catch (error) {
    console.error('Error in analyze API:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
