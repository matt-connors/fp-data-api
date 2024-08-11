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
export const ProgramType = {
    LIBRARY: "LIBRARY",
    CUSTOM: "CUSTOM"
} as const;
export type ProgramType = (typeof ProgramType)[keyof typeof ProgramType];
export type Exercise = {
    id: Generated<number>;
    name: string;
    bodyPart: string;
    aliases: string[];
    category: string;
    iconUrl: string;
};
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
export type Program = {
    id: Generated<number>;
    type: ProgramType | null;
    name: string | null;
    description: string | null;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp | null;
};
export type ProgramExercise = {
    programId: number;
    exerciseId: number;
    order: number | null;
    sets: number | null;
    reps: number | null;
    duration: number | null;
    notes: string | null;
};
export type Role = {
    id: Generated<number>;
    roleName: string;
};
export type Trainer = {
    id: Generated<number>;
    businessName: string;
    authorizedUserIds: string[];
};
export type TrainerProgram = {
    id: Generated<number>;
    trainerId: number;
    programId: number;
};
export type User = {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string | null;
    country: string | null;
    createdAt: Generated<Timestamp>;
    trainerId: number | null;
    userProgramId: number | null;
};
export type UserProgram = {
    id: Generated<number>;
    userId: string;
    programId: number;
    startDate: Timestamp;
    endDate: Timestamp | null;
};
export type UserRole = {
    userId: string;
    roleId: number;
};
export type DB = {
    _PermissionToRole: PermissionToRole;
    Exercise: Exercise;
    Permission: Permission;
    Program: Program;
    ProgramExercise: ProgramExercise;
    Role: Role;
    Trainer: Trainer;
    TrainerProgram: TrainerProgram;
    User: User;
    UserProgram: UserProgram;
    UserRole: UserRole;
};
