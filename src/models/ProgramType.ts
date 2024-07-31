import type { AllSelection } from 'kysely/dist/cjs/parser/select-parser';
import { builder } from '../builder';
import { DB } from '../types';

import { ProgramExerciseType } from './ProgramExerciseType';
import { TrainerProgramsType } from './TrainerProgramsType';
import { UserProgramType } from './UserProgramType';

export const ProgramType = builder.objectRef<AllSelection<DB, 'Program'>>('Program');

export enum ProgramTypeValue {
    Library = 'LIBRARY',
    Custom = 'CUSTOM',
}

builder.enumType(ProgramTypeValue, {
    name: 'ProgramType',
    description: 'The type of program; either Library or Custom',
});

ProgramType.implement({
    fields: (t) => ({
        id: t.exposeID('id'),
        type: t.expose('type', { type: ProgramTypeValue }),
        name: t.exposeString('name'),
        description: t.exposeString('description'),
        // createdAt: t.expose('createdAt', { type: 'DateTime' }),
        // updatedAt: t.exposeTimestamp('updatedAt'),
        trainerPrograms: t.expose('trainerPrograms', { type: [TrainerProgramsType] }),
        programExercises: t.expose('programExercises', { type: [ProgramExerciseType] }),
        userPrograms: t.expose('userPrograms', { type: [UserProgramType] }),
    }),
});