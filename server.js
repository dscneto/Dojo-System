const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dojo-system-secret-2026';

const app = express();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
  family: 4
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ================================
// BANCO DE DADOS
// ================================

async function iniciarBanco() {
  console.log('Banco de dados pronto!');
}

// ================================
// PROFESSORES
// ================================

app.get('/api/professores', async function(req, res) {
  const resultado = await pool.query('SELECT * FROM professores ORDER BY nome');
  res.json(resultado.rows);
});

app.post('/api/professores', async function(req, res) {
  const { nome, telefone, data_nascimento, unidades, modalidades, usuario, senha } = req.body;
  const resultado = await pool.query(
    'INSERT INTO professores (nome, telefone, data_nascimento, unidades, modalidades, usuario, senha) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
    [nome, telefone, data_nascimento, unidades, modalidades, usuario, senha]
  );
  res.json({ id: resultado.rows[0].id });
});

app.put('/api/professores/:id', async function(req, res) {
  const { nome, telefone, data_nascimento, unidades, modalidades, usuario, senha } = req.body;

  if (senha) {
    await pool.query(
      'UPDATE professores SET nome=$1, telefone=$2, data_nascimento=$3, unidades=$4, modalidades=$5, usuario=$6, senha=$7 WHERE id=$8',
      [nome, telefone, data_nascimento, unidades, modalidades, usuario, senha, req.params.id]
    );
  } else {
    await pool.query(
      'UPDATE professores SET nome=$1, telefone=$2, data_nascimento=$3, unidades=$4, modalidades=$5, usuario=$6 WHERE id=$7',
      [nome, telefone, data_nascimento, unidades, modalidades, usuario, req.params.id]
    );
  }
  res.json({ ok: true });
});

