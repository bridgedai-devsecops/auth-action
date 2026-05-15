# BridgedAI Auth (`bridgedai-devsecops/auth-action`)

## What this action does

Exchanges a GitHub Actions OIDC token for a BridgedAI access token by calling `POST /api/v1/auth/github-oidc/exchange`.

## Why BridgedAI exists

BridgedAI connects CI/CD evidence (SBOMs, attestations, policy outcomes) into a continuous trust graph so organizations can enforce release safety beyond “green builds.”

## Quick start

```yaml
permissions:
  id-token: write
  contents: read

jobs:
  auth:
    runs-on: ubuntu-latest
    steps:
      - uses: bridgedai-devsecops/auth-action@v1
        id: bridgedai
        with:
          api-url: ${{ vars.BRIDGEDAI_API_URL }}
          tenant: ${{ vars.BRIDGEDAI_TENANT }}
          audience: ${{ vars.BRIDGEDAI_OIDC_AUDIENCE }}
          mode: production
```

## Enterprise setup

- Pin `bridgedai-devsecops/auth-action` to a full semver tag (for example `v1.0.0`) or a commit SHA.
- Store `api-url`, `tenant`, and `audience` as organization variables; avoid embedding tenant-specific URLs in reusable workflows unless scoped appropriately.

## Inputs

| Name | Required | Description |
| --- | --- | --- |
| `api-url` | Yes in `production` | BridgedAI API base URL (`https://…`). |
| `tenant` | Yes | Tenant identifier. |
| `audience` | Yes | OIDC audience for `core.getIDToken`. |
| `mode` | No | `production` (default) or explicit `mock` for tests only. |

## Outputs

| Name | Description |
| --- | --- |
| `access-token` | Bearer token (masked; never logged by this action). |
| `tenant-id` | Tenant id returned by BridgedAI. |
| `session-id` | Session id for correlation. |
| `expires-at` | Token expiry (ISO-8601). |

## Required permissions

- `id-token: write` (OIDC)
- `contents: read` (typical checkout usage)

## Required secrets / variables

- Organization or repository variables: `BRIDGEDAI_API_URL`, `BRIDGEDAI_TENANT`, `BRIDGEDAI_OIDC_AUDIENCE` (recommended).
- No static API keys are required for the OIDC exchange path (token is short-lived).

## Example workflows

See `examples/basic.yml` and `examples/enterprise.yml`.

## Failure modes

- Missing `api-url` in production mode.
- OIDC issuance failures (missing `id-token: write`, wrong audience).
- Non-2xx responses from BridgedAI (network, auth misconfiguration, unavailable backend).

## Security model

- Production mode performs a real OIDC exchange; tokens are masked with `core.setSecret`.
- Mock mode is explicit (`mode: mock`) and prints `MOCK MODE ENABLED`.

## Versioning policy

- semver tags `vMAJOR.MINOR.PATCH`
- moving tag `vMAJOR` updated by the release workflow

## Troubleshooting

- If OIDC fails, verify the workflow permissions block and that your GitHub org/app allows OIDC for the repository.
- If exchange fails, verify `api-url` points at a BridgedAI environment that exposes the documented endpoint.

## Support / contact

Use your BridgedAI support channel. For open-source collaboration, use your organization’s preferred intake process.

## Related ecosystem

This repository is part of the BridgedAI public GitHub Actions ecosystem. Internal engineering and submodule orchestration live in private `bridgedai/actions-*` control repositories.

