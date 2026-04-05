# Relatório detalhado do backend — PAPSE

Data: 03/02/2026

---

Índice

- Resumo executivo
- Tecnologias e dependências
- Organização de pastas e arquivos
- Arquitetura e fluxo (Controller → Service → Prisma)
- Banco de dados (Prisma schema, relações, migrations)
- Rotas e endpoints (lista completa)
- Descrição detalhada por arquivo (controllers, services, routes, middlewares, lib)
- Infraestrutura / Docker / execução
- Observações, problemas detectados e recomendações
- Como rodar localmente (comandos)
- Próximos passos sugeridos

---

**Resumo executivo**

O backend do projeto PAPSE é uma API REST escrita em TypeScript sobre Node.js/Express, usando Prisma como ORM e MySQL como banco de dados. Implementa autenticação via JWT, hashing de senha com bcryptjs, e segue um padrão em camadas: rotas -> controllers -> services -> prisma client. O projeto é containerizado com Docker/Docker Compose.

---

**1. Tecnologias e dependências (principais)**

- Node.js (imagem `node:18-alpine` no Dockerfile)
- TypeScript (compilação via `tsc`)
- Express 5 — servidor HTTP
- Prisma ORM (`prisma` dev, `@prisma/client` runtime)
- MySQL (imagem `mysql:8.0` no docker-compose)
- Autenticação: `jsonwebtoken` (JWT)
- Hash de senhas: `bcryptjs`
- CORS: `cors`
- Ferramentas dev: `tsx`, `ts-node`, `typescript`

Observação: `react-hook-form` aparece em `package.json` mas é uma dependência de frontend — provavelmente adicionada por engano ao backend.

---

**2. Organização de pastas e arquivos (estrutura relevante)**

- `Backend_Papse/`
  - `package.json`, `tsconfig.json`, `Dockerfile`, `docker-compose.yml`, `README.md`
  - `prisma/`
    - `schema.prisma`, `seed.ts`, `migrations/` (diversas pastas SQL)
  - `src/`
    - `server.ts` (entrypoint)
    - `lib/prisma.ts` (singleton Prisma)
    - `@types/espress/index.d.ts` (declaração para `req.user`)
    - `middlewares/` (`auth.middleware.ts`, `checkRole.middleware.ts`)
    - `routes/` (cada entidade tem `*.routes.ts`)
    - `controllers/` (cada entidade tem `*.controller.ts`)
    - `services/` (cada entidade tem `*.service.ts`)
    - `generated/prisma/` (artefatos gerados do client Prisma)
    - arquivos utilitários: `debug_check.ts`, `debug_output.json`

---

**3. Arquitetura e fluxo**

- Padrão adotado: REST API com separação de responsabilidades
  - Rotas (`src/routes/*`) apenas registram endpoints e middlewares
  - Controllers (`src/controllers/*`) tratam `Request`/`Response`, validações superficiais e delegam a serviços
  - Services (`src/services/*`) implementam a lógica de negócios e interagem com o banco via Prisma
  - `src/lib/prisma.ts` exporta um singleton `prisma` para evitar múltiplas conexões durante hot-reload
- Uso intensivo de `prisma.$transaction` para operações que envolvem múltiplos passos atômicos (ex.: criar paciente + inserir na lista de espera; mover de lista de espera para regular; deletar protocolo e criar histórico)

---

**4. Banco de dados (Prisma schema)**n
Resumo do `prisma/schema.prisma`:

