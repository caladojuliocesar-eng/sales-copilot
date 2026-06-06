import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { ArrowLeft, Plus, ToggleLeft, ToggleRight, Trash2, ShieldAlert } from 'lucide-react';

const Diretrizes = ({ setScreen }) => {
  const { regras, addRegra, toggleRegra, deleteRegra } = useContext(AppContext);
  const [newRegra, setNewRegra] = useState('');
  const [categoria, setCategoria] = useState('Cliente');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newRegra.trim()) return;
    try {
      await addRegra(newRegra.trim(), categoria);
      setNewRegra('');
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
          <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Diretrizes da Base Viva</h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Gerencie as regras comerciais adicionais que alimentam a IA do app.</p>
        </div>
      </div>

      <div className="split-layout">
        {/* Lado Esquerdo - Cadastro de Nova Regra */}
        <div className="card" style={{ textAlign: 'left', height: 'fit-content' }}>
          <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
            Nova Diretriz
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Adicione orientações práticas. Toda nova diretriz cadastrada e marcada como ativa será considerada imediatamente nas análises e treinamentos.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Descrição da Regra Comercial</label>
              <textarea 
                className="form-textarea" 
                style={{ minHeight: '110px' }}
                placeholder="Ex: Não aceitar negociação de desconto de cliente final que exige o envio de projeto executivo por e-mail sem reunião presencial ou chamada de vídeo."
                value={newRegra}
                onChange={(e) => setNewRegra(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label className="form-label">Aplicável a:</label>
              <select 
                className="form-select"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
              >
                <option value="Cliente">Qualificação de Cliente Final</option>
                <option value="Arquiteto">Qualificação de Arquiteto/Parceiro</option>
                <option value="Geral">Regras Gerais da Operação comercial</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={!newRegra.trim()}>
              <Plus size={18} /> Adicionar Diretriz Viva
            </button>
          </form>
        </div>

        {/* Lado Direito - Listagem das Regras Cadastradas */}
        <div className="card" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
            Diretrizes Ativas ({regras.length})
          </h3>

          {regras.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
              <ShieldAlert size={40} style={{ color: 'var(--border-color)', marginBottom: '1rem' }} />
              <p style={{ textAlign: 'center', fontSize: '0.9rem', margin: 0 }}>Nenhuma diretriz customizada cadastrada ainda. Use o painel ao lado.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {regras.map((r) => (
                <div 
                  key={r.id} 
                  style={{ 
                    padding: '1rem', 
                    backgroundColor: 'var(--bg-tertiary)', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: 'var(--border-radius-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span className="badge badge-aaa" style={{ fontSize: '0.65rem' }}>
                      {r.categoria === 'Cliente' ? 'Cliente' : r.categoria === 'Arquiteto' ? 'Arquiteto' : 'Geral'}
                    </span>
                    <button 
                      onClick={() => deleteRegra(r.id)} 
                      className="btn btn-secondary btn-icon-only"
                      style={{ padding: '4px', borderColor: 'transparent', color: 'var(--error-color)', backgroundColor: 'transparent' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <p style={{ fontSize: '0.9rem', color: r.ativa ? 'var(--text-primary)' : 'var(--text-muted)', lineHeight: '1.4', margin: 0 }}>
                    {r.regra}
                  </p>

                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    borderTop: '1px solid var(--border-color)', 
                    paddingTop: '0.5rem',
                    marginTop: '0.5rem'
                  }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Criada em {new Date(r.criado_em).toLocaleDateString('pt-BR')}
                    </span>

                    <button 
                      onClick={() => toggleRegra(r.id, !r.ativa)}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        cursor: 'pointer', 
                        color: r.ativa ? 'var(--success-color)' : 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        padding: 0
                      }}
                    >
                      {r.ativa ? (
                        <>
                          <ToggleRight size={28} />
                          <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Ativa</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft size={28} />
                          <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Inativa</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Diretrizes;
