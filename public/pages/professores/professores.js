let todosProfessores = [];
let idProfessorEditando = null;

async function iniciarProfessores() {
  const resp = await fetch('/api/professores');
  todosProfessores = await resp.json();
  document.getElementById('prof-subtitulo').textContent =
    todosProfessores.length + ' professores cadastrados';
  renderizarProfessores(todosProfessores);
}

function renderizarProfessores(professores) {
  const tbody = document.getElementById('tbody-professores');

  if (professores.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:1.5rem; color:var(--cor-texto-fraco);">Nenhum professor cadastrado.</td></tr>';
    return;
  }

  tbody.innerHTML = professores.map(function(p) {
    const modalidades = p.modalidades ? p.modalidades.split(',').map(function(m) {
      return `<span class="modalidade-badge ${classeModalidade(m.trim())}">${m.trim()}</span>`;
    }).join('') : '—';

    const unidades = p.unidades ? p.unidades.split(',').join(', ') : '—';

    return `
      <tr>
        <td class="td-nome">${p.nome}</td>
        <td class="td-fraco">${p.telefone || '—'}</td>
        <td>${modalidades}</td>
        <td class="td-fraco">${unidades}</td>
        <td class="td-fraco">${p.usuario || '—'}</td>
        <td>
          <button class="btn-acao" onclick='editarProfessor(${JSON.stringify(p)})'>✎</button>
          <button class="btn-acao" onclick="deletarProfessor(${p.id})">✕</button>
        </td>
      </tr>
    `;
  }).join('');
}

function abrirFormProfessor() {
  idProfessorEditando = null;
  document.getElementById('form-professor').reset();
  document.getElementById('prof-form-titulo').textContent = '● Novo Professor';
  document.getElementById('prof-btn-salvar').textContent  = 'Cadastrar Professor';
  document.getElementById('modal-professor').style.display = 'block';
  document.getElementById('modal-professor').scrollIntoView({ behavior: 'smooth' });
}

function fecharFormProfessor() {
  document.getElementById('modal-professor').style.display = 'none';
  document.getElementById('form-professor').reset();
  idProfessorEditando = null;
}

function editarProfessor(professor) {
  idProfessorEditando = professor.id;

  document.getElementById('prof-nome').value       = professor.nome;
  document.getElementById('prof-telefone').value   = professor.telefone || '';
  document.getElementById('prof-nascimento').value = professor.data_nascimento || '';
  document.getElementById('prof-usuario').value    = professor.usuario || '';
  document.getElementById('prof-senha').value      = '';

  document.querySelectorAll('input[name="unidade"]').forEach(function(cb) {
    cb.checked = professor.unidades ? professor.unidades.includes(cb.value) : false;
  });

  document.querySelectorAll('input[name="modalidade"]').forEach(function(cb) {
    cb.checked = professor.modalidades ? professor.modalidades.includes(cb.value) : false;
  });

  document.getElementById('prof-form-titulo').textContent = '● Editar Professor';
  document.getElementById('prof-btn-salvar').textContent  = 'Salvar Alterações';
  document.getElementById('modal-professor').style.display = 'block';
  document.getElementById('modal-professor').scrollIntoView({ behavior: 'smooth' });
}

async function deletarProfessor(id) {
  const confirmar = confirm('Deseja remover este professor?');
  if (!confirmar) return;
  await fetch('/api/professores/' + id, { method: 'DELETE' });
  iniciarProfessores();
}

document.getElementById('form-professor').addEventListener('submit', async function(evento) {
  evento.preventDefault();

  const unidades = Array.from(document.querySelectorAll('input[name="unidade"]:checked'))
    .map(function(cb) { return cb.value; }).join(',');

  const modalidades = Array.from(document.querySelectorAll('input[name="modalidade"]:checked'))
    .map(function(cb) { return cb.value; }).join(',');

  const professor = {
    nome:            document.getElementById('prof-nome').value,
    telefone:        document.getElementById('prof-telefone').value,
    data_nascimento: document.getElementById('prof-nascimento').value,
    unidades:        unidades,
    modalidades:     modalidades,
    usuario:         document.getElementById('prof-usuario').value,
    senha:           document.getElementById('prof-senha').value
  };

  // Não envia senha vazia na edição
  if (idProfessorEditando && !professor.senha) {
    delete professor.senha;
  }

  if (idProfessorEditando) {
    await fetch('/api/professores/' + idProfessorEditando, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(professor)
    });
    alert('Professor atualizado com sucesso!');
  } else {
    await fetch('/api/professores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(professor)
    });
    alert('Professor cadastrado com sucesso!');
  }

  fecharFormProfessor();
  iniciarProfessores();
});

iniciarProfessores();