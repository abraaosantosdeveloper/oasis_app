# OASIS — Frontend

Interface front-end do OASIS, um rastreador de hábitos com diário e estatísticas.

## Visão geral

Este projeto contém a aplicação cliente construída com JavaScript (ES6), Fetch API e Chart.js. A interface consome a API do backend (Flask) para autenticação, gerenciamento de hábitos, categorias e registros do diário.

## Principais funcionalidades

- Autenticação: telas de login e cadastro integradas com a API.
- Gerenciamento de hábitos: criar/editar/excluir, marcar como concluído, configurar repetição (diário/semanal/mensal) e cálculo da próxima ocorrência.
- Diário: criar múltiplas entradas por dia; histórico ordenado por data de criação.
- Estatísticas: gráficos simples (Chart.js) e indicadores como streaks e taxa de conclusão.

## Tecnologias

- Vanilla JavaScript (ES6+)
- Fetch API
- Chart.js
- HTML / CSS

## Pré-requisitos

- Backend em execução (API Flask). Por padrão o backend roda em `http://127.0.0.1:5000`.

## Quick start (desenvolvimento)

1. Garanta que a API backend esteja rodando (veja o README do backend).
2. Abra `index.html` no navegador ou sirva a pasta com um servidor estático (ex.: `python -m http.server 8000`).
3. Faça login/registro e use a aplicação. O token JWT é salvo em `localStorage` como `oasis_token` e o usuário em `oasis_user`.

## Configuração (URL da API)

O frontend utiliza `http://127.0.0.1:5000/api` como base para chamadas. Para alterar, edite `api.js` e atualize a constante de baseURL.

## Arquivos principais

- `index.html` — entrada da aplicação.
- `app.js` — lógica principal: gerenciadores, estado e UI.
- `api.js` — chamadas HTTP ao backend.
- `auth.js` — helpers de autenticação (login/signup, token storage).
- `css/` ou `styles.css` — estilos.

## Integração com a API (resumo)

Principais endpoints consumidos pelo frontend:

- Autenticação: `POST /api/login`, `POST /api/signup`
- Usuários: `GET /api/users`
- Hábitos: `GET/POST/PUT/DELETE /api/habits` (rotas por usuário disponíveis)
- Categorias: `GET/POST/PUT/DELETE /api/categories`
- Diário: `GET/POST/PUT/DELETE /api/journal` (inclui busca por data — retorna lista de registros para a data)

Consulte o README do backend para exemplos de payloads e respostas.

## Observações sobre dados

Em ambiente de desenvolvimento, o backend persiste dados em arquivos JSON (por exemplo: `users.json`, `habitos.json`, `registros_diarios.json`). Faça backup antes de editar manualmente.

## Contribuição

1. Crie um branch para sua alteração.
2. Faça commits atômicos e descritivos.
3. Abra um pull request para revisão.

## Licença

Adicione aqui a informação de licença do projeto, se aplicável.

---

Para documentação detalhada da API e histórico de mudanças, consulte a pasta `docs_backup/` no repositório do backend.
