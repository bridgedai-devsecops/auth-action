import { describe, expect, it, vi } from 'vitest';
import * as core from '@actions/core';
import { run } from '../../src/index';

describe('auth-action e2e smoke', () => {
  it('mock mode completes without network', async () => {
    process.env.INPUT_MODE = 'mock';
    process.env.INPUT_TENANT = 'tenant-1';
    process.env.INPUT_AUDIENCE = 'aud';

    vi.spyOn(core, 'setOutput').mockImplementation(() => {});
    vi.spyOn(core, 'setSecret').mockImplementation(() => {});
    vi.spyOn(core, 'info').mockImplementation(() => {});

    await expect(run()).resolves.toBeUndefined();
  });
});
