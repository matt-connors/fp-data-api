import type { AllSelection } from 'kysely/dist/cjs/parser/select-parser';
import { builder } from '../builder';
import { DB } from '../types';

import { RoleType } from './RoleType';

export const PermissionType = builder.objectRef<AllSelection<DB, 'Permission'>>('Permission');

export enum PermissionAction {
    VIEW = 'VIEW',
    EDIT = 'EDIT',
    CREATE = 'CREATE',
    DELETE = 'DELETE',
    MANAGE = 'MANAGE',
}

builder.enumType(PermissionAction, {
    name: 'PermissionAction',
    description: 'The action that a permission allows',
});

PermissionType.implement({
    fields: (t) => ({
        id: t.exposeID('id'),
        action: t.expose('action', { type: PermissionAction }),
        description: t.expose('description', { type: 'String' }),
        roles: t.expose('roles', { type: [RoleType] }),
    }),

});