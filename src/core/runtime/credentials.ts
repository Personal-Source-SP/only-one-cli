/**
 * API credential (v1: built-in constant for local/dev).
 *
 * Future `only-one-cli login` should extend `resolveApiKey()` here
 * (session file before this constant).
 */

/** API bearer token used for all backend calls until login flow ships. */
export const HYBRID_API_KEY_ENV = 'dev-api-key';

export function resolveApiKey(): string {
    return HYBRID_API_KEY_ENV;
}

export function formatApiKeyConfigHint(): string {
    return `Set HYBRID_API_KEY_ENV in cli/src/core/runtime/credentials.ts (current: built-in dev key)`;
}

/** @deprecated Use formatApiKeyConfigHint */
export const formatApiKeyEnvHint = formatApiKeyConfigHint;
