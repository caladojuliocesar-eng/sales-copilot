import React, { useContext, useState, useRef, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { 
  ArrowLeft, 
  GraduationCap, 
  Send, 
  Sparkles, 
  Play, 
  AlertTriangle,
  Award,
  ThumbsUp,
  ThumbsDown,
  RefreshCw
} from 'lucide-react';

const Simulador = ({ setScreen }) => {
  const { regras } = useContext(AppContext);
  const [step, setStep] = useState('select'); // 'select', 'chat', 'evaluation'
  const [scenario, setScenario] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loadingReply, setLoadingReply] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [loadingEval, setLoadingEval] = useState(false);
  
  const chatEndRef = useRef(null);

  // Cenários suportados com saudações iniciais estáticas
  const cenarios = [
    {
      id: 'cliente-desconto',
      titulo: 'Dr. Ricardo (Cliente AAA)',
      subtitulo: 'Exigindo desconto imediato e comparando preço',
      dificuldade: 'Média',
      saudacao: 'Olá, fui na loja de vocês por indicação do meu sócio. Quero fazer o projeto da marcenaria do meu novo apartamento. Mas já te aviso, recebi um orçamento de uma marcenaria local que ficou muito barato. O que vocês conseguem fazer pra cobrir? E já me dá quanto de desconto no PIX?'
    },
    {
      id: 'arquiteto-leilao',
      titulo: 'Arthur (Arquiteto Leiloeiro)',
      subtitulo: 'Pedindo orçamento rápido para barganhar com outros',
      dificuldade: 'Difícil',
      saudacao: 'Olá! Estou com um projeto de um apartamento de 250m² no Jardins. O cliente tem bastante pressa e quer fechar esta semana. Vocês conseguem me passar um orçamento aproximado do metro quadrado hoje para eu comparar com as outras lojas e decidir quem indico?'
    },
    {
      id: 'cliente-pressa',
      titulo: 'Helena (Cliente com Pressa)',
      subtitulo: 'Tentando pular etapas e pular briefing',
      dificuldade: 'Média',
      saudacao: 'Oi, tudo bem? Olha, estou com a reforma da minha cobertura atrasada e preciso fechar os móveis logo. Me passa um valor aproximado do orçamento por aqui por e-mail que, se tiver dentro do que eu imagino, eu vou aí pra gente detalhar.'
    },
    {
      id: 'arquiteto-comissao',
      titulo: 'Mariana (Arquiteta Comissão)',
      subtitulo: 'Exigindo comissão/RT abusiva de forma velada',
      dificuldade: 'Difícil',
      saudacao: 'Olá, tudo bem? Gosto muito do trabalho de vocês e estou pensando em indicar alguns clientes corporativos meus de alto padrão. Mas antes, queria entender como funciona a política de vocês para parceiros... Vocês pagam RT de quantos por cento em cima do fechamento?'
    }
  ];

  // Rolar chat para o final
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loadingReply]);

  const handleStartSimulation = (selectedId) => {
    const s = cenarios.find(item => item.id === selectedId);
    setScenario(selectedId);
    setMessages([
      { role: 'model', content: s.saudacao }
    ]);
    setStep('chat');
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loadingReply) return;

    const userMessage = input.trim();
    setInput('');
    
    // Atualizar mensagens com a fala do usuário
    const updatedMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(updatedMessages);
    setLoadingReply(true);

    const regrasAtivas = regras.filter(r => r.ativa).map(r => r.regra);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          scenario,
          customRules: regrasAtivas
        })
      });

      if (!response.ok) {
        throw new Error('Falha ao obter resposta do simulador.');
      }

      const chatData = await response.json();
      setMessages([...updatedMessages, { role: 'model', content: chatData.response }]);
    } catch (err) {
      console.error(err);
      alert('Erro de conexão com o simulador de IA.');
    } finally {
      setLoadingReply(false);
    }
  };

  const handleFinalizeAndEvaluate = async () => {
    setLoadingEval(true);
    setStep('evaluation');
    const regrasAtivas = regras.filter(r => r.ativa).map(r => r.regra);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          scenario,
          customRules: regrasAtivas,
          action: 'evaluate'
        })
      });

      if (!response.ok) {
        throw new Error('Falha ao processar avaliação.');
      }

      const evalData = await response.json();
      setEvaluation(evalData);
    } catch (err) {
      console.error(err);
      alert('Erro ao carregar a avaliação de IA.');
      setStep('chat');
    } finally {
      setLoadingEval(false);
    }
  };

  const handleReset = () => {
    setStep('select');
    setScenario('');
    setMessages([]);
    setEvaluation(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      {/* Cabeçalho */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={handleReset} className="btn btn-secondary btn-icon-only">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Arena de Treinamento</h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Pratique a postura comercial de alto padrão com clientes e parceiros simulados por IA.</p>
        </div>
      </div>

      {/* Passo 1: Seleção de Cenários */}
      {step === 'select' && (
        <div>
          <h2 style={{ marginBottom: '1.5rem', textAlign: 'left' }}>Selecione um Cenário de Treinamento</h2>
          <div className="dashboard-grid">
            {cenarios.map(c => (
              <div 
                key={c.id} 
                className="card dash-card" 
                onClick={() => handleStartSimulation(c.id)}
                style={{ textAlign: 'left' }}
              >
                <div>
                  <div className="dash-card-header">
                    <div className="dash-card-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                      <Play size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.15rem' }}>{c.titulo}</h3>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        color: c.dificuldade === 'Difícil' ? 'var(--error-color)' : 'var(--warning-color)',
                        fontWeight: 600
                      }}>
                        Dificuldade: {c.dificuldade}
                      </span>
                    </div>
                  </div>
                  <p>{c.subtitulo}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-color)', fontWeight: 500, marginTop: '1.5rem', fontSize: '0.9rem' }}>
                  Iniciar Treinamento <ArrowRight size={16} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Passo 2: Arena de Chat */}
      {step === 'chat' && (
        <div className="split-layout" style={{ flex: 1 }}>
          {/* Lado Esquerdo - Janela de Chat */}
          <div className="chat-container">
            <div className="chat-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textAlign: 'left' }}>
                <span className="spinner" style={{ width: '10px', height: '10px', display: loadingReply ? 'block' : 'none' }}></span>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.95rem' }}>
                    {cenarios.find(c => c.id === scenario)?.titulo}
                  </strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Simulador de IA Ativo</span>
                </div>
              </div>
              <button 
                onClick={handleFinalizeAndEvaluate} 
                className="btn btn-danger btn-sm"
                style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
              >
                Encerrar & Avaliar
              </button>
            </div>

            <div className="chat-history">
              {messages.map((m, idx) => (
                <div 
                  key={idx} 
                  className={`chat-bubble ${m.role === 'user' ? 'bubble-user' : 'bubble-model'}`}
                >
                  {m.content}
                </div>
              ))}
              {loadingReply && (
                <div className="chat-bubble bubble-model" style={{ display: 'flex', gap: '4px', padding: '0.75rem 1rem' }}>
                  <span className="spinner" style={{ width: '12px', height: '12px', borderWidth: '2px' }}></span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Digitando...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="chat-input-area">
              <input 
                type="text" 
                className="form-input" 
                placeholder="Responda respeitando os manuais de qualidade..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loadingReply}
                required
              />
              <button type="submit" className="btn btn-primary btn-icon-only" disabled={loadingReply || !input.trim()}>
                <Send size={18} />
              </button>
            </form>
          </div>

          {/* Lado Direito - Instruções de Suporte */}
          <div className="card" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h3 style={{ margin: 0 }}>Instruções da Arena</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
                Como se portar perante este cliente ou arquiteto:
              </p>
            </div>

            <div className="result-section">
              <h4 style={{ color: 'var(--accent-color)' }}><Sparkles size={16} /> Regras de Ouro aplicáveis:</h4>
              <ul className="bullet-list" style={{ fontSize: '0.9rem' }}>
                <li><strong>Valor antes de preço:</strong> Não fale de valores antes de entender o briefing e as dores reais.</li>
                <li><strong>Firmeza operacional:</strong> Se o cliente/arquiteto quiser pular etapas, insista gentilmente no processo da loja explicando a proteção à qualidade.</li>
                <li><strong>Detecção de red flags:</strong> Caso ocorram agressões, insultos ou pressões de margens que inviabilizem o financeiro, posicione-se firmemente.</li>
              </ul>
            </div>

            <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <strong>Dica:</strong> A simulação é um teste de integridade. A IA tentará forçá-lo a cometer erros comuns como ceder descontos de 20% logo na abertura. Mantenha a calma e contorne de forma premium.
            </div>
          </div>
        </div>
      )}

      {/* Passo 3: Avaliação de IA */}
      {step === 'evaluation' && (
        <div style={{ maxWidth: '750px', margin: '0 auto', width: '100%' }}>
          {loadingEval ? (
            <div style={{ textAlign: 'center', padding: '5rem' }}>
              <div className="spinner" style={{ width: '50px', height: '50px', margin: '0 auto 1.5rem auto' }}></div>
              <h3>Processando Avaliação Comercial...</h3>
              <p style={{ color: 'var(--text-secondary)' }}>O treinador Gemini está analisando seu diálogo comercial comparando com as regras AAA da loja.</p>
            </div>
          ) : (
            evaluation && (
              <div className="card" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', borderRadius: '50%', backgroundColor: 'var(--accent-bg)', color: 'var(--accent-color)' }}>
                      <Award size={32} />
                    </div>
                    <div>
                      <h2 style={{ margin: 0 }}>Desempenho da Simulação</h2>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Cenário: {cenarios.find(c => c.id === scenario)?.titulo}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold', color: evaluation.score >= 7 ? 'var(--success-color)' : 'var(--warning-color)', lineHeight: 1 }}>
                      {evaluation.score}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Pontuação</span>
                  </div>
                </div>

                <div className="ia-result-box">
                  <div className="result-section">
                    <h4><FileText size={16} style={{ color: 'var(--accent-color)' }} /> Resumo do Atendimento</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5', margin: 0 }}>
                      {evaluation.resumo_avaliacao}
                    </p>
                  </div>

                  <div className="result-section">
                    <h4 style={{ color: 'var(--success-color)' }}><ThumbsUp size={16} /> Pontos Fortes Demonstrados</h4>
                    <ul className="bullet-list">
                      {evaluation.pontos_fortes?.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="result-section">
                    <h4 style={{ color: 'var(--error-color)' }}><ThumbsDown size={16} /> Pontos a Corrigir (Desvios de Processo)</h4>
                    {evaluation.pontos_fracos?.length > 0 ? (
                      <ul className="bullet-list">
                        {evaluation.pontos_fracos.map((item, idx) => (
                          <li key={idx} style={{ color: 'white' }}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ fontStyle: 'italic', fontSize: '0.85rem', color: 'var(--success-color)', margin: 0 }}>Excelente! Nenhum desvio comercial grave identificado.</p>
                    )}
                  </div>

                  <div className="result-section">
                    <h4><Sparkles size={16} style={{ color: 'var(--accent-color)' }} /> Dicas de Melhoria Prática</h4>
                    <ul className="bullet-list">
                      {evaluation.dicas_melhoria?.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button onClick={handleReset} className="btn btn-secondary">
                    <RefreshCw size={16} /> Novo Cenário
                  </button>
                  <button onClick={() => setScreen('dashboard')} className="btn btn-primary">
                    Voltar ao Dashboard
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default Simulador;
