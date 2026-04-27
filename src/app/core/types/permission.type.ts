export const Actions = ['create', 'read', 'update', 'delete', 'manage'] as const;
export type Action = (typeof Actions)[number];

export const Subjects = ['user', 'department', 'position', 'employee', 'all'] as const;
export type Subject = (typeof Subjects)[number];

// 🔥 final type
export type AppPermission = `${Subject}.${Action}`;
