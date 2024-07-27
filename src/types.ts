import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export const PermissionAction = {
    VIEW: "VIEW",
    EDIT: "EDIT",
    CREATE: "CREATE",
    DELETE: "DELETE",
    MANAGE: "MANAGE"
} as const;
export type PermissionAction = (typeof PermissionAction)[keyof typeof PermissionAction];
export const Resource = {
    TEST: "TEST",
    TEST2: "TEST2"
} as const;
export type Resource = (typeof Resource)[keyof typeof Resource];
export type Permission = {
    id: Generated<number>;
    description: string;
    action: PermissionAction;
    resource: Resource;
};
export type PermissionToRole = {
    A: number;
    B: number;
};
export type Role = {
    id: Generated<number>;
    roleName: string;
};
export type Trainer = {
    id: Generated<number>;
};
export type User = {
    id: string;
    email: string;
    createdAt: Generated<Timestamp>;
    trainerId: number | null;
};
export type UserRole = {
    userId: string;
    roleId: number;
};
export type DB = {
    _PermissionToRole: PermissionToRole;
    Permission: Permission;
    Role: Role;
    Trainer: Trainer;
    User: User;
    UserRole: UserRole;
};
