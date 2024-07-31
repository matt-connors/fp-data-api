import type { ExpressionBuilder } from 'kysely'
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/postgres'
import { Resource, builder } from '../../builder'

import { ExerciseType } from '../../models'

import { executeQuery, generateAuthScopes } from '../utils'
import type { DB } from '../../types'

builder.queryFields((t) => ({
    /**
     * Get a specific exercise by ID
     */
    exercise: t.field({
        type: ExerciseType,
        authScopes: generateAuthScopes({
            resource: 'TEST',
            action: 'VIEW'
        }),
        args: {
            exerciseId: t.arg.string({ required: true }),
        },
        resolve: executeQuery((db, { exerciseId }) => db
            .selectFrom('Exercise')
            .selectAll()
            .where('id', '=', exerciseId)
            .executeTakeFirst()
        )
    }),
    /**
     * Get all public exercises from the exercise library
     */
    publicExercises: t.field({
        type: [ExerciseType],
        authScopes: generateAuthScopes({
            resource: 'TEST',
            action: 'VIEW'
        }),
        resolve: executeQuery((db) => db
            .selectFrom('Exercise')
            .selectAll()
            .where('type', '=', 'LIBRARY')
            .execute()
        )
    }),
}))