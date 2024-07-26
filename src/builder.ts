import type { Context } from './context'

import SchemaBuilder from '@pothos/core'
import ScopeAuthPlugin from '@pothos/plugin-scope-auth';

import type { PermissionAction } from './types'

export type Resource = 'TEST' | 'TEST2'

interface SchemaTypes {
    AuthScopes: {
        // <resource>: <access-level>
        [key: string]: PermissionAction
    };
    Scalars: {
        JSONObject: {
            Input: any;
            Output: any;
        };
    };
    Context: Context
};

// Define the ranking of access levels
const accessRanking = {
    VIEW: 1,
    EDIT: 2,
    CREATE: 3,
    DELETE: 4,
    MANAGE: 5
};

export const builder = new SchemaBuilder<SchemaTypes>({
    plugins: [
        ScopeAuthPlugin // See https://pothos-graphql.dev/docs/plugins/scope-auth
    ],
    scopeAuth: {
        // Recommended when using subscriptions
        // when this is not set, auth checks are run when event is resolved rather than when the subscription is created
        // authorizeOnSubscribe: true,

        // converts a list of permissions to an object of <resource>: <boolean>
        // the boolean is whether the resource the user is attempting to access is allowed based on their permissions
        authScopes: async (context: any) => context.permissions.map((permission: { action: PermissionAction, resource: Resource }) => ({
            // The user must have a permission level greater than the required action
            [permission.resource]: (requiredAction: PermissionAction) => accessRanking[permission.action] > accessRanking[requiredAction]
        })).reduce((acc: any, curr: any) => ({ ...acc, ...curr }), {})
    }
})

builder.scalarType('JSONObject', {
    serialize: (value) => {
        return value;
    },

    parseValue: (value: any) => {
        if (value !== null && value !== undefined) {
            return value;
        }
        else {
            throw new Error('JSONObject cannot represent non-object value: ' + value);
        }
    }
})