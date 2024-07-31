import type { ExpressionBuilder } from 'kysely'
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/postgres'
import { Resource, builder } from '../../builder'

import { ProgramType } from '../../models'

import { executeQuery, generateAuthScopes } from '../utils'
import type { DB } from '../../types'

builder.queryFields((t) => ({
    /**
     * Get a specific program by ID
     */
    program: t.field({
        type: ProgramType,
        authScopes: generateAuthScopes({
            resource: 'TEST',
            action: 'VIEW'
        }),
        args: {
            programId: t.arg.string({ required: true }),
        },
        resolve: executeQuery((db, { programId }) => db
            .selectFrom('Program')
            .selectAll()
            .where('id', '=', programId)
            .executeTakeFirst()
        )
    }),
    /**
     * Get all programs from the program library
     */
    publicPrograms: t.field({
        type: [ProgramType],
        authScopes: generateAuthScopes({
            resource: 'TEST',
            action: 'VIEW'
        }),
        resolve: executeQuery((db) => db
            .selectFrom('Program')
            .selectAll()
            .where('type', '=', 'LIBRARY')
            .execute()
        )
    }),
}));