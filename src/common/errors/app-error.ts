export type AppErrorPayload = {
  code: string;
  message: string;
  details?: unknown;
};

export function buildAppError(
  code: string,
  message: string,
  details?: unknown,
): AppErrorPayload {
  if (!code) {
    throw new Error('App error code must be a non-empty string');
  }

  return details === undefined ? { code, message } : { code, message, details };
}