- Provedor: `mysql` (env `DATABASE_URL`)
- Enum: `Role { ADMIN, BOLSISTA }`
- Models:
  - `Paciente`: id, nome, matricula, data_nascimento, telefone?, data_inscricao, relato?, curso?; relações com `ListaEspera`, `ListaRegular`, `Protocolo`, `Regular`, `Historico`, `RelatorioEvolutivo`.
  - `Colaborador`: idBolsista, nome, matricula (unique), data_admissao, data_saida?, senha (hash), role (default BOLSISTA); relações com `ListaRegular`, `Protocolo`, `Regular`, `Historico`, `RelatorioEvolutivo`.
  - `ListaEspera`: idListaEspera, idPaciente (relation)
  - `ListaRegular`: idListaRegular, idPaciente, idBolsista (relation)
  - `Protocolo`: idProtocolo, data_inicio_atendimento, qtde_sessoes, idPaciente, idBolsista
  - `Regular`: idRegular, data_inicio_atendimento, qtde_sessoes, idPaciente, idBolsista
  - `Historico`: idHistorico, data_desligamento?, idPaciente, id_ultimo_bolsista
  - `RelatorioEvolutivo`: idRelatorio, texto, data_criacao (default now()), idPaciente, idBolsista
- Observações: chaves autoincrementais, `onDelete: Cascade` em relações, `binaryTargets` no generator para compatibilidade com Alpine / musl.
- Migrations: pasta `prisma/migrations` com várias migrações históricas (ex.: `init_schema`, `add_auth_to_colaborador`, `add_realocado_field`, etc.)
- Seed: `prisma/seed.ts` cria vários `Paciente` e distribui em filas (lista de espera, lista regular, protocolo, regular, histórico), requer existência de `colaborador` bolsistas (seed de usuários esperado antes).

---

**5. Rotas e endpoints (resumo)**
Todas as rotas são prefixadas com `/api` em `server.ts`.

- `POST /api/login` — autenticação (sem middleware)
- `POST /api/colaboradores` — criar colaborador (middleware comentado; idealmente `ADMIN`)
- `GET /api/colaboradores` — listar (middleware comentado)
- `GET /api/colaboradores/:id` — buscar (ADMIN)
- `PUT /api/colaboradores/:id` — atualizar (ADMIN)
- `DELETE /api/colaboradores/:id` — excluir (ADMIN)

- `POST /api/pacientes` — criar paciente (adiciona automaticamente à `ListaEspera` via transação)
- `GET /api/pacientes` — listar (ADMIN)
- `GET /api/pacientes/:id` — buscar (ADMIN)
- `PUT /api/pacientes/:id` — atualizar (ADMIN)
- `DELETE /api/pacientes/:id` — excluir (ADMIN)

- `POST /api/protocolos` — criar protocolo (ADMIN)
- `GET /api/protocolos` — listar (ADMIN | BOLSISTA)
- `GET /api/protocolos/:id` — buscar (ADMIN | BOLSISTA)
- `PUT /api/protocolos/:id` — atualizar (ADMIN)
- `DELETE /api/protocolos/:id` — deletar e arquivar em `Historico` (ADMIN)

- `POST /api/listaespera`, `GET /api/listaespera`, `GET /api/listaespera/:id`, `DELETE /api/listaespera/:id` (ADMIN)
- `POST /api/listaregular`, `GET /api/listaregular`, `GET /api/listaregular/:id`, `DELETE /api/listaregular/:id` (ADMIN | BOLSISTA para listagem específica)
- `POST /api/regular`, `GET /api/regular`, `GET /api/regular/:id`, `PUT /api/regular/:id`, `DELETE /api/regular/:id` (ADMIN | BOLSISTA onde aplicável)
- `POST /api/historico`, `GET /api/historico`, `GET /api/historico/:id`, `DELETE /api/historico/:id` (ADMIN)
- `POST /api/relatorios` — cria relatório evolutivo
- `GET /api/relatorios/:idPaciente` — pega relatórios do paciente

---

**6. Descrição detalhada por arquivo (principais)**
A seguir descrição concisa de responsabilidade e lógica de cada arquivo principal (caminhos relativos ao `Backend_Papse`):

- `src/server.ts`
  - Registro do Express, CORS, parsing JSON, e montagem das rotas sob `/api`. Rota raiz `GET /` retorna health-check. Escuta porta `process.env.PORT || 3000`.

- `src/lib/prisma.ts`
  - Exporta um singleton `prisma` (instância de `PrismaClient`) para evitar múltiplas conexões durante hot-reload. Configurado para log de queries.

