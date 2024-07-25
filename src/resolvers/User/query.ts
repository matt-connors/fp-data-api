import { ExpressionBuilder } from 'kysely'
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/postgres'
import { builder } from '../../builder'
import { ProjectType, BusinessType } from '../../models'

import { executeQuery } from '../utils'
import { DB } from '../../types'

// https://pothos-graphql.dev/docs/guide/objects
// https://kysely.dev/docs/examples/INSERT/returning-data



// See https://kysely.dev/docs/recipes/relations
const withBusiness = (eb: ExpressionBuilder<DB, 'Project'>) => jsonObjectFrom(
    eb.selectFrom('Business')
        .selectAll()
        .whereRef('Business.id', '=', 'Project.businessId')
).as('business');

const withPages = (eb: ExpressionBuilder<DB, 'Project'>) => jsonArrayFrom(
    eb.selectFrom('Page')
        .selectAll()
        .whereRef('Page.projectId', '=', 'Project.id')
).as('pages');

builder.queryType({
    fields: (t) => ({
        /**
         * TEMP: Get all projects
         */
        projects: t.field({
            type: [ProjectType],
            nullable: true,
            resolve: executeQuery((db, { id }) => db
                .selectFrom('Project')
                .selectAll()
                .select(withBusiness)
                .execute()
            )
        }),
        /**
         * Get a specific project by id
         */
        project: t.field({
            type: ProjectType,
            args: {
                id: t.arg.string({ required: true }),
            },
            nullable: true,
            resolve: executeQuery((db, { id }) => db
                .selectFrom('Project')
                .selectAll()
                .where('id', '=', id)
                .select((eb: ExpressionBuilder<DB, 'Project'>) => [
                    withBusiness(eb),
                    withPages(eb),
                ])
                .executeTakeFirst()
            )
        }),
        /**
         * TEMP: Get all businesses
         */
        businesses: t.field({
            type: [BusinessType],
            nullable: true,
            resolve: executeQuery(db => db
                .selectFrom('Business')
                .selectAll()
                .execute()
            )
        }),
        /**
         * Get a specific business by id
         */
        business: t.field({
            type: BusinessType,
            args: {
                id: t.arg.int({ required: true }),
            },
            nullable: true,
            resolve: executeQuery((db, { id }) => db
                .selectFrom('Business')
                .selectAll()
                .where('id', '=', id)
                .executeTakeFirst()
            )
        }),



        die: t.field({
            type: RandomDie,
            args: {
                numSides: t.arg.int({ required: true }),
            },
            nullable: true,
            resolve: (_root, { numSides }) => new RandomDie(numSides)
        })
    })
})


class RandomDie {

    numSides: number;

    constructor(numSides: number) {
        this.numSides = numSides
    }

    rollOnce() {
        return 1 + Math.floor(Math.random() * this.numSides)
    }

    roll({ numRolls }: { numRolls: number }) {
        var output = []
        for (var i = 0; i < numRolls; i++) {
            output.push(this.rollOnce())
        }
        return output
    }
}

builder.objectType(RandomDie, {
    name: 'RandomDie',
    fields: (t) => ({
        numSides: t.exposeInt('numSides'),
        rollOnce: t.int({
            resolve: (parent) => parent.rollOnce()
        }),
        roll: t.intList({
            args: {
                numRolls: t.arg.int({ required: true })
            },
            resolve: (parent, { numRolls }) => parent.roll({ numRolls })
        })
    })
});

// see https://pothos-graphql.dev/docs/plugins/smart-subscriptions for subscriptions
// see https://pothos-graphql.dev/docs/plugins/scope-auth for auth