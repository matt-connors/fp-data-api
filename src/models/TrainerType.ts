import type { AllSelection } from 'kysely/dist/cjs/parser/select-parser';
import { builder } from '../builder';
import { DB } from '../types';

import { UserType } from './UserType';

export const TrainerType = builder.objectRef<AllSelection<DB, 'Trainer'>>('Trainer');

TrainerType.implement({
    fields: (t) => ({
        id: t.exposeID('id'),
        users: t.expose('users', { type: [UserType] }),
    }),

});