import { sql, type ExpressionBuilder } from 'kysely'
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/postgres'
import { Resource, builder } from '../../builder'

import { ProgramType } from '../../models'

import { executeQuery, generateAuthScopes } from '../utils'
import type { DB } from '../../types'

builder.mutationType(({
    fields: (t) => ({
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
    }),
}))