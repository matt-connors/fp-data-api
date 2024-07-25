/**
 * ! Executing this script will delete all data in your database and seed it with 10 versions.
 * ! Make sure to adjust the script to your needs.
 * Use any TypeScript runner to run this script, for example: `npx tsx seed.ts`
 * Learn more about the Seed Client by following our guide: https://docs.snaplet.dev/seed/getting-started
 */
import { createSeedClient } from "@snaplet/seed";
import { copycat, faker } from '@snaplet/copycat'

const endpoints = [
    '/test'
];

const permissions = [
    'test'
];

const roles = [
    'admin',
    'user'
];

// Snaplet types
// https://github.com/snaplet/copycat?tab=readme-ov-file

const main = async () => {

    console.log("Creating seed client...");

    const seed = await createSeedClient();

    console.log("Seeding the database...");

    // Truncate all tables in the database
    // await seed.$resetDatabase();
    try {
        await seed.$resetDatabase();
    }
    catch (error) {
        // ignore
    }

    /**
     * Permissions
     */
    const { permission } = await seed.permission(x => x(permissions.length, ({ index }) => ({
        permission: permissions[index],
        description: faker.lorem.sentence(),
        action: copycat.oneOfString(Math.random(), ["VIEW", "EDIT", "DELETE", "CREATE", "MANAGE"]) as "VIEW" | "EDIT" | "DELETE" | "CREATE" | "MANAGE",
        _EndpointsToPermission: (x) => x(endpoints.length, ({ index }) => ({
            /**
             * Endpoints
             */
            Endpoints: {
                endpoint: endpoints[index]
            }
        })),
    })));

    /**
     * Roles
     */
    const { role } = await seed.role(x => x(roles.length, ({ index }) => ({
        roleName: roles[index],
    })), { connect: { permission } });

    /**
     * Trainers
     */
    await seed.trainer(x => x(3, () => ({
        /**
         * Users
         */
        users: (x) => x({ min: 2, max: 8 }, () => ({
            email: faker.internet.email(),
            password: faker.internet.password() + "_now",
            /**
             * UserRoles
             */
            userRoles: (x) => x({ min: 1, max: 2 })
        }))
    })), { connect: { role } });

    console.log("Database seeded successfully!");

    process.exit();
};

main();

// npx prisma db seed