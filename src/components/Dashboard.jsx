import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { 
  ClipboardCheck, 
  Mic, 
  GraduationCap, 
  Settings, 
  Users, 
  UserCheck, 
  FileText,
  AlertTriangle,
  ArrowRight,
  X
} from 'lucide-react';

const Dashboard = ({ setScreen }) => {
  const { clientes, arquitetos, feedbacks } = useContext(AppContext);
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  // Auxiliares de contagem
  const totalClientes = clientes.length;
  const totalArquitetos = arquitetos.length;
  const totalDemitidos = clientes.filter(c => c.fase === 'Demitido').length;

  // Obter o nome do cliente associado ao feedback
  const getClienteNome = (clienteId) => {
    if (!clienteId) return 'Geral';
    const c = clientes.find(item => item.id === clienteId);
    return c ? c.nome : 'Cliente Desconhecido';
  };

  // Obter o nome do arquiteto associado ao feedback
  const getArquitetoNome = (arquitetoId) => {
    if (!arquitetoId) return null;
    const a = arquitetos.find(item => item.id === arquitetoId);
    return a ? `${a.nome} (${a.escritorio})` : 'Arquiteto Desconhecido';
  };

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1>Painel Geral</h1>
        <p className="subtitle">Bem-vindo ao Sales Copilot. Monitore leads, analise negociações e melhore a performance da loja.</p>
      </div>

      {/* Métricas Principais */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '50%', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
            <UserCheck size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{totalClientes}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Clientes Qualificados</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '50%', backgroundColor: 'rgba(226, 176, 83, 0.1)', color: 'var(--accent-color)' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{totalArquitetos}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Arquitetos Parceiros</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error-color)' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{totalDemitidos}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Leads Descartados/Demitidos</div>
          </div>
        </div>
      </div>

      {/* Grid de Ações Rápidas */}
      <h2 style={{ marginBottom: '1.5rem' }}>Ações Rápidas</h2>
      <div className="dashboard-grid">
        <div className="card dash-card" onClick={() => setScreen('qualificacao')}>
          <div>
            <div className="dash-card-header">
              <div className="dash-card-icon">
                <ClipboardCheck size={24} />
              </div>
              <h3>Nova Qualificação</h3>
            </div>
            <p>Faça a qualificação consultiva de um cliente final ou de um escritório de arquitetura antes de iniciar o projeto.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-color)', fontWeight: 500, marginTop: '1.5rem', fontSize: '0.9rem' }}>
            Iniciar Qualificação <ArrowRight size={16} />
          </div>
        </div>

        <div className="card dash-card" onClick={() => setScreen('braindump')}>
          <div>
            <div className="dash-card-header">
              <div className="dash-card-icon">
                <Mic size={24} />
              </div>
              <h3>Registrar Brain Dump</h3>
            </div>
            <p>Grave um áudio ou relate livremente como foi um atendimento comercial. O copiloto analisará dores e red flags.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-color)', fontWeight: 500, marginTop: '1.5rem', fontSize: '0.9rem' }}>
            Falar com Copiloto <ArrowRight size={16} />
          </div>
        </div>

        <div className="card dash-card" onClick={() => setScreen('simulador')}>
          <div>
            <div className="dash-card-header">
              <div className="dash-card-icon">
                <GraduationCap size={24} />
              </div>
              <h3>Simular Treinamento</h3>
            </div>
            <p>Treine negociações simulando reuniões de alto padrão com clientes impacientes ou arquitetos difíceis de agradar.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-color)', fontWeight: 500, marginTop: '1.5rem', fontSize: '0.9rem' }}>
            Entrar na Arena <ArrowRight size={16} />
          </div>
        </div>

        <div className="card dash-card" onClick={() => setScreen('diretrizes')}>
          <div>
            <div className="dash-card-header">
              <div className="dash-card-icon">
                <Settings size={24} />
              </div>
              <h3>Configurar Diretrizes</h3>
            </div>
            <p>Alimente o cérebro da IA com novas regras, limites comerciais e aprendizados práticos do dia a dia da marcenaria.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-color)', fontWeight: 500, marginTop: '1.5rem', fontSize: '0.9rem' }}>
            Gerenciar Regras <ArrowRight size={16} />
          </div>
        </div>
      </div>

      {/* Relatos Recentes */}
      <h2 style={{ marginBottom: '1.5rem' }}>Últimas Interações & Análises</h2>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {feedbacks.length === 0 ? (
          <div style={{ padding: '3rem', textClear: 'center', color: 'var(--text-muted)' }}>
            Nenhum relato registrado recentemente. Vá em "Registrar Brain Dump" para iniciar.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {feedbacks.slice(0, 5).map((f) => {
              const analise = f.analise_ia || {};
              const temAlerta = analise.sinais_de_alerta && analise.sinais_de_alerta.length > 0;
              return (
                <div 
                  key={f.id} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '1.25rem 1.5rem',
                    borderBottom: '1px solid var(--border-color)',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  className="list-item-hover"
                  onClick={() => setSelectedFeedback(f)}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', textAlign: 'left' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {f.tipo_conversa === 'Arquiteto' ? 'Arquiteto:' : 'Cliente:'} {getClienteNome(f.cliente_id)}
                      {getArquitetoNome(f.arquiteto_id) && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>
                          via {getArquitetoNome(f.arquiteto_id)}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '500px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {analise.resumo || f.conteudo_original}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {temAlerta && (
                      <div className="badge badge-risco" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <AlertTriangle size={12} /> Alerta
                      </div>
                    )}
                    <span className={`badge ${
                      analise.perfil === 'AAA' ? 'badge-aaa' : 
                      analise.perfil === 'Risco' ? 'badge-risco' : 'badge-medio'
                    }`}>
                      {analise.perfil || 'Não Definido'}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(f.criado_em).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Detalhes do Feedback */}
      {selectedFeedback && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button 
              onClick={() => setSelectedFeedback(null)} 
              className="btn btn-secondary btn-icon-only"
              style={{ position: 'absolute', right: '1.5rem', top: '1.5rem' }}
            >
              <X size={18} />
            </button>

            <h2 style={{ marginBottom: '1.5rem', paddingRight: '2rem' }}>
              Análise Comercial: {getClienteNome(selectedFeedback.cliente_id)}
            </h2>

            <div className="ia-result-box" style={{ textAlign: 'left' }}>
              <div className="result-section">
                <h4><FileText size={16} style={{ color: 'var(--accent-color)' }} /> Resumo Executivo</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  {selectedFeedback.analise_ia?.resumo || 'Nenhum resumo disponível.'}
                </p>
              </div>

              {selectedFeedback.analise_ia?.dores_identificadas?.length > 0 && (
                <div className="result-section">
                  <h4 style={{ color: 'var(--success-color)' }}><UserCheck size={16} /> Dores & Desejos Identificados</h4>
                  <ul className="bullet-list">
                    {selectedFeedback.analise_ia.dores_identificadas.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedFeedback.analise_ia?.sinais_de_alerta?.length > 0 && (
                <div className="result-section">
                  <h4 style={{ color: 'var(--error-color)' }}><AlertTriangle size={16} /> Comportamentos de Risco / Alertas</h4>
                  <ul className="bullet-list">
                    {selectedFeedback.analise_ia.sinais_de_alerta.map((a, i) => (
                      <li key={i} style={{ color: 'white', fontWeight: 500 }}>{a}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedFeedback.analise_ia?.proximos_passos?.length > 0 && (
                <div className="result-section">
                  <h4><ArrowRight size={16} style={{ color: 'var(--accent-color)' }} /> Próximos Passos Recomendados</h4>
                  <ul className="bullet-list">
                    {selectedFeedback.analise_ia.proximos_passos.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Classificação de Perfil: </span>
                  <span className={`badge ${
                    selectedFeedback.analise_ia?.perfil === 'AAA' ? 'badge-aaa' : 
                    selectedFeedback.analise_ia?.perfil === 'Risco' ? 'badge-risco' : 'badge-medio'
                  }`}>
                    {selectedFeedback.analise_ia?.perfil || 'Não Definido'}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Registrado em {new Date(selectedFeedback.criado_em).toLocaleDateString('pt-BR')} às {new Date(selectedFeedback.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <button onClick={() => setSelectedFeedback(null)} className="btn btn-primary">
                Fechar Análise
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
