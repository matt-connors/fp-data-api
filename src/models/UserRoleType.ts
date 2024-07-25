import type { AllSelection } from 'kysely/dist/cjs/parser/select-parser';
import { builder } from '../builder';
import { DB } from '../types';

import { RoleType } from './RoleType';
import { UserType } from './UserType';

export const UserRoleType = builder.objectRef<AllSelection<DB, 'UserRole'>>('UserRole');

UserRoleType.implement({
    fields: (t) => ({
        id: t.exposeID('id'),
        role: t.expose('role', { type: RoleType }),
        user: t.expose('user', { type: UserType }),
    }),

});