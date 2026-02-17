export const UserRole = {
  USER: 'USER',
  MANAGER: 'MANAGER',
  BRANCH_DIRECTOR: 'BRANCH_DIRECTOR',
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
