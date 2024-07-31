import { ExpressionBuilder } from 'kysely'
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/postgres'
import { Resource, builder } from '../../builder'

import { TrainerType, UserType } from '../../models'

import { executeQuery, generateAuthScopes } from '../utils'
import { DB } from '../../types'

/**
 * Relation between Trainer, TrainerPrograms and Program
 */
const trainerWithPrograms = (eb: ExpressionBuilder<DB, 'Trainer'>) => jsonArrayFrom(
    eb.selectFrom('Program')
        .select([
            'Program.id',
            'Program.description',
            'Program.type',
            'Program.name'
        ])
        .innerJoin('TrainerPrograms', 'Program.id', 'TrainerPrograms.programId')
        .whereRef('TrainerPrograms.trainerId', '=', 'Trainer.id')
).as('trainerPrograms');

builder.queryFields((t) => ({
    /**
     * Get a specific trainer by ID
     */
    trainer: t.field({
        type: TrainerType,
        authScopes: generateAuthScopes({
            resource: 'TEST',
            action: 'VIEW'
        }),
        args: {
            trainerId: t.arg.string({ required: true }),
        },
        resolve: executeQuery((db, { trainerId }) => db
            .selectFrom('Trainer')
            .selectAll()
            .where('id', '=', trainerId)
            .executeTakeFirst()
        )
    }),
    /**
     * Get all programs associated with a trainer
     */
    trainerWithPrograms: t.field({
        type: [TrainerType],
        authScopes: generateAuthScopes({
            resource: 'TEST',
            action: 'VIEW'
        }),
        args: {
            trainerId: t.arg.string({ required: true }),
        },
        resolve: executeQuery((db, { trainerId }) => db
            .selectFrom('Trainer')
            .selectAll()
            .where('id', '=', trainerId)
            .select(trainerWithPrograms)
            .execute()
            .then((result: any) => {
                return result.map((trainer: any) => {
                    return {
                        ...trainer,
                        trainerPrograms: trainer.trainerPrograms.map((program: any) => ({
                            program: [program]
                        }))
                    }
                })
            })
        )
    }),
}));