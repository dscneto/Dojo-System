# Dojo System

Sistema de gestão para academia de artes marciais.

-----

## Tecnologias

|Camada        |Tecnologia                              |
|--------------|----------------------------------------|
|Frontend      |HTML, CSS, JavaScript puro              |
|Backend       |Node.js + Express                       |
|Banco de dados|PostgreSQL (Neon)                       |
|Hospedagem    |Render                                  |
|Ícones        |Phosphor Icons                          |
|Fontes        |Barlow + Barlow Condensed (Google Fonts)|

-----

## Estrutura do Projeto

```
dojo-system/
├── public/
│   ├── index.html          ← estrutura base + sidebar
│   ├── login.html          ← página de login
│   ├── style.css           ← estilos globais
│   ├── favicon.svg
│   ├── js/
│   │   ├── utils.js        ← autenticação, tema, utilitários
│   │   └── nav.js          ← navegação entre páginas
│   └── pages/
│       ├── dashboard/
│       ├── experimentais/
│       ├── lista/
│       ├── matriculas/
│       ├── matriculados/
│       ├── mensalidades/
│       ├── professores/
│       ├── eventos/
│       ├── aniversarios/
│       └── espera/
├── server.js               ← servidor Express + rotas da API
├── package.json
└── .gitignore
```

Cada página tem seus próprios arquivos `.html`, `.css` e `.js`, carregados dinamicamente pelo `nav.js`.

-----

## Banco de Dados

### Tabelas

|Tabela        |Descrição                                    |
|--------------|---------------------------------------------|
|`admins`      |Administradores do sistema                   |
|`professores` |Cadastro de professores com usuário e senha  |
|`horarios`    |Horários disponíveis por unidade e modalidade|
|`aulas`       |Aulas experimentais agendadas                |
|`alunos`      |Alunos matriculados (tabela unificada)       |
|`pagamentos`  |Controle de mensalidades por mês             |
|`eventos`     |Eventos e acontecimentos do CT               |
|`lista_espera`|Alunos aguardando vaga em turmas             |

### Unidades

- Candeias
- Brasil

### Modalidades

- Jiu-Jitsu
- Muay Thai
- Karatê
- Ninjutsu
- Krav Maga

-----

## Funcionalidades Implementadas

### Autenticação

- Login com usuário e senha
- Dois perfis: **Administrador** e **Professor**
- Token JWT com expiração de 12 horas
- Redirecionamento automático para login se não autenticado
- Professor vê apenas seus próprios alunos e agendamentos

### Dashboard

- Cards de métricas (total de aulas, próximas 7 dias, professores ativos)
- Calendário mensal dinâmico com aulas experimentais
- Lista de próximas aulas experimentais

### Aulas Experimentais

- Cadastro de aulas experimentais
- Edição e exclusão
- Calendário e lista de agendamentos
- Filtros por modalidade, professor e unidade

### Matrículas

- Cadastro completo de alunos com:
  - Dados pessoais (nome, CPF, data de nascimento, telefone)
  - Endereço (rua, número, bairro, cidade)
  - Dados do responsável
  - Modalidade, professor, horário e dias de treino
  - Valor e dia de vencimento da mensalidade
- Edição e exclusão
- Filtros por modalidade, professor, unidade e status

### Mensalidades

- Calendário mensal com vencimentos
- Lista de pagamentos com status (pago/pendente)
- Marcar mensalidade como paga ou pendente
- Navegação entre meses
- Filtros por unidade, modalidade e status

### Professores

- Cadastro com nome, telefone, data de nascimento, unidades e modalidades
- Criação de usuário e senha para acesso ao sistema
- Edição e exclusão

### Eventos

- Cadastro de eventos do CT com título, data, descrição e unidade
- Edição e exclusão

### Aniversários

- Lista de aniversários de alunos e professores
- Esquema de cores por tipo (professor/aluno) e modalidade
- Destaque para aniversários do dia e do mês atual
- Filtros por mês, tipo e modalidade

### Lista de Espera

- Cadastro de alunos aguardando vaga
- Campos: nome, idade, responsável, contato, modalidade e turma de interesse
- Edição e exclusão
- Filtros por modalidade

### Interface

- Tema claro/escuro com toggle na sidebar
- Navegação dinâmica sem reload da página
- URL salva a página atual (persiste ao atualizar)
- Loading entre navegações
- Layout responsivo para mobile e tablet
- Ícones Phosphor Icons na sidebar

