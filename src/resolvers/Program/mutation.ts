import { sql, type ExpressionBuilder } from 'kysely'
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/postgres'
import { Resource, builder } from '../../builder'

import { ProgramExerciseType, ProgramType } from '../../models'

import { executeQuery, generateAuthScopes } from '../utils'
import type { DB } from '../../types'

builder.mutationType(({
    fields: (t) => ({
        /**
         * Assign a program to a user
         */
        assignProgram: t.field({
            type: ProgramType,
            authScopes: generateAuthScopes({
                resource: 'TEST',
                action: 'VIEW'
            }),
            args: {
                userId: t.arg.string({ required: true }),
                programId: t.arg.int({ required: true }),
            },
            resolve: executeQuery(async (db, { userId, programId }) => {
                // determine if the user is alrady in UserProgram with their userId
                let hasExistingUserProgram = await db
                    .selectFrom('UserProgram')
                    .where('userId', '=', userId)
                    .executeTakeFirst()

                // if the user is already in UserProgram, update the programId and startDate
                if (hasExistingUserProgram) {
                    return db
                        .updateTable('UserProgram')
                        .set({
                            programId,
                            startDate: new Date(),
                        })
                        .where('userId', '=', userId)
                        .returning(['id'])
                        .executeTakeFirst()
                }
                // if the user is not in UserProgram, insert the userId, programId, and startDate
                return db
                    .insertInto('UserProgram')
                    .values({
                        userId,
                        programId,
                        startDate: new Date(),
                    })
                    .returning(['id'])
                    .executeTakeFirst()
            }),
        }),
        /**
         * Remove an exercise from a program
         */
        removeExercise: t.field({
            type: ProgramExerciseType,
            authScopes: generateAuthScopes({
                resource: 'TEST',
                action: 'VIEW'
            }),
            args: {
                programId: t.arg.int({ required: true }),
                exerciseId: t.arg.int({ required: true }),
            },
            resolve: executeQuery(async (db, { programId, exerciseId }) => {
                await db
                    .deleteFrom('ProgramExercise')
                    .where('programId', '=', programId)
                    .where('exerciseId', '=', exerciseId)
                    .execute();
                return { id: exerciseId }
            }),
        }),
        /**
         * Update a program
         */
        updateProgram: t.field({
            type: ProgramType,
            authScopes: generateAuthScopes({
                resource: 'TEST',
                action: 'VIEW'
            }),
            args: {
                programId: t.arg.int({ required: true }),
                name: t.arg.string({ required: false }),
                description: t.arg.string({ required: false }),
            },
            resolve: executeQuery(async (db, { programId, name, description, type }) => {
                const res = await db
                    .updateTable('Program')
                    .set({
                        name,
                        description,
                        type,
                    })
                    .where('id', '=', programId)
                    .returningAll()
                    .executeTakeFirst();
                return res;
            }),
        }),
        /**
         * Update an exercise in a program
         */
        updateProgramExercise: t.field({
            type: ProgramExerciseType,
            authScopes: generateAuthScopes({
                resource: 'TEST',
                action: 'VIEW'
            }),
            args: {
                programId: t.arg.int({ required: true }),
                exerciseId: t.arg.int({ required: true }),
                sets: t.arg.int({ required: false }),
                reps: t.arg.int({ required: false }),
                notes: t.arg.string({ required: false }),
            },
            resolve: executeQuery(async (db, { programId, exerciseId, sets, reps, notes }) => {
                const res = await db
                    .updateTable('ProgramExercise')
                    .set({
                        sets,
                        reps,
                        notes,
                    })
                    .where('programId', '=', programId)
                    .where('exerciseId', '=', exerciseId)
                    .returningAll()
                    .executeTakeFirst();

                    console.log('!!!! ->', res)
                return res;
            }),
        }),
    }),
}))