
/**
 * Execute a query and return the result with error handling
 */
export function executeQuery(callback: (context: any, args?: any, ctx?: any) => Promise<any>) {
    return async (_root: any, _args: any, ctx: any) => {
        try {
            return await callback(ctx.db, _args, ctx).then((result: any) => {
                return result;
            });
        }
        catch (e) {
            console.error('error', e);
        }
    }
}