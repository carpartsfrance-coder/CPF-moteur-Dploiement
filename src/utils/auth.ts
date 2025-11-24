export const ADMIN_AUTH_KEY = 'cpf_admin_authed_v1';

export function isAdminAuthed(): boolean {
  try {
    return localStorage.getItem(ADMIN_AUTH_KEY) === '1';
  } catch {
    return false;
  }
}

export function setAdminAuthed(v: boolean) {
  localStorage.setItem(ADMIN_AUTH_KEY, v ? '1' : '0');
}

export function checkAdminPassword(input: string): boolean {
  const expected = process.env.REACT_APP_ADMIN_PASSWORD || 'changeme';
  return input === expected;
}
