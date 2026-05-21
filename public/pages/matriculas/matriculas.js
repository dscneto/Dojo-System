let idMatriculaEditando = null;

async function carregarProfessores() {
  try {
    const resp = await fetch('/api/professores');
    const contentType = resp.headers.get('content-type');

    if (!contentType || !contentType.includes('application/json')) {
      console.error('Resposta não é JSON:', await resp.text());
      return;
    }

    const professores = await resp.json();
    const select = document.getElementById('mat-professor');
    if (!select) return;

    select.innerHTML = '<option value="">Selecione o professor</option>';
    professores.forEach(function(p) {
      const option = document.createElement('option');
      option.value = p.id;
      option.textContent = p.nome;
      select.appendChild(option);
    });
  } catch(erro) {
    console.error('Erro ao carregar professores:', erro.message);
  }
}

async function atualizarHorarios() {
  const unidade    = document.getElementById('mat-unidade').value;
  const modalidade = document.getElementById('mat-modalidade').value;
  const container  = document.getElementById('container-horarios');

  if (!unidade || !modalidade) {
    container.innerHTML = '';
    return;
  }

  const resp = await fetch('/api/horarios?unidade=' + unidade + '&modalidade=' + modalidade);
  const horarios = await resp.json();

  if (horarios.length === 0) {
    container.innerHTML = '<div style="color:var(--cor-texto-fraco); font-size:13px;">Nenhum horário disponível.</div>';
    return;
  }

  container.innerHTML = `
    <label class="form-label">Horário e dias de treino</label>
    ${horarios.map(function(h) {
      const dias  = h.dias.split(',');
      const turma = h.turma ? ' — ' + h.turma : '';

      const checkboxes = dias.map(function(dia) {
        return `
          <label>
            <input type="checkbox" name="dia_${h.id}" value="${dia}"> ${dia}
          </label>
        `;
      }).join('');

      return `
        <div class="horario-opcao">
          <div class="horario-titulo">${h.horario}h${turma}</div>
          <div class="horario-dias-label">Dias que irá treinar:</div>
          <div class="horario-checkboxes">${checkboxes}</div>
          <input type="hidden" name="horario_id" value="${h.id}">
        </div>
      `;
    }).join('')}
  `;
}

async function iniciarMatriculas() {
  await carregarProfessores();

  // Preenche formulário se vier de edição
  if (window._matriculaEditando) {
    const a = window._matriculaEditando;
    idMatriculaEditando = a.id;

    document.getElementById('mat-nome').value         = a.nome;
    document.getElementById('mat-nascimento').value   = a.data_nascimento || '';
    document.getElementById('mat-cpf').value          = a.cpf || '';
    document.getElementById('mat-telefone').value     = a.telefone || '';
    document.getElementById('mat-unidade').value      = a.unidade;
    document.getElementById('mat-rua').value          = a.rua || '';
    document.getElementById('mat-numero').value       = a.numero || '';
    document.getElementById('mat-bairro').value       = a.bairro || '';
    document.getElementById('mat-cidade').value       = a.cidade || '';
    document.getElementById('mat-resp-nome').value    = a.nome_responsavel || '';
    document.getElementById('mat-resp-contato').value = a.contato_responsavel || '';
    document.getElementById('mat-modalidade').value   = a.modalidade || '';
    document.getElementById('mat-professor').value    = a.professor_id || '';
    document.getElementById('mat-data').value         = a.data_matricula || '';
    document.getElementById('mat-vencimento').value   = a.vencimento || '';
    document.getElementById('mat-valor').value        = a.valor_mensalidade || '';
    document.getElementById('mat-observacoes').value  = a.observacoes || '';

    document.getElementById('mat-titulo').textContent     = 'Editar Matrícula';
    document.getElementById('mat-btn-salvar').textContent = 'Salvar Alterações';

    if (a.unidade && a.modalidade) await atualizarHorarios();
    window._matriculaEditando = null;
  }

  document.getElementById('form-matricula').addEventListener('submit', async function(evento) {
    evento.preventDefault();

    // Pega horário e dias selecionados
    const horarioInput = document.querySelector('input[name="horario_id"]:not([type="hidden"])') ||
                         document.querySelector('.horario-opcao input[name="horario_id"]');

    const opcoes = document.querySelectorAll('.horario-opcao');
    let horarioId     = null;
    let diasEscolhidos = null;

    opcoes.forEach(function(opcao) {
      const checkboxes = opcao.querySelectorAll('input[type="checkbox"]:checked');
      if (checkboxes.length > 0) {
        horarioId      = opcao.querySelector('input[name="horario_id"]').value;
        diasEscolhidos = Array.from(checkboxes).map(function(cb) { return cb.value; }).join(',');
      }
    });

    const dados = {
      nome:                document.getElementById('mat-nome').value,
      data_nascimento:     document.getElementById('mat-nascimento').value,
      cpf:                 document.getElementById('mat-cpf').value,
      telefone:            document.getElementById('mat-telefone').value,
      unidade:             document.getElementById('mat-unidade').value,
      rua:                 document.getElementById('mat-rua').value,
      numero:              document.getElementById('mat-numero').value,
      bairro:              document.getElementById('mat-bairro').value,
      cidade:              document.getElementById('mat-cidade').value,
      nome_responsavel:    document.getElementById('mat-resp-nome').value,
      contato_responsavel: document.getElementById('mat-resp-contato').value,
      professor_id:        document.getElementById('mat-professor').value || null,
      modalidade:          document.getElementById('mat-modalidade').value,
      data_matricula:      document.getElementById('mat-data').value,
      vencimento:          document.getElementById('mat-vencimento').value,
      valor_mensalidade:   document.getElementById('mat-valor').value,
      horario_id:          horarioId,
      dias_escolhidos:     diasEscolhidos,
      observacoes:         document.getElementById('mat-observacoes').value,
      status:              'ativo'
    };

    try {
      if (idMatriculaEditando) {
        await fetch('/api/alunos/' + idMatriculaEditando, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dados)
        });
        alert('Aluno atualizado com sucesso!');
        idMatriculaEditando = null;
      } else {
        const res  = await fetch('/api/alunos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dados)
        });
        const json = await res.json();
        if (!json.id) {
          alert('Erro ao cadastrar: ' + JSON.stringify(json));
          return;
        }
        alert('Aluno matriculado com sucesso!');
      }

      navegarPara('matriculados');

    } catch (erro) {
      alert('Erro: ' + erro.message);
    }
  });
}

iniciarMatriculas();