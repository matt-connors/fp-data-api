import type { Resource } from "../builder";
import type { PermissionAction } from "../types";

/**
 * Execute a query and return the result with error handling
 */
export function executeQuery(callback: (context: any, args?: any, ctx?: any) => Promise<any>) {
    return async (_root: any, _args: any, ctx: any) => {
        try {
            return await callback(ctx.db, _args, ctx).then((result: any) => {
                // console.log('result', JSON.stringify(result));
                return result;
            });
        }
        catch (e) {
            console.error('error', e);
        }
    }
}

/**
 * Generate auth scopes for a resource in a type-safe way
 */
export function generateAuthScopes({ resource, action }: { resource: Resource, action: PermissionAction }) {
    return {
        [resource]: action
    }
}