- `src/@types/espress/index.d.ts`
  - Declara `req.user` no namespace Express com `{ id: number; role: Role }` para tipagem em middlewares/controllers.

Middlewares:

- `src/middlewares/auth.middleware.ts`
  - Valida header `Authorization: Bearer <token>`, verifica token com `jsonwebtoken.verify`, obtém `id` e `role` do payload e popula `req.user`. Retorna 401/500 conforme o erro.
- `src/middlewares/checkRole.middleware.ts`
  - Factory que recebe `rolesPermitidos` (array) e compara com `req.user.role`, retornando 403 quando não autorizado.

Rotas (cada `*.routes.ts`):

- Responsável por expor endpoints e aplicar middlewares. Em alguns arquivos (ex.: `paciente.routes.ts`, `colaborador.routes.ts`) a autenticação está comentada (possivelmente para facilitar desenvolvimento). Arquivos: `auth.routes.ts`, `colaborador.routes.ts`, `paciente.routes.ts`, `protocolo.routes.ts`, `listaEspera.routes.ts`, `listaRegular.routes.ts`, `regular.routes.ts`, `historico.routes.ts`, `relatorio.routes.ts`.

Controllers: (padrão: tratar request/response, validar params mínimos e delegar para services)

- `src/controllers/auth.controller.ts` — `login` recebe `matricula` e `senha_`, chama `AuthService.login` e retorna `usuario` e `token`.
- `src/controllers/colaborador.controller.ts` — CRUD de `Colaborador` (create, findAll, findOne, update, delete). Converte `id` param para número e trata mensagens de erro específicas (404, 400, 500).
- `src/controllers/paciente.controller.ts` — CRUD para `Paciente`. `create` delega a `PacienteService` que também adiciona automaticamente à `ListaEspera`.
- `src/controllers/protocolo.controller.ts` — CRUD para `Protocolo`.
- `src/controllers/listaEspera.controller.ts` — manipula entradas da fila de espera.
- `src/controllers/listaRegular.controller.ts` — move paciente para lista regular e exibe entradas (filtra por `BOLSISTA` se aplicável).
- `src/controllers/regular.controller.ts` — manipula registros de atendimento regular.
- `src/controllers/historico.controller.ts` — CRUD de históricos.
- `src/controllers/relatorio.controller.ts` — endpoints para criar e obter relatórios evolutivos (usa `relatorio.service`).

Services: (a lógica de negócio e queries)

- `src/services/auth.service.ts` — busca `colaborador` por `matricula`, compara senha com `bcrypt.compare`, gera JWT com `JWT_SECRET` e devolve `usuario` (sem senha) + `token`.
- `src/services/colaborador.service.ts` — cria colaborador com hash de senha (`bcrypt.hash`), lida com `P2002` (matricula única), findAll, findOne (throw se não existe), update, delete.
- `src/services/paciente.service.ts` — `create` usa `prisma.$transaction` para criar paciente e também criar `listaEspera` para o paciente; findAll, findOne, update, delete com tratamento de erro.
- `src/services/protocolo.service.ts` — `create` verifica paciente e colaborador em transação, cria protocolo; `delete` faz arquivamento (cria `Historico`) em transação.
- `src/services/listaEspera.service.ts` — create/findAll/findOne/delete com `include` do `paciente` e ordenação.
- `src/services/listaRegular.service.ts` — `create` move paciente da lista de espera para lista regular (transação), valida colaborador; `findAll` filtra por `idBolsista` quando usuário for `BOLSISTA`; `delete` arquiva para `historico`.
- `src/services/regular.service.ts` — similarmente cria registro `regular` removendo entradas preexistentes de outras listas, `update` valida o `idBolsista` se alterado, `delete` arquiva no `historico`.
- `src/services/historico.service.ts` — create valida paciente/colaborador e cria registro de histórico, findAll/findOne/delete.
- `src/services/relatorio.service.ts` — fornece `createRelatorioService` e `getRelatoriosByPacienteService`. **Observação técnica:** este arquivo cria um novo `PrismaClient()` local ao invés de usar `src/lib/prisma.ts`, o que pode causar múltiplas conexões e inconsistência.

