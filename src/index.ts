import { createLogger, createYoga, useExecutionCancellation } from "graphql-yoga";
import { useDeferStream } from '@graphql-yoga/plugin-defer-stream'
import { useCSRFPrevention } from '@graphql-yoga/plugin-csrf-prevention'
import { useResponseCache, cacheControlDirective } from '@graphql-yoga/plugin-response-cache'
import { useJWT } from '@graphql-yoga/plugin-jwt'

import { costLimitPlugin } from '@escape.tech/graphql-armor-cost-limit'
import { maxAliasesPlugin } from '@escape.tech/graphql-armor-max-aliases'
import { maxDepthPlugin } from '@escape.tech/graphql-armor-max-depth'
import { maxDirectivesPlugin } from '@escape.tech/graphql-armor-max-directives'
import { maxTokensPlugin } from '@escape.tech/graphql-armor-max-tokens'

import { schema } from './schema';
import { createContext } from "./context";

import { getUserPermissions } from './resolvers/User/query';

export interface Env {
    "fitness-db": Hyperdrive;
    "db": any;
}

const logger = createLogger('debug');

const yoga = createYoga<Env>({
    plugins: [
        useExecutionCancellation(),
        useDeferStream(),
        useCSRFPrevention({
            requestHeaders: ['x-graphql-yoga-csrf'] // default
        }),
        // See https://the-guild.dev/graphql/yoga-server/docs/features/response-caching
        useResponseCache({
            // cache based on the authentication header
            // session: (request: Request) => request.headers.get('authorization'),
            session: () => null,
            // by default cache all operations for 2 seconds
            ttl: 2_000,
            ttlPerType: {
                // only cache query operations containing User for 500ms
                Project: 0,
            },
            ttlPerSchemaCoordinate: {
                // cache operations selecting Query.lazy for 10 seconds
                // 'Query.lazy': 10_000
            }
        }),
        costLimitPlugin({
            maxCost: 5000,              // Default: 5000
            objectCost: 2,              // Default: 2
            scalarCost: 1,              // Default: 1
            depthCostFactor: 1.5,       // Default: 1.5
            ignoreIntrospection: true,  // Default: true
        }),
        maxTokensPlugin({
            n: 1000
        }),
        maxDepthPlugin({
            n: 6
        }),
        maxDirectivesPlugin({
            n: 50
        }),
        maxAliasesPlugin({
            n: 15,
            allowList: []
        })
        // useJWT({
        //     issuer: 'http://graphql-yoga.com',
        //     signingKey: process.env.JWT_SECRET
        // })
    ],
    // cors: {
    //     origin: '*',
    //     methods: ['GET', 'POST', 'OPTIONS'],
    //     allowedHeaders: ['Content-Type', 'Authorization'],
    //     exposedHeaders: ['Content-Range', 'X-Content-Range'],
    //     credentials: true,
    //     maxAge: 86400,
    // },
    logging: logger,
    schema,
    context: async (context) => {
        const userId = context.request.headers.get('X-User-Id');
        if (!userId) {
            return context;
        }
        const permissions = await getUserPermissions('1', context.db);
        console.log('(permissions) --->', permissions);
        if (!permissions) {
            return context;
        }
        return {
            ...context,
            permissions,
        };
    }
})

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        const context = createContext(env["fitness-db"].connectionString);
        const response = await yoga(request, {
            ...env,
            ...context,
        });
        await context.db.destroy();
        return response;
    },
};