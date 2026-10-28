API for Benevolence Fund Application
===============================

## Background

This API supports payments made to authorize.net on behalf of members of Neema Gospel Church. The API is used by the [Benevolence UI](../benevolence-ui) application to facilitate payments to the benevolent fund. The UI for this application is a single page application that is hosted at the same location as the API.
The current host for this application is FastComet www.fastcomet.com

## Architecture
- Database - MySQL 8.0
- Backend - Node.js 24, Express
- UI - Angular 14
- Authorization - Auth0
- Payments - Authorize.Net

## Endpoints

| Path         | Auth                 | Purpose                                   |
| ------------ | -------------------- | ----------------------------------------- |
| `/health`    | none                 | Health check, returns `{"status":"online"}` |
| `/public/*`  | none                 | Public contribution routes                |
| `/secure/*`  | Auth0 JWT (Bearer)   | Customer profiles and member contributions |

## Configuration

The API reads its settings from environment variables, loaded from a `.env` file in the project root
via `dotenv`. Copy the example and fill in real values:

```bash
cp .env.example .env
```

| Variable           | Description                                                          |
| ------------------ | -------------------------------------------------------------------- |
| `PORT`             | Port to listen on (default `3000`)                                   |
| `API_LOGIN`        | Authorize.Net API login ID                                           |
| `TRANSACTION_KEY`  | Authorize.Net transaction key                                        |
| `API_ENVIRONMENT`  | Authorize.Net endpoint - production or sandbox (see `.env.example`) |
| `DB_HOST`          | MySQL host                                                           |
| `DB_PORT`          | MySQL port                                                           |
| `DB_DATABASE`      | Database name                                                        |
| `DB_USERNAME`      | Database user                                                        |
| `DB_PASSWORD`      | Database password                                                    |
| `JWKS_URI`         | Auth0 JWKS URL used to verify tokens                                 |
| `AUDIENCE`         | Auth0 API audience                                                   |
| `ISSUER`           | Auth0 issuer URL                                                     |
| `AUTH_NAMESPACE`   | Namespace of the custom claims in the Auth0 token                    |
| `ALLOWED_ORIGINS`  | Comma-separated origins allowed to call the API via CORS (default `http://localhost:4200`) |

`.env` holds secrets. It is git-ignored and excluded from the Docker image by `.dockerignore`, so never commit it.

## Development

### How to run the application

#### Stand alone (local)

Prerequisites:

- Node.js `>=20 <25`
- pnpm `>=11` - `npm install -g pnpm@11`
- A MySQL 8.0 database (the easiest option is the compose `db` service, see below)

1. Start MySQL. To use the containerised database only:

   ```bash
   docker compose up -d db
   ```

   It is published on `localhost:3307`. Point `.env` at it:

   ```bash
   DB_HOST=localhost
   DB_PORT=3307
   DB_DATABASE=benevolence
   DB_USERNAME=benevolence_admin
   DB_PASSWORD=benevolence_P@ssw0rd
   ```

2. Create the tables (first run only). The schema has no `USE` statement, so pass the database name:

   ```bash
   docker exec -i mysql_benevolence_db \
     mysql -ubenevolence_admin -p'benevolence_P@ssw0rd' benevolence < src/schema/benevolence.schema.sql
   ```

3. Install dependencies and start the API:

   ```bash
   pnpm install
   pnpm start        # nodemon, restarts on file changes
   # or: pnpm run debug  (nodemon with --inspect)
   ```

4. Check it is up: `curl http://localhost:3000/health`

#### Docker

`docker-compose.yml` starts the whole stack - MySQL, this API and the UI (built from `../benevolence-ui`):

```bash
docker compose up --build        # add -d to run in the background
```

| Service | Container               | URL / port               |
| ------- | ----------------------- | ------------------------ |
| UI      | `benevolence_ui`        | `http://localhost:4200`  |
| API     | `benevolence_api`       | `http://localhost:3000`  |
| MySQL   | `mysql_benevolence_db`  | `localhost:3307`         |

How configuration reaches the API container:

- Authorize.Net, Auth0 and other settings come from `.env` through `env_file` at runtime, so `.env`
  must exist before you run compose. It is not copied into the image.
- The `DB_*` values under `environment:` in `docker-compose.yml` override `.env`, so the API talks to
  the `db` container (`db:3306`) rather than `localhost:3307`.

Create the tables on the first run with the same command as step 2 above.

Useful commands:

```bash
docker compose up --build -d api   # rebuild and restart only the API
docker compose logs -f api         # follow API logs
docker compose down                # stop everything
docker compose down -v             # stop and delete the MySQL data volume
```

To build and run the API image on its own, against a database reachable from the container:

```bash
docker build -t benevolence-api .
docker run --rm -p 3000:3000 --env-file .env -e DB_HOST=host.docker.internal benevolence-api
```

## Running tests

```bash
pnpm test              # jest
pnpm run test:covci    # jest with coverage
```
