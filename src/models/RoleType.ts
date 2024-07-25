import type { AllSelection } from 'kysely/dist/cjs/parser/select-parser';
import { builder } from '../builder';
import { DB } from '../types';

import { PermissionType } from './PermissionType';


export const RoleType = builder.objectRef<AllSelection<DB, 'Role'>>('Role');

RoleType.implement({
    fields: (t) => ({
        id: t.exposeID('id'),
        roleName: t.expose('roleName', { type: 'String' }),
        permissions: t.expose('permissions', { type: [PermissionType] }),
        userRoles: t.expose('userRoles', { type: 'String' }),
    }),
});