-----

## API — Rotas Disponíveis

### Autenticação

|Método|Rota            |Descrição                |
|------|----------------|-------------------------|
|POST  |`/api/login`    |Login com usuário e senha|
|GET   |`/api/verificar`|Verifica token JWT       |

### Professores

|Método|Rota                  |Descrição                 |
|------|----------------------|--------------------------|
|GET   |`/api/professores`    |Lista todos os professores|
|POST  |`/api/professores`    |Cadastra professor        |
|PUT   |`/api/professores/:id`|Atualiza professor        |
|DELETE|`/api/professores/:id`|Remove professor          |

### Aulas Experimentais

|Método|Rota            |Descrição                                                    |
|------|----------------|-------------------------------------------------------------|
|GET   |`/api/aulas`    |Lista aulas (filtrado por professor se logado como professor)|
|POST  |`/api/aulas`    |Cadastra aula                                                |
|PUT   |`/api/aulas/:id`|Atualiza aula                                                |
|DELETE|`/api/aulas/:id`|Remove aula                                                  |

### Alunos

|Método|Rota             |Descrição                                                     |
|------|-----------------|--------------------------------------------------------------|
|GET   |`/api/alunos`    |Lista alunos (filtrado por professor se logado como professor)|
|GET   |`/api/alunos/:id`|Busca aluno por ID                                            |
|POST  |`/api/alunos`    |Cadastra aluno                                                |
|PUT   |`/api/alunos/:id`|Atualiza aluno                                                |
|DELETE|`/api/alunos/:id`|Remove aluno                                                  |

### Horários

|Método|Rota                                |Descrição                              |
|------|------------------------------------|---------------------------------------|
|GET   |`/api/horarios?unidade=&modalidade=`|Busca horários por unidade e modalidade|

### Pagamentos

|Método|Rota                       |Descrição                                |
|------|---------------------------|-----------------------------------------|
|GET   |`/api/pagamentos?mes=&ano=`|Lista pagamentos do mês                  |
|POST  |`/api/pagamentos/gerar`    |Gera pagamentos do mês para alunos ativos|
|PUT   |`/api/pagamentos/:id`      |Atualiza status do pagamento             |

### Eventos

|Método|Rota              |Descrição             |
|------|------------------|----------------------|
|GET   |`/api/eventos`    |Lista todos os eventos|
|POST  |`/api/eventos`    |Cadastra evento       |
|PUT   |`/api/eventos/:id`|Atualiza evento       |
|DELETE|`/api/eventos/:id`|Remove evento         |

### Lista de Espera

|Método|Rota             |Descrição                 |
|------|-----------------|--------------------------|
|GET   |`/api/espera`    |Lista alunos em espera    |
|POST  |`/api/espera`    |Adiciona à lista de espera|
|PUT   |`/api/espera/:id`|Atualiza registro         |
|DELETE|`/api/espera/:id`|Remove da lista           |

-----

## Variáveis de Ambiente

Configure no Render:

```
DATABASE_URL=postgresql://...   ← string de conexão do Neon
JWT_SECRET=sua-chave-secreta    ← chave para assinar tokens JWT
```

-----

## Deploy

O sistema faz deploy automático a cada `git push` para a branch `main`.

```bash
# Subir alterações
git add .
git commit -m "descrição da alteração"
git push
```

-----

## Pendências e Melhorias Futuras

- [ ] Corrigir carregamento de professores no formulário de matrículas
- [ ] Restrições de acesso por perfil nas rotas da API
- [ ] Dashboard com card de total de matriculados e mensalidades vencendo
- [ ] Config.js para facilitar duplicação do sistema para outras academias
- [ ] Melhorar ícones e identidade visual dos botões nas páginas
- [ ] Revisão completa do responsivo mobile
- [ ] Calendário com detalhes ao clicar no dia
- [ ] Módulo financeiro completo

-----

## Acesso ao Sistema

- **URL:** `https://dojo-system.onrender.com`
- **Admin:** usuário `admin` + senha definida no banco
- **Professores:** usuário e senha cadastrados pelo administrador na página de Professores

> ⚠️ O Render no plano gratuito pode demorar até 60 segundos no primeiro acesso do dia (servidor em modo sleep).