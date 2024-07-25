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
export type Endpoints = {
    endpoint: string;
};
export type EndpointsToPermission = {
    A: string;
    B: number;
};
export type Permission = {
    id: Generated<number>;
    description: string;
    action: PermissionAction;
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
    id: Generated<number>;
    email: string;
    password: string;
    trainerId: number | null;
};
export type UserRole = {
    userId: number;
    roleId: number;
};
export type DB = {
    _EndpointsToPermission: EndpointsToPermission;
    _PermissionToRole: PermissionToRole;
    Endpoints: Endpoints;
    Permission: Permission;
    Role: Role;
    Trainer: Trainer;
    User: User;
    UserRole: UserRole;
};
