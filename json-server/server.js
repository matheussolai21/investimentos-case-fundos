// server.js - VERSÃO COMPLETA E CORRETA
const jsonServer = require('json-server');
const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Criar servidor UMA VEZ
const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

const SECRET_KEY = 'seu-chave-secreta-jwt';
const TOKEN_EXPIRATION = '8h';

// ==================== FUNÇÕES DE TOKEN ====================

// Gerar token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    SECRET_KEY,
    { expiresIn: TOKEN_EXPIRATION }
  );
};

// Verificar token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (error) {
    return null;
  }
};

// ==================== VALIDAÇÕES ====================

// Validar CNPJ
const validateCNPJ = (cnpj) => {
  const cnpjStr = String(cnpj).replace(/\D/g, '');
  return cnpjStr.length === 14;
};

// ==================== MIDDLEWARES BÁSICOS ====================
server.use(cors());
server.use(express.json());
server.use(middlewares);

// ==================== ROTAS PÚBLICAS ====================

// Login
server.post('/login', (req, res) => {
  console.log('Login request:', req.body);
  
  const db = router.db;
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ 
      success: false,
      error: 'Usuário e senha são obrigatórios' 
    });
  }
  
  const user = db.get('usuarios').find({ username }).value();
  let passwordValid = password == user.password;
  
  if (!user || !passwordValid) {
    console.log('Usuário não encontrado:', username);
    return res.status(401).json({ 
      success: false,
      error: 'Usuário ou senha inválidos' 
    });
  }
  
  const token = generateToken(user);
  const { password: _, ...userWithoutPassword } = user;
  
  console.log('sLogin successful:', username);
  
  res.json({
    success: true,
    message: 'Login realizado com sucesso',
    token,
    user: userWithoutPassword,
    expiresIn: TOKEN_EXPIRATION
  });
});

// ==================== ROTAS DE FUNDOS ====================

// GET - Listar todos os fundos
server.get('/fundos', (req, res) => {
  const db = router.db;
  const fundos = db.get('fundos').value();
  const tipos = db.get('tipos_fundo').value();
  
  const fundosEnriquecidos = fundos.map(fundo => ({
    ...fundo,
    tipo_nome: tipos.find(t => t.codigo === fundo.codigo_tipo)?.nome
  }));
  
  res.json(fundosEnriquecidos);
});

// GET - Detalhes de um fundo por código
server.get('/fundos/:codigo', (req, res) => {
  console.log('Buscando fundo com código:', req.params.codigo);
  
  const db = router.db;
  const { codigo } = req.params;
  
  const fundo = db.get('fundos').find({ codigo }).value();
  
  if (!fundo) {
    console.log('Fundo não encontrado:', codigo);
    return res.status(404).json({ error: 'Fundo não encontrado' });
  }
  
  const tipo = db.get('tipos_fundo').find({ codigo: fundo.codigo_tipo }).value();
  
  console.log('Fundo encontrado:', fundo.nome);
  
  res.json({
    ...fundo,
    tipo_nome: tipo?.nome
  });
});

// POST - Criar novo fundo
server.post('/fundos', (req, res) => {
  const db = router.db;
  const { codigo, nome, cnpj, codigo_tipo, patrimonio = 0 } = req.body;
  
  if (!codigo || !nome || !cnpj || !codigo_tipo) {
    return res.status(400).json({ 
      error: 'Campos obrigatórios: codigo, nome, cnpj, codigo_tipo' 
    });
  }
  
  const fundoExistente = db.get('fundos').find({ codigo }).value();
  if (fundoExistente) {
    return res.status(400).json({ error: 'Código do fundo já existe' });
  }
  
  const cnpjExistente = db.get('fundos').find({ cnpj }).value();
  if (cnpjExistente) {
    return res.status(400).json({ error: 'CNPJ já cadastrado' });
  }
  
  if (!validateCNPJ(cnpj)) {
    return res.status(400).json({ error: 'CNPJ inválido' });
  }
  
  const tipoExistente = db.get('tipos_fundo').find({ codigo: codigo_tipo }).value();
  if (!tipoExistente) {
    return res.status(400).json({ error: 'Tipo de fundo inválido' });
  }
  
  const novoFundo = { codigo, nome, cnpj, codigo_tipo, patrimonio };
  db.get('fundos').push(novoFundo).write();
  
  const tipo = db.get('tipos_fundo').find({ codigo: codigo_tipo }).value();
  
  res.status(201).json({ ...novoFundo, tipo_nome: tipo?.nome });
});


// DELETE - Excluir fundo
server.delete('/fundos/:codigo', (req, res) => {
  const db = router.db;
  const { codigo } = req.params;
  
  const fundoExistente = db.get('fundos').find({ codigo }).value();
  
  if (!fundoExistente) {
    return res.status(404).json({ error: 'Fundo não encontrado' });
  }
  
  db.get('fundos').remove({ codigo }).write();
  res.status(204).send();
});

server.patch('/fundos/:codigo', (req, res) => {
  const db = router.db;
  const { codigo } = req.params;
  const { nome, cnpj, codigo_tipo, patrimonio } = req.body;
  
  // Busca o fundo existente
  const fundoExistente = db.get('fundos').find({ codigo }).value();
  
  if (!fundoExistente) {
    return res.status(404).json({ error: 'Fundo não encontrado' });
  }
  
  // Valida CNPJ duplicado (se estiver alterando)
  if (cnpj && cnpj !== fundoExistente.cnpj) {
    const cnpjExistente = db.get('fundos').find({ cnpj }).value();
    if (cnpjExistente) {
      return res.status(400).json({ error: 'CNPJ já cadastrado para outro fundo' });
    }
  }
  
  // Valida patrimônio negativo
  if (patrimonio !== undefined && patrimonio < 0) {
    return res.status(400).json({ error: 'Patrimônio não pode ser negativo' });
  }
  
  // Valida tipo do patrimônio
  if (patrimonio !== undefined && typeof patrimonio !== 'number') {
    return res.status(400).json({ error: 'Patrimônio deve ser numérico' });
  }
  
  // Cria objeto com apenas os campos que foram enviados
  const atualizacoes = {};
  
  if (nome !== undefined) atualizacoes.nome = nome;
  if (cnpj !== undefined) atualizacoes.cnpj = cnpj;
  if (codigo_tipo !== undefined) atualizacoes.codigo_tipo = codigo_tipo;
  if (patrimonio !== undefined) atualizacoes.patrimonio = patrimonio;
  
  // Aplica as atualizações
  db.get('fundos').find({ codigo }).assign(atualizacoes).write();
  
  // Busca o fundo atualizado
  const fundoAtualizado = db.get('fundos').find({ codigo }).value();
  const tipo = db.get('tipos_fundo').find({ codigo: fundoAtualizado.codigo_tipo }).value();
  
  res.json({ ...fundoAtualizado, tipo_nome: tipo?.nome });
});
// ==================== ROUTER PADRÃO ====================
server.use('/api', router);

// ==================== INICIAR SERVIDOR ====================
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`
   "inialização do servidor JSON Server"
 
  `);
});