Arquivos auxiliares:

- `src/debug_check.ts` — script que gera `src/debug_output.json` com alguns dados (regulares, colaboradores) para debug.
- `src/debug_output.json` — resultado de execução de debug.

---

**7. Infraestrutura / Docker**

- `Dockerfile`:
  - Base: `node:18-alpine`.
  - Instala `openssl` via `apk`, copia `package*.json`, roda `npm install`, copia código, roda `npx prisma generate`, `npm run build` e no final `CMD ["npm","run","dev"]` (nota: image roda `dev` por padrão — watch/hot reload — não ideal para produção).
- `docker-compose.yml`:
  - Serviço `app` (container `api-papse`) build local, expõe `3001:3000`, passa `DATABASE_URL` apontando para `db:3306/papse_db` e `JWT_SECRET`, volume mount do código e node_modules.
  - Serviço `db` (container `mysql-db`) com `mysql:8.0`, expõe `3307:3306`, variáveis `MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`, volume `mysql-data` persistente.

---

**8. Observações, problemas detectados e recomendações**

1. Inconsistência Prisma:
   - `relatorio.service.ts` instancia `new PrismaClient()` em vez de usar o `prisma` exportado por `src/lib/prisma.ts`. Recomenda-se substituir para evitar múltiplas conexões.
2. Segurança / middlewares comentados:
   - Em `paciente.routes.ts` e `colaborador.routes.ts` diversos middlewares de auth/checkRole estão comentados — importante habilitar em produção.
3. Dockerfile finalizando em `npm run dev`:
   - Para imagem de produção, usar `npm run build` e `npm start` (rodar `dist/server.js`). O comando atual deixa a imagem em modo dev/watch.
4. Variância de portas:
   - `docker-compose.yml` mapeia `3001:3000` para a app; o README menciona `localhost:3000` como endpoint — alinhar documentação e compose.
5. Tratamento de datas e timezone:
   - Serviços convertem strings para `new Date(...)` — garantir formato consistente no front-end e considerar timezone.
6. Tests:
   - Não há testes automatizados. Recomendo adicionar testes unitários/integrados (jest+supertest) para rotas críticas (auth, criar/arquivar protocolo).

---

**9. Como rodar localmente (resumo rápido)**
(assumindo Docker Desktop instalado)

```bash
# 1. Construir e subir containers (MySQL + API)
docker-compose up -d --build

# 2. Acessar logs da API
docker-compose logs -f app

# 3. Rodar seed (opcional) - dentro do container app ou localmente com TSX
# Exemplo local (requer deps):
npx prisma db push # ou rodar migrations
npm run prisma -- prisma db seed # se configurado ou executar tsx prisma/seed.ts
```

Endpoints ficam disponíveis em `http://localhost:3001` (conforme `docker-compose` mapeamento atual) — verificar `docker-compose.yml`.

---

**10. Próximos passos sugeridos**

- Corrigir `relatorio.service.ts` para usar `src/lib/prisma.ts`.
- Habilitar middlewares de autenticação nas rotas comentadas e testar roles (ADMIN vs BOLSISTA).
- Ajustar `Dockerfile` para `CMD` de produção; criar `Dockerfile.dev` se quiser modo watch.
- Adicionar testes automatizados (jest + supertest) para endpoints críticos.
- Revisar `package.json` se `react-hook-form` deve ser removido do backend.
- Validar e padronizar fuso horário e formato de datas entre front e back.

---

Arquivo gerado: [Backend_Papse/BACKEND_REPORT.md](Backend_Papse/BACKEND_REPORT.md)

Se quiser, eu posso:

- 1. Abrir um PR com a correção do `relatorio.service.ts` para usar o `prisma` singleton;
- 2. Ajustar o `Dockerfile` para modo produção;
- 3. Habilitar autenticação nas rotas comentadas e rodar testes manuais.

Qual próximo passo prefere que eu execute?
