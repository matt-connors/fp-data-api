import { builder } from '../../builder'
import { UserType, ProjectType, PageType } from '../../models'

import { executeQuery } from '../utils'

builder.mutationType({
    fields: (t) => ({
        addUser: t.field({
            type: UserType,
            args: {
                name: t.arg.string({ required: true }),
                email: t.arg.string({ required: true }),
            },
            nullable: false,
            resolve: executeQuery((db, { name, email }) => db
                .insertInto('User')
                .values({
                    name,
                    email,
                    updatedAt: new Date(),
                })
                .returning(['id', 'name', 'email', 'createdAt', 'updatedAt'])
                .executeTakeFirst()
            )
        }),

        /**
         * Update the name of a project
         */
        updateProjectName: t.field({
            type: ProjectType,
            args: {
                id: t.arg.string({ required: true }),
                name: t.arg.string({ required: true }),
            },
            nullable: false,
            resolve: executeQuery(async (db, { id, name }) => db
                .updateTable('Project')
                .set('name', name)
                .where('id', '=', id)
                .returning(['id', 'name'])
                .executeTakeFirst())
        }),

        /**
         * Create a new page
         */
        createNewPage: t.field({
            type: PageType,
            args: {
                projectId: t.arg.string({ required: true }),
                subpath: t.arg.stringList({ required: true }),
                slug: t.arg.string({ required: true }),
            },
            nullable: false,
            resolve: executeQuery(async (db, { projectId, subpath, slug }) => db
                .insertInto('Page')
                .values({
                    projectId,
                    subpath,
                    slug,
                    customCode: '',
                    meta: {},
                })
                .returning(['id', 'name', 'projectId', 'createdAt', 'updatedAt'])
                .executeTakeFirst(),
            )
        }),

        /**
         * Modify a page (including rename)
         * slug, subpath, customCode, meta
         */
        modifyPage: t.field({
            type: PageType,
            args: {
                id: t.arg.string({ required: true }),
                slug: t.arg.string(),
                subpath: t.arg.stringList(),
                customCode: t.arg.string(),
                meta: t.arg.string(),
            },
            nullable: false,
            resolve: executeQuery(async (db, { id, slug, subpath, customCode, meta }) => db
                .updateTable('Page')
                .set('slug', slug)
                .set('subpath', subpath)
                .set('customCode', customCode)
                .set('meta', meta)
                .where('id', '=', id)
                .returning(['id', 'slug', 'subpath', 'customCode', 'meta'])
                .executeTakeFirst()
            )
        })
    })
})