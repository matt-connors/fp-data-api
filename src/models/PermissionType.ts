import type { AllSelection } from 'kysely/dist/cjs/parser/select-parser';
import { builder } from '../builder';
import { DB } from '../types';

import { EndpointType } from './EndpointType';
import { RoleType } from './RoleType';

export const PermissionType = builder.objectRef<AllSelection<DB, 'Permission'>>('Permission');

export enum PermissionAction {
    VIEW = 'VIEW',
    EDIT = 'EDIT',
    CREATE = 'CREATE',
    DELETE = 'DELETE',
    MANAGE = 'MANAGE',
}

PermissionType.implement({
    fields: (t) => ({
        id: t.exposeID('id'),
        action: t.expose('action', { type: PermissionAction }),
        description: t.expose('description', { type: 'String' }),
        roels: t.expose('roles', { type: [RoleType] }),
        endpoints: t.expose('endpoints', { type: [EndpointType] }),
    }),

});