import React, { useContext, useState, useEffect, useRef } from 'react';
import { AppContext } from '../context/AppContext';
import { 
  ArrowLeft, 
  Mic, 
  MicOff, 
  Sparkles, 
  AlertTriangle, 
  UserCheck, 
  FileText,
  Check,
  ArrowRight
} from 'lucide-react';

const BrainDump = ({ setScreen }) => {
  const { clientes, arquitetos, regras, addFeedback } = useContext(AppContext);
  const [text, setText] = useState('');
  
  // Vinculação do relato
  const [tipoConversa, setTipoConversa] = useState('Cliente');
  const [clienteId, setClienteId] = useState('');
  const [arquitetoId, setArquitetoId] = useState('');
  
  // Estado de gravação de voz
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const recognitionRef = useRef(null);

  // Estados de análise de IA
  const [loadingIA, setLoadingIA] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Inicializar Web Speech API para Transcrição de Voz Nativa em pt-BR
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSpeechSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = 'pt-BR';

      rec.onresult = (event) => {
        const resultIndex = event.resultIndex;
        const transcript = event.results[resultIndex][0].transcript;
        setText((prev) => (prev ? `${prev.trim()} ${transcript}` : transcript));
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      rec.onerror = (e) => {
        console.error('Speech recognition error:', e);
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleRecording = () => {
    if (!isSpeechSupported) return;
    
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setLoadingIA(true);
    setAnalysisResult(null);
    setSaveSuccess(false);

    // Filtrar apenas regras ativas para enviar à IA
    const regrasAtivas = regras.filter(r => r.ativa).map(r => r.regra);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          tipo: tipoConversa,
          customRules: regrasAtivas
        })
      });

      if (!response.ok) {
        throw new Error('Falha ao obter análise comercial.');
      }

      const iaData = await response.json();
      setAnalysisResult(iaData);
    } catch (err) {
      console.error(err);
      alert('Ocorreu um erro ao chamar o Copiloto Gemini. Verifique a API Key no ambiente.');
    } finally {
      setLoadingIA(false);
    }
  };

  const handleSaveFeedback = async () => {
    if (!analysisResult) return;
    try {
      await addFeedback({
        cliente_id: clienteId || null,
        arquiteto_id: arquitetoId || null,
        tipo_conversa: tipoConversa,
        conteudo_original: text,
        analise_ia: analysisResult
      });
      setSaveSuccess(true);
      // Limpar campos
      setText('');
      setClienteId('');
      setArquitetoId('');
      setTimeout(() => {
        setSaveSuccess(false);
        setAnalysisResult(null);
      }, 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      {/* Cabeçalho */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => setScreen('dashboard')} className="btn btn-secondary btn-icon-only">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Brain Dump de Conversa</h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Fale ou digite como foi a reunião. A IA analisará riscos e conformidades.</p>
        </div>
      </div>

      <div className="split-layout">
        {/* Lado Esquerdo - Painel de Entrada de Texto/Áudio */}
        <div className="card" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3 style={{ margin: 0 }}>Relato Comercial</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Descarregue os pontos da conversa livremente.</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Tipo de Relato</label>
              <select 
                className="form-select"
                value={tipoConversa}
                onChange={(e) => {
                  setTipoConversa(e.target.value);
                  setClienteId('');
                  setArquitetoId('');
                }}
              >
                <option value="Cliente">Reunião com Cliente</option>
                <option value="Arquiteto">Reunião com Arquiteto</option>
                <option value="Geral">Assunto Geral / Negociação</option>
              </select>
            </div>

            {tipoConversa === 'Cliente' && (
              <div className="form-group">
                <label className="form-label">Vincular ao Cliente</label>
                <select 
                  className="form-select"
                  value={clienteId}
                  onChange={(e) => {
                    setClienteId(e.target.value);
                    // Autofill o arquiteto se o cliente tiver um associado
                    const c = clientes.find(item => item.id === e.target.value);
                    if (c && c.arquiteto_id) {
                      setArquitetoId(c.arquiteto_id);
                    }
                  }}
                  required
                >
                  <option value="">-- Selecione o Cliente --</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>
            )}

            {tipoConversa === 'Arquiteto' && (
              <div className="form-group">
                <label className="form-label">Vincular ao Arquiteto</label>
                <select 
                  className="form-select"
                  value={arquitetoId}
                  onChange={(e) => setArquitetoId(e.target.value)}
                  required
                >
                  <option value="">-- Selecione o Arquiteto --</option>
                  {arquitetos.map(a => (
                    <option key={a.id} value={a.id}>{a.nome} ({a.escritorio})</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Botão de gravação por voz */}
          {isSpeechSupported ? (
            <div className="record-panel">
              <button 
                type="button"
                className={`record-btn ${isRecording ? 'recording' : ''}`}
                onClick={toggleRecording}
              >
                {isRecording ? <MicOff size={28} /> : <Mic size={28} />}
              </button>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                {isRecording ? 'Gravando e Transcrevendo...' : 'Clique para Falar'}
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Fale livremente e o Google transcreverá seu relato em tempo real.
              </span>
            </div>
          ) : (
            <div style={{ padding: '1rem', backgroundColor: 'var(--warning-bg)', border: '1px solid var(--warning-color)', borderRadius: 'var(--border-radius-sm)', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Gravação de voz por navegador não suportada no seu dispositivo. Use o teclado abaixo.
            </div>
          )}

          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Relato Escrito (Edite o texto se necessário)</label>
            <textarea 
              className="form-textarea"
              style={{ minHeight: '180px', flex: 1 }}
              placeholder="Digite ou fale: como começou a conversa, dores relatadas, postura em relação a valores, se respeitou nosso processo..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          <button 
            type="button" 
            className="btn btn-primary"
            style={{ width: '100%' }}
            onClick={handleAnalyze}
            disabled={loadingIA || !text.trim()}
          >
            {loadingIA ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div className="spinner"></div> Processando Relato comercial...
              </div>
            ) : (
              <>
                <Sparkles size={18} /> Analisar com Copiloto comercial
              </>
            )}
          </button>
        </div>

        {/* Lado Direito - Painel de Resposta da Análise da IA */}
        <div className="card" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
            Análise do Copiloto Gemini
          </h3>

          {saveSuccess && (
            <div style={{ backgroundColor: 'var(--success-bg)', border: '1px solid var(--success-color)', color: 'white', padding: '1rem', borderRadius: 'var(--border-radius-sm)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Check size={18} style={{ color: 'var(--success-color)' }} />
              Análise registrada com sucesso na base de conhecimento!
            </div>
          )}

          {!analysisResult && !loadingIA && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
              <Sparkles size={48} style={{ strokeWidth: 1, color: 'var(--border-color)', marginBottom: '1rem' }} />
              <p style={{ textAlign: 'center', fontSize: '0.95rem' }}>
                Escreva ou grave um relato à esquerda e clique em <strong>Analisar com Copiloto</strong> para ver os aprendizados, riscos de margem e recomendações.
              </p>
            </div>
          )}

          {loadingIA && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <div className="spinner" style={{ width: '40px', height: '40px', marginBottom: '1rem' }}></div>
              <p>O Gemini está lendo nossos manuais e avaliando seu relato comercial...</p>
            </div>
          )}

          {analysisResult && !loadingIA && (
            <div className="ia-result-box" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div className="result-section">
                  <h4><FileText size={16} style={{ color: 'var(--accent-color)' }} /> Resumo Comercial</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5', margin: 0 }}>
                    {analysisResult.resumo}
                  </p>
                </div>

                <div className="result-section">
                  <h4 style={{ color: 'var(--success-color)' }}><UserCheck size={16} /> Dores & Desejos</h4>
                  {analysisResult.dores_identificadas?.length > 0 ? (
                    <ul className="bullet-list">
                      {analysisResult.dores_identificadas.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ fontStyle: 'italic', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Nenhuma dor explícita identificada.</p>
                  )}
                </div>

                <div className="result-section">
                  <h4 style={{ color: 'var(--error-color)' }}><AlertTriangle size={16} /> Sinais de Alerta (Red Flags)</h4>
                  {analysisResult.sinais_de_alerta?.length > 0 ? (
                    <ul className="bullet-list">
                      {analysisResult.sinais_de_alerta.map((a, i) => (
                        <li key={i} style={{ color: 'white', fontWeight: 500 }}>{a}</li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ fontStyle: 'italic', fontSize: '0.85rem', color: 'var(--success-color)' }}>Nenhum comportamento de risco grave identificado!</p>
                  )}
                </div>

                <div className="result-section">
                  <h4><ArrowRight size={16} style={{ color: 'var(--accent-color)' }} /> Recomendações & Próximos Passos</h4>
                  {analysisResult.proximos_passos?.length > 0 ? (
                    <ul className="bullet-list">
                      {analysisResult.proximos_passos.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ fontStyle: 'italic', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Nenhuma recomendação especial.</p>
                  )}
                </div>
              </div>

              <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Perfil Proposto: </span>
                  <span className={`badge ${
                    analysisResult.perfil === 'AAA' ? 'badge-aaa' : 
                    analysisResult.perfil === 'Risco' ? 'badge-risco' : 'badge-medio'
                  }`}>
                    {analysisResult.perfil || 'Não Definido'}
                  </span>
                </div>
                <button 
                  onClick={handleSaveFeedback} 
                  className="btn btn-primary"
                >
                  <Check size={18} /> Registrar Análise
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrainDump;
