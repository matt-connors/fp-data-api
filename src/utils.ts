import { ExpressionBuilder } from 'kysely'
import { jsonArrayFrom } from 'kysely/helpers/postgres'

import { DB } from './types'

/**
 * Get permissions associated with a user
 */
export const getUserPermissions = (userId: string, db: any) => db
    .selectFrom('UserRole')
    .selectAll()
    .where('userId', '=', userId)
    .select(
        (eb: ExpressionBuilder<DB, 'UserRole'>) => jsonArrayFrom(
            eb.selectFrom('Role')
                .selectAll()
                .whereRef('Role.id', '=', 'UserRole.roleId')
                .select(
                    (eb: ExpressionBuilder<DB, 'Role'>) => jsonArrayFrom(
                        eb.selectFrom('Permission')
                            .select([
                                'Permission.id',
                                'Permission.description',
                                'Permission.action',
                                'Permission.resource'
                            ])
                            .innerJoin('_PermissionToRole', 'Permission.id', '_PermissionToRole.A')
                            .whereRef('_PermissionToRole.B', '=', 'Role.id')
                    ).as('permissions')
                )
        ).as('rolesWithPermissions')
    )
    .execute()
    .then((result: any) => {
        if (result.length === 0) {
            console.log(`User with id "${userId}" was not found in the UserRole table.`);
            return null;
        }
        if (result[0]['rolesWithPermissions'].length === 0) {
            console.log(`User with id "${userId}" has no roles and therefore no permissions.`);
            return null;
        }
        return result[0]['rolesWithPermissions'][0]['permissions'];
    });


/**
 * Update a record in the database
 */
export const updateDatabase = ({ table, key, data, db }: { table: string, key: string, data: { [key: string]: any }, db: any }) => db
    .updateTable(table)
    .set(data)
    .where('id', '=', key)
    .returningAll()
    .executeTakeFirst()
    .catch((error: any) => {
        console.error(`Error appending to the database: ${error}`);
        return null;
    });

/**
 * Append a record to the database
 */
export const appendToDatabase = ({ table, data, db }: { table: string, data: { [key: string]: any }, db: any }) => db
    .insertInto(table)
    .values(data)
    .returningAll()
    .executeTakeFirst()
    .catch((error: any) => {
        console.error(`Error appending to the database: ${error}`);
        return null;
    });