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

import { WorkerEntrypoint } from "cloudflare:workers";

import { getUserPermissions, appendToDatabase, updateDatabase } from './utils';

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
            session: () => null,
            ttl: 0,
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
    ],
    logging: logger,
    schema,
    context: async (context) => {
        const userId = context.request.headers.get('X-User-Id');
        if (!userId) {
            return context;
        }
        const permissions = await getUserPermissions(userId, context.db) || [];
        // add the permissions and userId to the context
        return {
            ...context,
            permissions,
            userId
        };
    }
})

/**
 * Service binding for the Cloudflare Worker
 */
export default class extends WorkerEntrypoint {

    protected env: Env;
    protected ctx: ExecutionContext;

    constructor(ctx: ExecutionContext, env: Env) {
        super(ctx, env);
        this.env = env;
        this.ctx = ctx;
    }

    /**
     * Create a new context for the database
     */
    private _createContext() {
        return createContext(this.env["fitness-db"].connectionString);
    }


    /**
     * Default fetch handler for a Cloudflare Worker
     */
    async fetch(request: Request): Promise<Response> {
        const context = createContext(this.env["fitness-db"].connectionString);
        const response = await yoga(request, {
            ...this.env,
            ...context,
        });
        await context.db.destroy();
        return response;
    }

    /**
     * Create a new user in the database
     */
    async createUser(data: { id: string, [key: string]: any }) {
        let context = this._createContext();
        let db = context.db;

        if (!data.id) {
            throw new Error('User ID is required.');
        }

        // Add a new user to the database
        await appendToDatabase({
            table: 'User',
            data,
            db
        });

        // Add a new UserRole to the database
        // Note that this must be done sequentially in order to reference the new user's ID
        await appendToDatabase({
            table: 'UserRole',
            data: {
                userId: data.id,
                roleId: 12 // TODO: manually add a default role for testing
            },
            db
        })
    }

    /**
     * Initialize a user who has signed up as a trainer
     */
    async initializeTrainer(
        id: string,
        data: {
            "Business Name": string,
            "First Name": string,
            "Last Name": string,
            "Phone Number": string,
            "Country": string
        }) {
        let context = this._createContext();
        let db = context.db;

        if (!id) {
            throw new Error('User ID is required.');
        }

        // Create a new trainer in the database
        const trainer = await appendToDatabase({
            table: 'Trainer',
            data: {
                businessName: data["Business Name"],
                authorizedUserIds: [id],
            },
            db
        });

        // Update the user database with the new information
        await updateDatabase({
            table: 'User',
            key: id,
            data: {
                trainerId: trainer.id,
                firstName: data["First Name"],
                lastName: data["Last Name"],
                phoneNumber: data["Phone Number"],
                country: data["Country"]
            },
            db
        });
    }

    /**
     * Create a new program in the database
     */
    async createProgram() {
        let context = this._createContext();
        let db = context.db;

        // Add a new program to the database
        return await appendToDatabase({
            table: 'Program',
            data: {
                name: 'New Program',
            },
            db
        });

    }
    /**
     * Assign a program to a user
     */
    async assignProgramToUser(programId: number, userId: string) {
        let context = this._createContext();
        let db = context.db;

        // Assign the program to the user
        // determine if the user is alrady in UserProgram with their userId
        let hasExistingUserProgram = await db
            .selectFrom('UserProgram')
            .where('userId', '=', userId)
            .executeTakeFirst()

        // if the user is already in UserProgram, update the programId and startDate
        if (hasExistingUserProgram) {
            return db
                .updateTable('UserProgram')
                .set({
                    programId,
                    startDate: new Date(),
                })
                .where('userId', '=', userId)
                .returning(['id'])
                .executeTakeFirst()
        }
        // if the user is not in UserProgram, insert the userId, programId, and startDate
        return db
            .insertInto('UserProgram')
            .values({
                userId,
                programId,
                startDate: new Date(),
            })
            .returning(['id'])
            .executeTakeFirst()
    }
}; 