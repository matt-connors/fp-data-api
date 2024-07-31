import type { AllSelection } from 'kysely/dist/cjs/parser/select-parser';
import { builder } from '../builder';
import { DB } from '../types';

import { UserRoleType } from './UserRoleType';
import { TrainerType } from './TrainerType';
import { UserProgramType } from './UserProgramType';

export const UserType = builder.objectRef<AllSelection<DB, 'User'>>('User');

UserType.implement({
    fields: (t) => ({
        id: t.exposeID('id'),
        email: t.exposeString('email'),
        userRoles: t.expose('userRoles', { type: [UserRoleType] }),
        trainer: t.expose('trainer', { type: TrainerType, nullable: true }),
        userProgram: t.expose('userProgram', { type: [UserProgramType] }),
    }),

});