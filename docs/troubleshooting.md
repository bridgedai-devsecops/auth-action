# Troubleshooting

## OIDC: “Failed to obtain GitHub OIDC token”

- Confirm `permissions: id-token: write` exists at the workflow or job level.
- Confirm `audience` matches what your GitHub OIDC trust configuration expects.

## HTTP failures during exchange

- Validate TLS interception appliances are not rewriting BridgedAI traffic unexpectedly.
- Confirm the BridgedAI environment is reachable from GitHub-hosted runner networks (or your self-hosted egress policy).

## “api-url is required when mode=production”

- You are running `mode: production` (default) without `api-url`.
