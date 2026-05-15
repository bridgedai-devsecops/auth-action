# Security documentation (`auth-action`)

See also `SECURITY.md` (coarse policy) and this file (operational detail).

## Threat model

- **Runner compromise**: a compromised runner can exfiltrate any secret available to the job, including OIDC-derived tokens, regardless of masking.
- **API impersonation**: a misconfigured `api-url` could point to an attacker-controlled endpoint that harvests OIDC tokens.

## Secret handling

- Access tokens are masked with `core.setSecret` and must never be printed.
- Do not pass tokens through `echo`, job summaries, or artifact names.

## Token permissions

- Prefer least-privilege BridgedAI roles bound to OIDC claims (repository, ref, environment).

## PR / fork risk

- OIDC token claims differ for forks; treat fork workflows as untrusted with respect to tenant policy.

## Self-hosted runner risk

- Self-hosted runners expand trust boundaries; combine with runner hardening and network controls.

## Egress risk

- This action calls your configured BridgedAI `api-url`. Restrict egress where possible.

## Dependency risk

- Keep action dependencies updated; review `package-lock.json` changes like any production dependency.

## Attestation verification

- This action only performs authentication; downstream actions should verify subjects and policies.

## Release gate bypass prevention

- Do not grant bypass secrets to untrusted actors; protect reusable workflows with environment protections.

## Incident response

- Rotate BridgedAI OIDC trust configuration if you suspect token misuse; invalidate sessions as supported by your backend.

## Audit checklist

- [ ] `id-token: write` only where needed
- [ ] `api-url` is an expected BridgedAI hostname
- [ ] `mode: mock` never used in production workflows
