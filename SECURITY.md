# Security Policy

## Reporting

Report vulnerabilities via GitHub Security Advisories — do not open public issues.

Key concerns for this service:
- `ORACLE_SECRET_KEY` must never appear in logs, responses, or error messages
- All user-provided addresses must be validated before use in contract calls
- Rate limiting is enforced on `/api/*` — do not remove or weaken it
- CORS origins are allowlisted — the wildcard `*` must not be used in production

## Scope

- REST API endpoints (`src/routes/`)
- Oracle scheduler (`src/oracle/`)
- Stellar client utilities (`src/stellar/`)

Out of scope: third-party sports data provider APIs.
