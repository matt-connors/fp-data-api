import type { AllSelection } from 'kysely/dist/cjs/parser/select-parser';
import { builder } from '../builder';
import { DB } from '../types';

import { ProgramExerciseType } from './ProgramExerciseType';

export const ExerciseType = builder.objectRef<AllSelection<DB, 'Exercise'>>('Exercise');

ExerciseType.implement({
    fields: (t) => ({
        id: t.exposeID('id'),
        name: t.exposeString('name'),
        bodyPart: t.exposeString('bodyPart'),
        aliases: t.expose('aliases', { type: ['String'] }),
        category: t.exposeString('category'),
        programExercise: t.expose('programExercise', { type: ProgramExerciseType }),
        iconUrl: t.exposeString('iconUrl')
    }),
});