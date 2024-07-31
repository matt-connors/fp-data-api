import type { AllSelection } from 'kysely/dist/cjs/parser/select-parser';
import { builder } from '../builder';
import { DB } from '../types';

import { UserType } from './UserType';
import { ProgramType } from './ProgramType';


export const UserProgramType = builder.objectRef<AllSelection<DB, 'UserProgram'>>('UserProgram');

UserProgramType.implement({
    fields: (t) => ({
        id: t.exposeID('id'),
        user: t.expose('trainer', { type: [UserType] }),
        program: t.expose('program', { type: [ProgramType] }),
        startDate: t.exposeString('startDate'),
        endDate: t.exposeString('endDate', { nullable: true }),
    }),
});