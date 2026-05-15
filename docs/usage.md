# Usage

See the repository `README.md` for end-to-end examples.

## Minimal production usage

```yaml
- uses: bridgedai-devsecops/auth-action@v1
  id: bridgedai
  with:
    api-url: ${{ vars.BRIDGEDAI_API_URL }}
    tenant: ${{ vars.BRIDGEDAI_TENANT }}
    audience: ${{ vars.BRIDGEDAI_OIDC_AUDIENCE }}
```

## Mock mode (tests only)

```yaml
- uses: bridgedai-devsecops/auth-action@v1
  with:
    tenant: test
    audience: test
    mode: mock
```

Mock mode prints `MOCK MODE ENABLED` and returns synthetic outputs.