app.delete('/api/professores/:id', async function(req, res) {
  await pool.query('DELETE FROM professores WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

// ================================
// AULAS EXPERIMENTAIS
// ================================

app.get('/api/aulas', async function(req, res) {
  const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
  let usuario = null;

  if (token) {
    try { usuario = jwt.verify(token, JWT_SECRET); } catch(e) {}
  }

  let query  = 'SELECT a.*, p.nome AS nome_professor FROM aulas a LEFT JOIN professores p ON a.professor_id = p.id';
  let params = [];

  if (usuario && usuario.perfil === 'professor') {
    query  += ' WHERE a.professor_id = $1';
    params  = [usuario.id];
  }

  query += ' ORDER BY a.data, a.horario';
  const resultado = await pool.query(query, params);
  res.json(resultado.rows);
});

app.post('/api/aulas', async function(req, res) {
  const { nome, idade, modalidade, professor_id, data, horario, unidade } = req.body;
  const resultado = await pool.query(
    'INSERT INTO aulas (nome, idade, modalidade, professor_id, data, horario, unidade) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
    [nome, idade, modalidade, professor_id, data, horario, unidade]
  );
  res.json({ id: resultado.rows[0].id });
});

app.put('/api/aulas/:id', async function(req, res) {
  const { nome, idade, modalidade, professor_id, data, horario, unidade } = req.body;
  await pool.query(
    'UPDATE aulas SET nome=$1, idade=$2, modalidade=$3, professor_id=$4, data=$5, horario=$6, unidade=$7 WHERE id=$8',
    [nome, idade, modalidade, professor_id, data, horario, unidade, req.params.id]
  );
  res.json({ ok: true });
});

app.delete('/api/aulas/:id', async function(req, res) {
  await pool.query('DELETE FROM aulas WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

// ================================
// HORÁRIOS
// ================================

app.get('/api/horarios', async function(req, res) {
  const { unidade, modalidade } = req.query;
  const resultado = await pool.query(
    'SELECT * FROM horarios WHERE unidade = $1 AND modalidade = $2 ORDER BY horario',
    [unidade, modalidade]
  );
  res.json(resultado.rows);
});

// ================================
// ALUNOS
// ================================

app.get('/api/alunos', async function(req, res) {
  const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
  let usuario = null;

  if (token) {
    try { usuario = jwt.verify(token, JWT_SECRET); } catch(e) {}
  }

  let query  = 'SELECT a.*, p.nome AS nome_professor FROM alunos a LEFT JOIN professores p ON a.professor_id = p.id';
  let params = [];

  if (usuario && usuario.perfil === 'professor') {
    query  += ' WHERE a.professor_id = $1';
    params  = [usuario.id];
  }

  query += ' ORDER BY a.nome';
  const resultado = await pool.query(query, params);
  res.json(resultado.rows);
});

app.post('/api/alunos', async function(req, res) {
  try {
    const {
      nome, data_nascimento, cpf, telefone, unidade,
      rua, numero, bairro, cidade,
      nome_responsavel, contato_responsavel,
      professor_id, modalidade, horario_id, dias_escolhidos, valor_mensalidade,
      professor2_id, modalidade2, horario2_id, dias_escolhidos2, valor_mensalidade2,
      professor3_id, modalidade3, horario3_id, dias_escolhidos3, valor_mensalidade3,
      data_matricula, vencimento, status, observacoes
    } = req.body;

    const resultado = await pool.query(`
      INSERT INTO alunos (
        nome, data_nascimento, cpf, telefone, unidade,
        rua, numero, bairro, cidade,
        nome_responsavel, contato_responsavel,
        professor_id, modalidade, horario_id, dias_escolhidos, valor_mensalidade,
        professor2_id, modalidade2, horario2_id, dias_escolhidos2, valor_mensalidade2,
        professor3_id, modalidade3, horario3_id, dias_escolhidos3, valor_mensalidade3,
        data_matricula, vencimento, status, observacoes
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
        $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
        $21,$22,$23,$24,$25,$26,$27,$28,$29,$30
      ) RETURNING id
    `, [
      nome, data_nascimento || null, cpf || null, telefone || null, unidade,
      rua || null, numero || null, bairro || null, cidade || null,
      nome_responsavel || null, contato_responsavel || null,
      professor_id || null, modalidade || null, horario_id || null, dias_escolhidos || null, valor_mensalidade || null,
      professor2_id || null, modalidade2 || null, horario2_id || null, dias_escolhidos2 || null, valor_mensalidade2 || null,
      professor3_id || null, modalidade3 || null, horario3_id || null, dias_escolhidos3 || null, valor_mensalidade3 || null,
      data_matricula || null, vencimento || null, status || 'ativo', observacoes || null
    ]);

    res.json({ id: resultado.rows[0].id });
  } catch(erro) {
    console.error('Erro ao cadastrar aluno:', erro.message);
    res.status(500).json({ erro: erro.message });
  }
});

app.put('/api/alunos/:id', async function(req, res) {
  try {
    const {
      nome, data_nascimento, cpf, telefone, unidade,
      rua, numero, bairro, cidade,
      nome_responsavel, contato_responsavel,
      professor_id, modalidade, horario_id, dias_escolhidos, valor_mensalidade,
      professor2_id, modalidade2, horario2_id, dias_escolhidos2, valor_mensalidade2,
      professor3_id, modalidade3, horario3_id, dias_escolhidos3, valor_mensalidade3,
      data_matricula, vencimento, status, observacoes
    } = req.body;

    await pool.query(`
      UPDATE alunos SET
        nome=$1, data_nascimento=$2, cpf=$3, telefone=$4, unidade=$5,
        rua=$6, numero=$7, bairro=$8, cidade=$9,
        nome_responsavel=$10, contato_responsavel=$11,
        professor_id=$12, modalidade=$13, horario_id=$14, dias_escolhidos=$15, valor_mensalidade=$16,
        professor2_id=$17, modalidade2=$18, horario2_id=$19, dias_escolhidos2=$20, valor_mensalidade2=$21,
        professor3_id=$22, modalidade3=$23, horario3_id=$24, dias_escolhidos3=$25, valor_mensalidade3=$26,
        data_matricula=$27, vencimento=$28, status=$29, observacoes=$30
      WHERE id=$31
    `, [
      nome, data_nascimento || null, cpf || null, telefone || null, unidade,
      rua || null, numero || null, bairro || null, cidade || null,
      nome_responsavel || null, contato_responsavel || null,
      professor_id || null, modalidade || null, horario_id || null, dias_escolhidos || null, valor_mensalidade || null,
      professor2_id || null, modalidade2 || null, horario2_id || null, dias_escolhidos2 || null, valor_mensalidade2 || null,
      professor3_id || null, modalidade3 || null, horario3_id || null, dias_escolhidos3 || null, valor_mensalidade3 || null,
      data_matricula || null, vencimento || null, status || 'ativo', observacoes || null,
      req.params.id
    ]);

    res.json({ ok: true });
  } catch(erro) {
    console.error('Erro ao atualizar aluno:', erro.message);
    res.status(500).json({ erro: erro.message });
  }
});

app.delete('/api/alunos/:id', async function(req, res) {
  await pool.query('DELETE FROM alunos WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

// ================================
// PAGAMENTOS
// ================================

app.get('/api/pagamentos', async function(req, res) {
  const { mes, ano } = req.query;
  const resultado = await pool.query(`
    SELECT p.*, a.vencimento, a.valor_mensalidade, a.modalidade,
           a.nome, a.unidade, pr.nome AS professor
    FROM pagamentos p
    JOIN alunos a ON p.aluno_id = a.id
    LEFT JOIN professores pr ON a.professor_id = pr.id
    WHERE p.mes = $1 AND p.ano = $2
    ORDER BY a.vencimento, a.nome
  `, [mes, ano]);
  res.json(resultado.rows);
});

app.post('/api/pagamentos/gerar', async function(req, res) {
  const { mes, ano } = req.body;
  const alunos = await pool.query("SELECT * FROM alunos WHERE status = 'ativo'");

  for (const a of alunos.rows) {
    await pool.query(`
      INSERT INTO pagamentos (aluno_id, mes, ano, status)
      VALUES ($1, $2, $3, 'pendente')
      ON CONFLICT (aluno_id, mes, ano) DO NOTHING
    `, [a.id, mes, ano]);
  }

  const resultado = await pool.query(`
    SELECT p.*, a.vencimento, a.valor_mensalidade, a.modalidade,
           a.nome, a.unidade, pr.nome AS professor
    FROM pagamentos p
    JOIN alunos a ON p.aluno_id = a.id
    LEFT JOIN professores pr ON a.professor_id = pr.id
    WHERE p.mes = $1 AND p.ano = $2
    ORDER BY a.vencimento, a.nome
  `, [mes, ano]);

  res.json(resultado.rows);
});

app.put('/api/pagamentos/:id', async function(req, res) {
  const { status, data_pagamento } = req.body;
  await pool.query(
    'UPDATE pagamentos SET status=$1, data_pagamento=$2 WHERE id=$3',
    [status, data_pagamento, req.params.id]
  );
  res.json({ ok: true });
});

// ================================
// EVENTOS
// ================================

app.get('/api/eventos', async function(req, res) {
  const resultado = await pool.query('SELECT * FROM eventos ORDER BY data');
  res.json(resultado.rows);
});

app.post('/api/eventos', async function(req, res) {
  const { titulo, data, descricao, unidade } = req.body;
  const resultado = await pool.query(
    'INSERT INTO eventos (titulo, data, descricao, unidade) VALUES ($1, $2, $3, $4) RETURNING id',
    [titulo, data, descricao, unidade]
  );
  res.json({ id: resultado.rows[0].id });
});

app.put('/api/eventos/:id', async function(req, res) {
  const { titulo, data, descricao, unidade } = req.body;
  await pool.query(
    'UPDATE eventos SET titulo=$1, data=$2, descricao=$3, unidade=$4 WHERE id=$5',
    [titulo, data, descricao, unidade, req.params.id]
  );
  res.json({ ok: true });
});

app.delete('/api/eventos/:id', async function(req, res) {
  await pool.query('DELETE FROM eventos WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

// ================================
// LISTA DE ESPERA
// ================================

app.get('/api/espera', async function(req, res) {
  const resultado = await pool.query('SELECT * FROM lista_espera ORDER BY data_cadastro, nome');
  res.json(resultado.rows);
});

app.post('/api/espera', async function(req, res) {
  const { nome, nome_responsavel, idade, modalidade, turma, contato, observacao } = req.body;
  const resultado = await pool.query(
    'INSERT INTO lista_espera (nome, nome_responsavel, idade, modalidade, turma, contato, observacao) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
    [nome, nome_responsavel, idade, modalidade, turma, contato, observacao]
  );
  res.json({ id: resultado.rows[0].id });
});

app.put('/api/espera/:id', async function(req, res) {
  const { nome, nome_responsavel, idade, modalidade, turma, contato, observacao } = req.body;
  await pool.query(
    'UPDATE lista_espera SET nome=$1, nome_responsavel=$2, idade=$3, modalidade=$4, turma=$5, contato=$6, observacao=$7 WHERE id=$8',
    [nome, nome_responsavel, idade, modalidade, turma, contato, observacao, req.params.id]
  );
  res.json({ ok: true });
});

app.delete('/api/espera/:id', async function(req, res) {
  await pool.query('DELETE FROM lista_espera WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

// ================================
// AUTENTICAÇÃO
// ================================

// Login
app.post('/api/login', async function(req, res) {
  const { usuario, senha } = req.body;

  // Verifica se é admin
  const admin = await pool.query('SELECT * FROM admins WHERE usuario = $1', [usuario]);
  if (admin.rows.length > 0) {
    const senhaCorreta = senha === admin.rows[0].senha;
    if (!senhaCorreta) return res.status(401).json({ erro: 'Senha incorreta' });

    const token = jwt.sign(
      { id: admin.rows[0].id, usuario, perfil: 'admin', nome: admin.rows[0].nome },
      JWT_SECRET,
      { expiresIn: '12h' }
    );
    return res.json({ token, perfil: 'admin', nome: admin.rows[0].nome });
  }

  // Verifica se é professor
  const professor = await pool.query('SELECT * FROM professores WHERE usuario = $1', [usuario]);
  if (professor.rows.length === 0) return res.status(401).json({ erro: 'Usuário não encontrado' });

  const senhaCorreta = senha === professor.rows[0].senha;
  if (!senhaCorreta) return res.status(401).json({ erro: 'Senha incorreta' });

  const token = jwt.sign(
  { id: professor.rows[0].id, usuario, perfil: 'professor', nome: professor.rows[0].nome },
  JWT_SECRET,
  { expiresIn: '12h' }
);

res.json({
  token,
  perfil: 'professor',
  nome: professor.rows[0].nome,
  professorId: professor.rows[0].id
});

});

// Middleware de autenticação
function autenticar(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ erro: 'Token não fornecido' });

  jwt.verify(token, JWT_SECRET, function(err, usuario) {
    if (err) return res.status(403).json({ erro: 'Token inválido' });
    req.usuario = usuario;
    next();
  });
}

// Middleware apenas para admin
function apenasAdmin(req, res, next) {
  if (req.usuario.perfil !== 'admin') {
    return res.status(403).json({ erro: 'Acesso restrito ao administrador' });
  }
  next();
}

// Verificar token
app.get('/api/verificar', autenticar, function(req, res) {
  res.json({ valido: true, usuario: req.usuario });
});

// ================================
// SERVIDOR
// ================================

const PORTA = process.env.PORT || 3000;
app.listen(PORTA, async function() {
  await iniciarBanco();
  console.log('Servidor rodando na porta ' + PORTA);
});
