// ================================
// AUTENTICAÇÃO
// ================================
(function() {
  const token = localStorage.getItem('token');
  if (!token && !window.location.pathname.includes('login')) {
    window.location.href = '/login.html';
    return;
  }

  const temaSalvo = localStorage.getItem('tema');
  if (temaSalvo === 'escuro') {
    document.body.setAttribute('data-tema', 'escuro');
  }
})();

// Intercepta todas as requisições adicionando o token
const _fetch = window.fetch;
window.fetch = function(url, options) {
  options = options || {};
  options.headers = options.headers || {};
  const token = localStorage.getItem('token');
  if (token) options.headers['Authorization'] = 'Bearer ' + token;
  return _fetch(url, options).then(function(resp) {
    // Token expirado — redireciona para login
    if (resp.status === 401 || resp.status === 403) {
      localStorage.clear();
      window.location.href = '/login.html';
    }
    return resp;
  });
};

// ================================
// PERFIL E SIDEBAR
// ================================

function getPerfil() {
  return localStorage.getItem('perfil') || 'professor';
}

function getNome() {
  return localStorage.getItem('nome') || '';
}

function getProfessorId() {
  return localStorage.getItem('professorId') || null;
}

// Itens visíveis por perfil
const acessoAdmin = [
  'dashboard', 'lista', 'experimentais',
  'matriculados', 'matriculas', 'mensalidades',
  'professores', 'eventos', 'aniversarios', 'espera'
];

const acessoProfessor = [
  'dashboard', 'lista', 'matriculados', 'mensalidades', 'aniversarios'
];

function configurarSidebar() {
  const perfil = getPerfil();
  const nome   = getNome();
  const acesso = perfil === 'admin' ? acessoAdmin : acessoProfessor;

  // Preenche nome e perfil
  const elNome   = document.getElementById('usuario-nome');
  const elPerfil = document.getElementById('usuario-perfil');
  if (elNome)   elNome.textContent   = nome;
  if (elPerfil) elPerfil.textContent = perfil === 'admin' ? 'Administrador' : 'Professor';

  // Esconde itens sem acesso
  document.querySelectorAll('.nav-item[data-page]').forEach(function(item) {
    const pagina = item.getAttribute('data-page');
    if (!acesso.includes(pagina)) {
      item.style.display = 'none';
    }
  });

  // Esconde grupos vazios
  document.querySelectorAll('.nav-grupo').forEach(function(grupo) {
    const visíveis = grupo.querySelectorAll('.nav-item:not([style*="none"])');
    if (visíveis.length === 0) {
      grupo.style.display = 'none';
    }
  });
}

// ================================
// TEMA
// ================================

function alternarTema() {
  const atual = document.body.getAttribute('data-tema');
  if (atual === 'escuro') {
    document.body.removeAttribute('data-tema');
    document.getElementById('tema-label').textContent = 'Tema Claro';
    document.getElementById('tema-icone').className   = 'ph ph-sun';
    localStorage.setItem('tema', 'claro');
  } else {
    document.body.setAttribute('data-tema', 'escuro');
    document.getElementById('tema-label').textContent = 'Tema Escuro';
    document.getElementById('tema-icone').className   = 'ph ph-moon';
    localStorage.setItem('tema', 'escuro');
  }
}

// ================================
// LOGOUT
// ================================

function logout() {
  localStorage.clear();
  window.location.href = '/login.html';
}

// ================================
// UTILITÁRIOS
// ================================

function classeModalidade(modalidade) {
  const mapa = {
    'Jiu-Jitsu': 'evento-bjj',
    'Muay Thai':  'evento-mt',
    'Karatê':     'evento-kt',
    'Ninjutsu':   'evento-nj',
    'Krav Maga':  'evento-kv'
  };
  return mapa[modalidade] || 'evento-bjj';
}

async function buscarAulas() {
  const resposta = await fetch('/api/aulas');
  return await resposta.json();
}

// Configura sidebar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
  configurarSidebar();
});