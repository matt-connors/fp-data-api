import { ExpressionBuilder, sql } from 'kysely'
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/postgres'
import { Resource, builder } from '../../builder'

import { TrainerType, UserType } from '../../models'

import { executeQuery, generateAuthScopes } from '../utils'
import { DB } from '../../types'

/**
 * Relation between Trainer, TrainerProgram and Program
 */
const trainerWithPrograms = (eb: ExpressionBuilder<DB, 'Trainer'>) => jsonArrayFrom(
    eb.selectFrom('Program')
        .select([
            'Program.id',
            'Program.description',
            'Program.type',
            'Program.name'
        ])
        .innerJoin('TrainerProgram', 'Program.id', 'TrainerProgram.programId')
        .whereRef('TrainerProgram.trainerId', '=', 'Trainer.id')
).as('trainerProgram');

/**
 * Relation between User, Trainer, and User
 * Provided a user id who is authoirzed as a trainer, return all other users who have an association with that trainer
 */
const userWithClients = (eb: ExpressionBuilder<DB, 'User'>) => jsonObjectFrom(
    eb.selectFrom('Trainer')
        .selectAll()
        // @ts-ignore
        .where('Trainer.authorizedUserIds', '@>', sql`ARRAY[${eb.ref('User.id')}]`)
        .select(trainerWithClients)
).as('trainer');

/**
 * Relation between User and Trainer
 */
const trainerWithClients = (eb: ExpressionBuilder<DB, 'Trainer'>) => jsonArrayFrom(
    eb.selectFrom('User')
        .select([
            'User.id',
            'User.firstName',
            'User.lastName',
            'User.email',
            'User.trainerId',
            'User.country',
        ])
        // @ts-ignore
        // Don't select authorized users as clients
        .where(eb => eb.not(sql`${eb.ref('Trainer.authorizedUserIds')} @> ARRAY[${eb.ref('User.id')}]`))
        .whereRef('Trainer.id', '=', 'User.trainerId')
).as('users');

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
                        trainerProgram: trainer.trainerProgram.map((program: any) => ({
                            program: [program]
                        }))
                    }
                })
            })
        )
    }),
    /**
     * Get all clients associated with a trainer
     */
    trainerWithClients: t.field({
        type: TrainerType,
        authScopes: generateAuthScopes({
            resource: 'TEST',
            action: 'VIEW'
        }),
        resolve: executeQuery((db, args, ctx) => db
            .selectFrom('User')
            .selectAll()
            .where('id', '=', ctx.userId)
            .select(userWithClients)
            .execute()
            // return the trainer not the user
            .then((result: any) => result[0].trainer)
        )
    })
}));