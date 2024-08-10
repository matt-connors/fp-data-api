import { sql, type ExpressionBuilder } from 'kysely'
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/postgres'
import { Resource, builder } from '../../builder'

import { ProgramType } from '../../models'

import { executeQuery, generateAuthScopes } from '../utils'
import type { DB } from '../../types'

/**
 * Relation between Program, ProgramExercise and Exercise
 */
const programWithExercises = (eb: ExpressionBuilder<DB, 'Program'>) => jsonArrayFrom(
    eb.selectFrom('Exercise')
        .select([
            'Exercise.id',
            'Exercise.name',
            'Exercise.aliases',
            'Exercise.bodyPart',
            'Exercise.category',
            'Exercise.iconUrl',
        ])
        .innerJoin('ProgramExercise', 'Exercise.id', 'ProgramExercise.exerciseId')
        .whereRef('ProgramExercise.programId', '=', 'Program.id')
).as('programExercises');

/**
 * Relation between Program, ProgramExercise and Exercise
 */
const programWithProgramExercises = (eb: ExpressionBuilder<DB, 'Program'>) => jsonArrayFrom(
    eb.selectFrom('ProgramExercise')
        .selectAll()
        .whereRef('ProgramExercise.programId', '=', 'Program.id')
        .select(
            (eb: ExpressionBuilder<DB, 'Program'>) => jsonObjectFrom(
                eb.selectFrom('Exercise')
                    .select([
                        'Exercise.id',
                        'Exercise.name',
                        'Exercise.aliases',
                        'Exercise.bodyPart',
                        'Exercise.category',
                        'Exercise.iconUrl',
                    ])
                    // @ts-ignore
                    .whereRef('Exercise.id', '=', 'ProgramExercise.exerciseId')
            ).as('exercise')
        )
).as('programExercises');


/**
 * Relation between User, Trainer, TrainerProgram and Program
 * 
 * User[] -> Trainer -> TrainerPrograms[] -> Program
 * 
 */
const userWithPrograms = (eb: ExpressionBuilder<DB, 'User'>) => jsonArrayFrom(
    eb.selectFrom('Trainer')
        .selectAll()
        // @ts-ignore
        .where('Trainer.authorizedUserIds', '@>', sql`ARRAY[${eb.ref('User.id')}]`)
        .innerJoin('TrainerProgram', 'Trainer.id', 'TrainerProgram.trainerId')
        .innerJoin('Program', 'TrainerProgram.programId', 'Program.id')
        .select(programWithExercises)
        .select(programWithUserPrograms)
).as('programs');

/**
 * Relation between Program and UserProgram
 */
const programWithUserPrograms = (eb: ExpressionBuilder<DB, 'Program'>) => jsonArrayFrom(
    eb.selectFrom('UserProgram')
        .selectAll()
        .whereRef('UserProgram.programId', '=', 'Program.id')
).as('userPrograms');

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
            .select(programWithProgramExercises)
            .select(programWithUserPrograms)
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
            .select(programWithExercises)
            .select(programWithUserPrograms)
            .execute()
            .then((result: any) => {
                return result.map((program: any) => {
                    return {
                        ...program,
                        programExercises: program.programExercises.map((exercise: any) => ({
                            exercise: exercise
                        }))
                    }
                })
            })
        )
    }),
    /**
     * Get all programs created by the current user
     */
    myPrograms: t.field({
        type: [ProgramType],
        authScopes: generateAuthScopes({
            resource: 'TEST',
            action: 'VIEW'
        }),
        resolve: executeQuery((db, { }, ctx) => db
            .selectFrom('User')
            .selectAll()
            .where('id', '=', ctx.userId)
            .select(userWithPrograms)
            // .select(programWithExercises)
            // .select(programWithUserPrograms)
            .execute()
            .then((result: any) => {
                return result[0].programs.map((program: any) => {
                    return {
                        ...program,
                        programExercises: program.programExercises.map((exercise: any) => ({
                            exercise: exercise
                        }))
                    }
                })
            })
        )
    }),
}));