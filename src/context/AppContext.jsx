import React, { createContext, useState, useEffect } from 'react';
import { auth, db, isConfigured } from '../firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  orderBy,
  deleteDoc
} from 'firebase/firestore';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clientes, setClientes] = useState([]);
  const [arquitetos, setArquitetos] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [regras, setRegras] = useState([]);
  const [demoMode, setDemoMode] = useState(!isConfigured);
  const [errorMsg, setErrorMsg] = useState('');

  // -------------------------------------------------------------
  // MOCK DATA PARA DEMO MODE (Caso Firebase não esteja configurado)
  // -------------------------------------------------------------
  const loadMockData = () => {
    const mockClientes = JSON.parse(localStorage.getItem('mock_clientes')) || [
      { id: 'c1', nome: 'Helena Montenegro', arquiteto_id: 'a1', fase: 'Qualificacao', perfil_investimento: 'AAA', urgencia: 'Alta', criado_em: new Date().toISOString() },
      { id: 'c2', nome: 'Carlos de Sousa', arquiteto_id: null, fase: 'Briefing', perfil_investimento: 'Medio', urgencia: 'Media', criado_em: new Date().toISOString() }
    ];
    const mockArquitetos = JSON.parse(localStorage.getItem('mock_arquitetos')) || [
      { id: 'a1', nome: 'Amanda Lins', escritorio: 'Lins Arquitetura', telefone: '11999999999', email: 'amanda@lins.com', nivel: 'AAA', recorrencia_anual: 12, criado_em: new Date().toISOString() },
      { id: 'a2', nome: 'Julio Cesar',  escritorio: 'JC Interiores', telefone: '11888888888', email: 'julio@jc.com', nivel: 'Risco', recorrencia_anual: 1, criado_em: new Date().toISOString() }
    ];
    const mockFeedbacks = JSON.parse(localStorage.getItem('mock_feedbacks')) || [
      { id: 'f1', cliente_id: 'c1', arquiteto_id: 'a1', tipo_conversa: 'Arquiteto', conteudo_original: 'Falei com a Amanda, ela amou o portfólio. Disse que tem 2 projetos grandes e que quer nos indicar na próxima semana.', analise_ia: { resumo: 'Alinhamento de parceria com Amanda. Expectativa alta.', dores_identificadas: ['Prazo de entrega da concorrência'], sinais_de_alerta: [], proximos_passos: ['Enviar portfólio digital executivo'], perfil: 'AAA' }, criado_em: new Date().toISOString() }
    ];
    const mockRegras = JSON.parse(localStorage.getItem('mock_regras')) || [
      { id: 'r1', regra: 'Não enviar estimativa de preço ou orçamento por WhatsApp sem briefing presencial.', categoria: 'Cliente', ativa: true, criado_em: new Date().toISOString() },
      { id: 'r2', regra: 'Arquitetos que exigem mais de 15% de RT devem ser avaliados com atenção ao financeiro.', categoria: 'Arquiteto', ativa: true, criado_em: new Date().toISOString() }
    ];

    setClientes(mockClientes);
    setArquitetos(mockArquitetos);
    setFeedbacks(mockFeedbacks);
    setRegras(mockRegras);
    
    // Simular usuário logado na demo
    const mockUser = JSON.parse(localStorage.getItem('mock_user')) || { email: 'vendedor@loja.com', uid: 'demo-uid', displayName: 'Vendedor Demo (Offline)' };
    setUser(mockUser);
    setLoading(false);
  };

  const saveMock = (key, data, setter) => {
    localStorage.setItem(key, JSON.stringify(data));
    setter(data);
  };

  // -------------------------------------------------------------
  // CONTROLE DE AUTENTICAÇÃO
  // -------------------------------------------------------------
  const login = async (email, password) => {
    setErrorMsg('');
    if (demoMode) {
      if (email === 'vendedor@loja.com' && password === '123456') {
        const mockUser = { email, uid: 'demo-uid', displayName: 'Vendedor Demo' };
        localStorage.setItem('mock_user', JSON.stringify(mockUser));
        setUser(mockUser);
        return true;
      } else {
        throw new Error('E-mail ou senha incorretos na Demo. Use vendedor@loja.com e senha 123456.');
      }
    } else {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        return true;
      } catch (err) {
        console.error(err);
        throw new Error(err.message);
      }
    }
  };

  const logout = async () => {
    if (demoMode) {
      localStorage.removeItem('mock_user');
      setUser(null);
    } else {
      await signOut(auth);
    }
  };

  // -------------------------------------------------------------
  // EFEITO INICIAL - ASSINAR DADOS
  // -------------------------------------------------------------
  useEffect(() => {
    if (demoMode) {
      loadMockData();
      return;
    }

    // Ouvir autenticação
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    // Ouvir Clientes
    const qClientes = query(collection(db, 'clientes'), orderBy('criado_em', 'desc'));
    const unsubscribeClientes = onSnapshot(qClientes, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClientes(data);
    }, (err) => console.error(err));

    // Ouvir Arquitetos
    const qArquitetos = query(collection(db, 'arquitetos'), orderBy('criado_em', 'desc'));
    const unsubscribeArquitetos = onSnapshot(qArquitetos, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setArquitetos(data);
    }, (err) => console.error(err));

    // Ouvir Feedbacks
    const qFeedbacks = query(collection(db, 'feedbacks'), orderBy('criado_em', 'desc'));
    const unsubscribeFeedbacks = onSnapshot(qFeedbacks, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFeedbacks(data);
    }, (err) => console.error(err));

    // Ouvir Regras
    const qRegras = query(collection(db, 'regras_customizadas'), orderBy('criado_em', 'desc'));
    const unsubscribeRegras = onSnapshot(qRegras, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRegras(data);
    }, (err) => console.error(err));

    return () => {
      unsubscribeAuth();
      unsubscribeClientes();
      unsubscribeArquitetos();
      unsubscribeFeedbacks();
      unsubscribeRegras();
    };
  }, [demoMode]);

  // -------------------------------------------------------------
  // FUNÇÕES DE MANIPULAÇÃO DE DADOS
  // -------------------------------------------------------------
  const addCliente = async (clienteData) => {
    const data = {
      ...clienteData,
      criado_em: new Date().toISOString()
    };
    if (demoMode) {
      const newList = [{ id: 'c_' + Date.now(), ...data }, ...clientes];
      saveMock('mock_clientes', newList, setClientes);
    } else {
      await addDoc(collection(db, 'clientes'), data);
    }
  };

  const updateClienteFase = async (id, novaFase) => {
    if (demoMode) {
      const newList = clientes.map(c => c.id === id ? { ...c, fase: novaFase } : c);
      saveMock('mock_clientes', newList, setClientes);
    } else {
      await updateDoc(doc(db, 'clientes', id), { fase: novaFase });
    }
  };

  const addArquiteto = async (arquitetoData) => {
    const data = {
      ...arquitetoData,
      criado_em: new Date().toISOString()
    };
    if (demoMode) {
      const newList = [{ id: 'a_' + Date.now(), ...data }, ...arquitetos];
      saveMock('mock_arquitetos', newList, setArquitetos);
    } else {
      await addDoc(collection(db, 'arquitetos'), data);
    }
  };

  const updateArquitetoNivel = async (id, novoNivel) => {
    if (demoMode) {
      const newList = arquitetos.map(a => a.id === id ? { ...a, nivel: novoNivel } : a);
      saveMock('mock_arquitetos', newList, setArquitetos);
    } else {
      await updateDoc(doc(db, 'arquitetos', id), { nivel: novoNivel });
    }
  };

  const addFeedback = async (feedbackData) => {
    const data = {
      ...feedbackData,
      vendedor_id: user ? user.uid : 'anonimo',
      criado_em: new Date().toISOString()
    };
    if (demoMode) {
      const newList = [{ id: 'f_' + Date.now(), ...data }, ...feedbacks];
      saveMock('mock_feedbacks', newList, setFeedbacks);
    } else {
      await addDoc(collection(db, 'feedbacks'), data);
    }
  };

  const addRegra = async (regraText, categoria) => {
    const data = {
      regra: regraText,
      categoria,
      ativa: true,
      criado_em: new Date().toISOString()
    };
    if (demoMode) {
      const newList = [{ id: 'r_' + Date.now(), ...data }, ...regras];
      saveMock('mock_regras', newList, setRegras);
    } else {
      await addDoc(collection(db, 'regras_customizadas'), data);
    }
  };

  const toggleRegra = async (id, status) => {
    if (demoMode) {
      const newList = regras.map(r => r.id === id ? { ...r, ativa: status } : r);
      saveMock('mock_regras', newList, setRegras);
    } else {
      await updateDoc(doc(db, 'regras_customizadas', id), { ativa: status });
    }
  };

  const deleteRegra = async (id) => {
    if (demoMode) {
      const newList = regras.filter(r => r.id !== id);
      saveMock('mock_regras', newList, setRegras);
    } else {
      await deleteDoc(doc(db, 'regras_customizadas', id));
    }
  };

  return (
    <AppContext.Provider value={{
      user,
      loading,
      clientes,
      arquitetos,
      feedbacks,
      regras,
      demoMode,
      setDemoMode,
      errorMsg,
      login,
      logout,
      addCliente,
      updateClienteFase,
      addArquiteto,
      updateArquitetoNivel,
      addFeedback,
      addRegra,
      toggleRegra,
      deleteRegra
    }}>
      {children}
    </AppContext.Provider>
  );
};
