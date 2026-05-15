import * as core from '@actions/core';
import { fail, getOptionalInput, getRequiredInput, maskSecret } from './lib/action-core';
import { setOutputs } from './lib/outputs';
import { appendJobSummary } from './lib/summary';
import { ConfigurationError } from './lib/errors';
import { normalizeApiBaseUrl, parseEnum } from './lib/validation';
import { postJsonWithRetries } from './lib/bridgedai-client';

interface ExchangeResponse {
  access_token?: string;
  accessToken?: string;
  tenant_id?: string;
  tenantId?: string;
  session_id?: string;
  sessionId?: string;
  expires_at?: string;
  expiresAt?: string;
}

export async function run(): Promise<void> {
  const mode = parseEnum('mode', getOptionalInput('mode') || 'production', ['production', 'mock'] as const);
  const tenant = getRequiredInput('tenant');
  const audience = getRequiredInput('audience');

  if (mode === 'mock') {
    core.info('MOCK MODE ENABLED');
    const access = 'mock-bridgedai-access-token';
    maskSecret(access);
    setOutputs({
      'access-token': access,
      'tenant-id': 'mock-tenant-id',
      'session-id': 'mock-session-id',
      'expires-at': new Date(Date.now() + 3_600_000).toISOString(),
    });
    await appendJobSummary('## BridgedAI Auth\n\n**MOCK MODE ENABLED** — credentials are synthetic.\n');
    return;
  }

  const apiUrlRaw = getOptionalInput('api-url');
  if (!apiUrlRaw) {
    throw new ConfigurationError('api-url is required when mode=production');
  }
  const apiUrl = normalizeApiBaseUrl(apiUrlRaw, 'api-url');

  let idToken: string;
  try {
    idToken = await core.getIDToken(audience);
  } catch (e) {
    throw new ConfigurationError(
      `Failed to obtain GitHub OIDC token. Ensure workflow permission id-token: write and a valid audience. (${
        e instanceof Error ? e.message : String(e)
      })`,
    );
  }

  const url = `${apiUrl}/api/v1/auth/github-oidc/exchange`;
  const res = await postJsonWithRetries<ExchangeResponse>(
    url,
    { gitHubOidcToken: idToken, tenant, audience },
    {},
  );

  const accessToken = String(res.access_token ?? res.accessToken ?? '').trim();
  if (!accessToken) {
    throw new ConfigurationError('BridgedAI auth response missing access_token');
  }

  maskSecret(accessToken);

  setOutputs({
    'access-token': accessToken,
    'tenant-id': String(res.tenant_id ?? res.tenantId ?? '').trim(),
    'session-id': String(res.session_id ?? res.sessionId ?? '').trim(),
    'expires-at': String(res.expires_at ?? res.expiresAt ?? '').trim(),
  });
}

if (process.env.VITEST !== 'true') {
  void run().catch((e) => {
    fail(e instanceof Error ? e : new Error(String(e)));
  });
}
