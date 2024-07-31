import type { AllSelection } from 'kysely/dist/cjs/parser/select-parser';
import { builder } from '../builder';
import { DB } from '../types';

import { ExerciseType } from './ExerciseType';
import { ProgramType } from './ProgramType';

export const ProgramExerciseType = builder.objectRef<AllSelection<DB, 'ProgramExercise'>>('ProgramExercise');

ProgramExerciseType.implement({
    fields: (t) => ({
        id: t.exposeID('id'),
        exercise: t.expose('exercise', { type: ExerciseType }),
        program: t.expose('program', { type: ProgramType }),
        order: t.exposeInt('order'),
        sets: t.exposeInt('sets', { nullable: true }),
        reps: t.exposeInt('reps', { nullable: true }),
        duration: t.exposeInt('duration', { nullable: true }),
        notes: t.exposeString('notes', { nullable: true }),
    }),
});