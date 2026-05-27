let idMatriculaEditando = null;

async function carregarProfessores() {
  try {
    const resp = await fetch('/api/professores');
    const contentType = resp.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) return;

    const professores = await resp.json();

    [1, 2, 3].forEach(function(n) {
      const id     = n === 1 ? 'mat-professor' : 'mat-professor' + n;
      const select = document.getElementById(id);
      if (!select) return;
      select.innerHTML = '<option value="">Selecione o professor</option>';
      professores.forEach(function(p) {
        const option = document.createElement('option');
        option.value = p.id;
        option.textContent = p.nome;
        select.appendChild(option);
      });
    });
  } catch(erro) {
    console.error('Erro ao carregar professores:', erro.message);
  }
}

async function atualizarHorarios(num) {
  const sufixo     = num === 1 ? '' : String(num);
  const unidade    = document.getElementById('mat-unidade').value;
  const modalidade = document.getElementById('mat-modalidade' + sufixo).value;
  const container  = document.getElementById('container-horarios-' + num);

  if (!unidade || !modalidade) {
    container.innerHTML = '';
    return;
  }

  const resp    = await fetch('/api/horarios?unidade=' + unidade + '&modalidade=' + modalidade);
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
            <input type="checkbox" data-num="${num}" data-horario="${h.id}" value="${dia}"> ${dia}
          </label>
        `;
      }).join('');

      return `
        <div class="horario-opcao" data-num="${num}" data-horario-id="${h.id}">
          <div class="horario-titulo">${h.horario}h${turma}</div>
          <div class="horario-dias-label">Dias que irá treinar:</div>
          <div class="horario-checkboxes">${checkboxes}</div>
        </div>
      `;
    }).join('')}
  `;
}

function coletarHorario(num) {
  const opcoes = document.querySelectorAll('.horario-opcao[data-num="' + num + '"]');
  let horarioId     = null;
  let diasEscolhidos = null;

  opcoes.forEach(function(opcao) {
    const checkboxes = opcao.querySelectorAll('input[type="checkbox"]:checked');
    if (checkboxes.length > 0) {
      horarioId      = opcao.getAttribute('data-horario-id');
      diasEscolhidos = Array.from(checkboxes).map(function(cb) { return cb.value; }).join(',');
    }
  });

  return { horarioId, diasEscolhidos };
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
    document.getElementById('mat-valor').value        = a.valor_mensalidade || '';
    document.getElementById('mat-modalidade2').value  = a.modalidade2 || '';
    document.getElementById('mat-professor2').value   = a.professor2_id || '';
    document.getElementById('mat-valor2').value       = a.valor_mensalidade2 || '';
    document.getElementById('mat-modalidade3').value  = a.modalidade3 || '';
    document.getElementById('mat-professor3').value   = a.professor3_id || '';
    document.getElementById('mat-valor3').value       = a.valor_mensalidade3 || '';
    document.getElementById('mat-data').value         = a.data_matricula || '';
    document.getElementById('mat-vencimento').value   = a.vencimento || '';
    document.getElementById('mat-observacoes').value  = a.observacoes || '';

    document.getElementById('mat-titulo').textContent     = 'Editar Matrícula';
    document.getElementById('mat-btn-salvar').textContent = 'Salvar Alterações';

    if (a.unidade && a.modalidade)  await atualizarHorarios(1);
    if (a.unidade && a.modalidade2) await atualizarHorarios(2);
    if (a.unidade && a.modalidade3) await atualizarHorarios(3);

    window._matriculaEditando = null;
  }

  document.getElementById('form-matricula').addEventListener('submit', async function(evento) {
    evento.preventDefault();

    const h1 = coletarHorario(1);
    const h2 = coletarHorario(2);
    const h3 = coletarHorario(3);

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
      modalidade:          document.getElementById('mat-modalidade').value,
      professor_id:        document.getElementById('mat-professor').value || null,
      valor_mensalidade:   document.getElementById('mat-valor').value || null,
      horario_id:          h1.horarioId,
      dias_escolhidos:     h1.diasEscolhidos,
      modalidade2:         document.getElementById('mat-modalidade2').value || null,
      professor2_id:       document.getElementById('mat-professor2').value || null,
      valor_mensalidade2:  document.getElementById('mat-valor2').value || null,
      horario2_id:         h2.horarioId,
      dias_escolhidos2:    h2.diasEscolhidos,
      modalidade3:         document.getElementById('mat-modalidade3').value || null,
      professor3_id:       document.getElementById('mat-professor3').value || null,
      valor_mensalidade3:  document.getElementById('mat-valor3').value || null,
      horario3_id:         h3.horarioId,
      dias_escolhidos3:    h3.diasEscolhidos,
      data_matricula:      document.getElementById('mat-data').value,
      vencimento:          document.getElementById('mat-vencimento').value,
      observacoes:         document.getElementById('mat-observacoes').value,
      status:              'ativo'
    };

    try {
      if (idMatriculaEditando) {
        const res = await fetch('/api/alunos/' + idMatriculaEditando, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dados)
        });
        const json = await res.json();
        if (json.erro) { alert('Erro: ' + json.erro); return; }
        alert('Aluno atualizado com sucesso!');
        idMatriculaEditando = null;
      } else {
        const res  = await fetch('/api/alunos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dados)
        });
        const json = await res.json();
        if (!json.id) { alert('Erro ao cadastrar: ' + JSON.stringify(json)); return; }
        alert('Aluno matriculado com sucesso!');
      }

      navegarPara('matriculados');

    } catch (erro) {
      alert('Erro: ' + erro.message);
    }
  });
}

iniciarMatriculas();
