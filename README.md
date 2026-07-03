# PAPSE (Programa de Apoio Psicológico e Sócio-Educacional)

Sistema para gerenciamento de prontuários, atendimentos e filas de espera. Conta com controle rigoroso de vínculo paciente-bolsista e trilha de auditoria (LGPD).

## Requisitos

- Docker e Docker Compose instalados.

## Setup Local com Docker

1. **Configurar variáveis de ambiente:**
   Copie o arquivo de exemplo:
   ```bash
   cp .env.example .env
   ```
   Abra o `.env` e preencha com dados locais seguros. Para rodar com Docker Compose, deixe o `DATABASE_URL` apontando para o hostname `db` (como já vem no `.env.example`).

2. **Subir os containers:**
   Na raiz do projeto, execute:
   ```bash
   docker compose up -d --build
   ```
   *Isso subirá o banco (MySQL), a API Backend e o Frontend.*

3. **Rodar Migrations e Criar Admin:**
   Se for a primeira vez, crie as tabelas no banco de dados e insira o usuário admin:
   ```bash
   docker compose exec app npm run prisma:migrate
   docker compose exec app npm run seed:admin
   ```

## Acessando

- **Frontend:** [http://localhost:8080](http://localhost:8080)
- **Backend (API):** [http://localhost:3000/api](http://localhost:3000/api)
- **Healthcheck:** [http://localhost:3000/api/health](http://localhost:3000/api/health)

## Logs úteis

Você pode inspecionar os logs de cada serviço com:
```bash
docker compose logs -f app
docker compose logs -f frontend
docker compose logs -f db
```

## Parar Ambiente

Para desligar sem perder dados:
```bash
docker compose down
```
⚠️ **Atenção:** Evite usar `docker compose down -v` se não quiser perder os dados salvos do MySQL.

## Backup e Restore do Banco (Local)

Com o banco de dados rodando, para fazer um backup, utilize:
```bash
docker compose exec db mysqldump -u$MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE > backup_local.sql
```

Para restaurar um backup:
```bash
docker compose exec -T db mysql -u$MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE < backup_local.sql
```
*Atenção:* Nunca faça commit (adicione no Git) de arquivos de backup (`.sql`), pois eles contêm dados sensíveis. Recomendamos adicioná-los ao `.gitignore`.


