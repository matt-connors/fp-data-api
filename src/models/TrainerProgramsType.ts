import type { AllSelection } from 'kysely/dist/cjs/parser/select-parser';
import { builder } from '../builder';
import { DB } from '../types';

import { TrainerType } from './TrainerType';
import { ProgramType } from './ProgramType';

export const TrainerProgramsType = builder.objectRef<AllSelection<DB, 'TrainerPrograms'>>('TrainerPrograms');

TrainerProgramsType.implement({
    fields: (t) => ({
        id: t.exposeID('id'),
        trainer: t.expose('trainer', { type: [TrainerType] }),
        program: t.expose('program', { type: [ProgramType] }),
    }),
});