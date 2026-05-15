import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as core from '@actions/core';
import { run } from '../../src/index';

describe('auth-action', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    delete process.env.INPUT_API_URL;
    delete process.env.INPUT_TENANT;
    delete process.env.INPUT_AUDIENCE;
    delete process.env.INPUT_MODE;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('mock mode prints banner and sets outputs', async () => {
    process.env.INPUT_MODE = 'mock';
    process.env.INPUT_TENANT = 'tenant-1';
    process.env.INPUT_AUDIENCE = 'https://github.com/org/repo';

    const setOutput = vi.spyOn(core, 'setOutput').mockImplementation(() => {});
    const info = vi.spyOn(core, 'info').mockImplementation(() => {});
    const setSecret = vi.spyOn(core, 'setSecret').mockImplementation(() => {});

    await run();

    expect(info).toHaveBeenCalledWith('MOCK MODE ENABLED');
    expect(setSecret).toHaveBeenCalled();
    expect(setOutput).toHaveBeenCalled();
    const keys = setOutput.mock.calls.map((c) => c[0]);
    expect(keys).toEqual(expect.arrayContaining(['access-token', 'tenant-id', 'session-id', 'expires-at']));
  });

  it('production mode fails when api-url missing', async () => {
    process.env.INPUT_MODE = 'production';
    process.env.INPUT_TENANT = 'tenant-1';
    process.env.INPUT_AUDIENCE = 'aud';

    await expect(run()).rejects.toThrow(/api-url is required/i);
  });

  it('production mode calls OIDC exchange when mocked', async () => {
    vi.spyOn(core, 'getInput').mockImplementation((name: string) => {
      const map: Record<string, string> = {
        mode: 'production',
        'api-url': 'https://example.invalid',
        tenant: 'tenant-1',
        audience: 'aud',
      };
      return map[name] ?? '';
    });

    vi.spyOn(core, 'getIDToken').mockResolvedValue('oidc-token');
    vi.spyOn(core, 'setOutput').mockImplementation(() => {});
    vi.spyOn(core, 'setSecret').mockImplementation(() => {});

    await expect(run()).rejects.toThrow(/Network error|fetch failed|HTTP/i);
  });
});
