import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { ClipboardCheck, ArrowLeft, Plus, Check } from 'lucide-react';

const Qualificacao = ({ setScreen }) => {
  const { arquitetos, addCliente, addArquiteto } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('cliente');
  const [success, setSuccess] = useState('');

  // Estados dos formulários
  const [clienteNome, setClienteNome] = useState('');
  const [clienteArquitetoId, setClienteArquitetoId] = useState('');
  const [clienteInvestimento, setClienteInvestimento] = useState('AAA');
  const [clienteUrgencia, setClienteUrgencia] = useState('Media');
  
  const [arquitetoNome, setArquitetoNome] = useState('');
  const [arquitetoEscritorio, setArquitetoEscritorio] = useState('');
  const [arquitetoTelefone, setArquitetoTelefone] = useState('');
  const [arquitetoEmail, setArquitetoEmail] = useState('');
  const [arquitetoRecorrencia, setArquitetoRecorrencia] = useState(5);
  const [arquitetoNivel, setArquitetoNivel] = useState('Medio');

  // Perguntas de qualificação selecionadas pelo vendedor durante a conversa
  const [clienteChecklist, setClienteChecklist] = useState({
    motivacao: false,
    evitar_ruidos: false,
    quem_decide: false,
    cronograma: false,
    marcas_luxo: false,
    prioridade_excelencia: false
  });

  const [arquitetoChecklist, setArquitetoChecklist] = useState({
    tempo_mercado: false,
    detalhamento_conjunto: false,
    acompanha_montagem: false,
    dores_fornecedores: false,
    recorrencia_anual: false
  });

  const handleClienteSubmit = async (e) => {
    e.preventDefault();
    if (!clienteNome) return;
    try {
      await addCliente({
        nome: clienteNome,
        arquiteto_id: clienteArquitetoId || null,
        fase: 'Qualificacao',
        perfil_investimento: clienteInvestimento,
        urgencia: clienteUrgencia
      });
      setSuccess('Cliente qualificado e salvo com sucesso!');
      setClienteNome('');
      setClienteArquitetoId('');
      setClienteChecklist({
        motivacao: false,
        evitar_ruidos: false,
        quem_decide: false,
        cronograma: false,
        marcas_luxo: false,
        prioridade_excelencia: false
      });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleArquitetoSubmit = async (e) => {
    e.preventDefault();
    if (!arquitetoNome || !arquitetoEscritorio) return;
    try {
      await addArquiteto({
        nome: arquitetoNome,
        escritorio: arquitetoEscritorio,
        telefone: arquitetoTelefone,
        email: arquitetoEmail,
        recorrencia_anual: parseInt(arquitetoRecorrencia) || 0,
        nivel: arquitetoNivel
      });
      setSuccess('Parceiro arquiteto qualificado e cadastrado!');
      setArquitetoNome('');
      setArquitetoEscritorio('');
      setArquitetoTelefone('');
      setArquitetoEmail('');
      setArquitetoChecklist({
        tempo_mercado: false,
        detalhamento_conjunto: false,
        acompanha_montagem: false,
        dores_fornecedores: false,
        recorrencia_anual: false
      });
      setTimeout(() => setSuccess(''), 3000);
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
          <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Qualificação Comercial</h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Realize o filtro estratégico de novos leads de alto padrão.</p>
        </div>
      </div>

      {success && (
        <div style={{ 
          backgroundColor: 'var(--success-bg)', 
          border: '1px solid var(--success-color)', 
          color: 'white', 
          padding: '1rem', 
          borderRadius: 'var(--border-radius-sm)',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Check size={18} style={{ color: 'var(--success-color)' }} />
          {success}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
        <button 
          onClick={() => setActiveTab('cliente')}
          style={{
            padding: '1rem 2rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'cliente' ? '2px solid var(--accent-color)' : '2px solid transparent',
            color: activeTab === 'cliente' ? varName => 'var(--accent-color)' : 'var(--text-secondary)',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Qualificar Cliente Final
        </button>
        <button 
          onClick={() => setActiveTab('arquiteto')}
          style={{
            padding: '1rem 2rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'arquiteto' ? '2px solid var(--accent-color)' : '2px solid transparent',
            color: activeTab === 'arquiteto' ? 'var(--accent-color)' : 'var(--text-secondary)',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Qualificar Escritório de Arquitetura
        </button>
      </div>

      {/* Formulário / Roteiro Clientes */}
      {activeTab === 'cliente' ? (
        <form onSubmit={handleClienteSubmit} className="split-layout">
          {/* Lado Esquerdo - Informações e Vínculos */}
          <div className="card" style={{ textAlign: 'left' }}>
            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
              Dados do Lead
            </h3>

            <div className="form-group">
              <label className="form-label">Nome Completo do Cliente</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Ex: Helena Montenegro" 
                value={clienteNome}
                onChange={(e) => setClienteNome(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Vincular Arquiteto / Designer (Se aplicável)</label>
              <select 
                className="form-select"
                value={clienteArquitetoId}
                onChange={(e) => setClienteArquitetoId(e.target.value)}
              >
                <option value="">Cliente Direto (Sem Arquiteto associado)</option>
                {arquitetos.map(a => (
                  <option key={a.id} value={a.id}>{a.nome} - {a.escritorio}</option>
                ))}
              </select>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Selecione o escritório que está intermediando a compra para cruzar as métricas comerciais.
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Perfil de Investimento estimado</label>
                <select 
                  className="form-select"
                  value={clienteInvestimento}
                  onChange={(e) => setClienteInvestimento(e.target.value)}
                >
                  <option value="AAA">Premium (Valoriza exclusividade/design)</option>
                  <option value="Medio">Médio Padrão (Sensível, mas quer qualidade)</option>
                  <option value="Risco">Baixo Ticket (Só briga por menor preço)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Urgência da Obra</label>
                <select 
                  className="form-select"
                  value={clienteUrgencia}
                  onChange={(e) => setClienteUrgencia(e.target.value)}
                >
                  <option value="Alta">Alta (Imóvel entregue/Reforma iniciada)</option>
                  <option value="Media">Média (Planejamento de médio prazo)</option>
                  <option value="Baixa">Baixa (Apenas coletando ideias/na planta)</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                <Plus size={18} /> Salvar Qualificação do Cliente
              </button>
            </div>
          </div>

          {/* Lado Direito - Perguntas Guia da Conversa */}
          <div className="card" style={{ textAlign: 'left' }}>
            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
              Roteiro de Validação Comercial
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Marque os tópicos abaixo à medida que obtiver as respostas de forma natural na conversa:
            </p>

            <div className="checklist-group">
              <div 
                className="checklist-item"
                onClick={() => setClienteChecklist(prev => ({ ...prev, motivacao: !prev.motivacao }))}
              >
                <input 
                  type="checkbox" 
                  checked={clienteChecklist.motivacao}
                  onChange={() => {}} 
                />
                <div className="checklist-text">
                  <span className="checklist-q">Qual foi a motivação do projeto neste momento?</span>
                  <span className="checklist-desc">Identifica a dor real (mudança, reforma, insatisfação, etc.)</span>
                </div>
              </div>

              <div 
                className="checklist-item"
                onClick={() => setClienteChecklist(prev => ({ ...prev, evitar_ruidos: !prev.evitar_ruidos }))}
              >
                <input 
                  type="checkbox" 
                  checked={clienteChecklist.evitar_ruidos}
                  onChange={() => {}} 
                />
                <div className="checklist-text">
                  <span className="checklist-q">O que não pode acontecer de forma alguma nesse projeto?</span>
                  <span className="checklist-desc">Descobre experiências ruins anteriores a serem evitadas.</span>
                </div>
              </div>

              <div 
                className="checklist-item"
                onClick={() => setClienteChecklist(prev => ({ ...prev, quem_decide: !prev.quem_decide }))}
              >
                <input 
                  type="checkbox" 
                  checked={clienteChecklist.quem_decide}
                  onChange={() => {}} 
                />
                <div className="checklist-text">
                  <span className="checklist-q">Além de você, há mais alguém decidindo o projeto?</span>
                  <span className="checklist-desc">Mapeia o decisor real e influenciadores familiares/técnicos.</span>
                </div>
              </div>

              <div 
                className="checklist-item"
                onClick={() => setClienteChecklist(prev => ({ ...prev, cronograma: !prev.cronograma }))}
              >
                <input 
                  type="checkbox" 
                  checked={clienteChecklist.cronograma}
                  onChange={() => {}} 
                />
                <div className="checklist-text">
                  <span className="checklist-q">Qual é a data em que o imóvel precisa estar pronto?</span>
                  <span className="checklist-desc">Valida a viabilidade real do cronograma e urgência.</span>
                </div>
              </div>

              <div 
                className="checklist-item"
                onClick={() => setClienteChecklist(prev => ({ ...prev, marcas_luxo: !prev.marcas_luxo }))}
              >
                <input 
                  type="checkbox" 
                  checked={clienteChecklist.marcas_luxo}
                  onChange={() => {}} 
                />
                <div className="checklist-text">
                  <span className="checklist-q">Quais marcas premium de outros setores você admira?</span>
                  <span className="checklist-desc">Identifica sofisticação e referências de valor do cliente.</span>
                </div>
              </div>

              <div 
                className="checklist-item"
                onClick={() => setClienteChecklist(prev => ({ ...prev, prioridade_excelencia: !prev.prioridade_excelencia }))}
              >
                <input 
                  type="checkbox" 
                  checked={clienteChecklist.prioridade_excelencia}
                  onChange={() => {}} 
                />
                <div className="checklist-text">
                  <span className="checklist-q">Entre economia e excelência de execução, qual sua prioridade?</span>
                  <span className="checklist-desc">Mapeia sensibilidade a preço e potencial de ticket alto.</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      ) : (
        /* Formulário / Roteiro Arquitetos */
        <form onSubmit={handleArquitetoSubmit} className="split-layout">
          {/* Lado Esquerdo - Cadastro do Escritório */}
          <div className="card" style={{ textAlign: 'left' }}>
            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
              Dados do Escritório
            </h3>

            <div className="form-group">
              <label className="form-label">Nome Completo do Arquiteto(a)</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Ex: Amanda Lins" 
                value={arquitetoNome}
                onChange={(e) => setArquitetoNome(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nome do Escritório</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Ex: Lins Arquitetura" 
                value={arquitetoEscritorio}
                onChange={(e) => setArquitetoEscritorio(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Telefone de Contato</label>
                <input 
                  type="tel" 
                  className="form-input" 
                  placeholder="(11) 99999-9999" 
                  value={arquitetoTelefone}
                  onChange={(e) => setArquitetoTelefone(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">E-mail Comercial</label>
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder="contato@escritorio.com" 
                  value={arquitetoEmail}
                  onChange={(e) => setArquitetoEmail(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Recorrência estimada (Projetos/Ano)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="Ex: 8" 
                  value={arquitetoRecorrencia}
                  onChange={(e) => setArquitetoRecorrencia(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nível de Parceria Classificado</label>
                <select 
                  className="form-select"
                  value={arquitetoNivel}
                  onChange={(e) => setArquitetoNivel(e.target.value)}
                >
                  <option value="AAA">AAA (Alto Padrão / Focado em Valor)</option>
                  <option value="Medio">Parceiro Médio (Razoável recorrência)</option>
                  <option value="Risco">Potencial de Risco (Briga por comissão abusiva)</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                <Plus size={18} /> Cadastrar Parceiro Arquiteto
              </button>
            </div>
          </div>

          {/* Lado Direito - Perguntas Guia Arquitetos */}
          <div className="card" style={{ textAlign: 'left' }}>
            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
              Roteiro de Parceria (Alinhamento Comercial)
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Mapeie a maturidade operacional e as dores de parceria do escritório:
            </p>

            <div className="checklist-group">
              <div 
                className="checklist-item"
                onClick={() => setArquitetoChecklist(prev => ({ ...prev, tempo_mercado: !prev.tempo_mercado }))}
              >
                <input 
                  type="checkbox" 
                  checked={arquitetoChecklist.tempo_mercado}
                  onChange={() => {}} 
                />
                <div className="checklist-text">
                  <span className="checklist-q">Há quanto tempo o escritório atua e qual o perfil médio do público?</span>
                  <span className="checklist-desc">Identifica maturidade comercial e ticket médio de mercado.</span>
                </div>
              </div>

              <div 
                className="checklist-item"
                onClick={() => setArquitetoChecklist(prev => ({ ...prev, detalhamento_conjunto: !prev.detalhamento_conjunto }))}
              >
                <input 
                  type="checkbox" 
                  checked={arquitetoChecklist.detalhamento_conjunto}
                  onChange={() => {}} 
                />
                <div className="checklist-text">
                  <span className="checklist-q">Prefere detalhar tudo ou desenvolver em conjunto?</span>
                  <span className="checklist-desc">Define o fluxo operacional e se necessita de muito suporte técnico.</span>
                </div>
              </div>

              <div 
                className="checklist-item"
                onClick={() => setArquitetoChecklist(prev => ({ ...prev, acompanha_montagem: !prev.acompanha_montagem }))}
              >
                <input 
                  type="checkbox" 
                  checked={arquitetoChecklist.acompanha_montagem}
                  onChange={() => {}} 
                />
                <div className="checklist-text">
                  <span className="checklist-q">Como funciona a gestão de obra? O escritório acompanha a montagem?</span>
                  <span className="checklist-desc">Previne conflitos de responsabilidade durante a instalação.</span>
                </div>
              </div>

              <div 
                className="checklist-item"
                onClick={() => setArquitetoChecklist(prev => ({ ...prev, dores_fornecedores: !prev.dores_fornecedores }))}
              >
                <input 
                  type="checkbox" 
                  checked={arquitetoChecklist.dores_fornecedores}
                  onChange={() => {}} 
                />
                <div className="checklist-text">
                  <span className="checklist-q">O que mais incomoda ou qual foi a pior experiência com marcenarias?</span>
                  <span className="checklist-desc">Mapeia fragilidades da concorrência e argumentos futuros de venda.</span>
                </div>
              </div>

              <div 
                className="checklist-item"
                onClick={() => setArquitetoChecklist(prev => ({ ...prev, recorrencia_anual: !prev.recorrencia_anual }))}
              >
                <input 
                  type="checkbox" 
                  checked={arquitetoChecklist.recorrencia_anual}
                  onChange={() => {}} 
                />
                <div className="checklist-text">
                  <span className="checklist-q">O que precisaria acontecer para construirmos uma parceria duradoura?</span>
                  <span className="checklist-desc">Valida critérios reais de indicação comercial e abertura.</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default Qualificacao;
