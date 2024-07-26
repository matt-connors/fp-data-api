/**
 * ! Executing this script will delete all data in your database and seed it with 10 versions.
 * ! Make sure to adjust the script to your needs.
 * Use any TypeScript runner to run this script, for example: `npx tsx seed.ts`
 * Learn more about the Seed Client by following our guide: https://docs.snaplet.dev/seed/getting-started
 */
import { type ResourceEnum, PermissionActionEnum, createSeedClient } from "@snaplet/seed";
import { copycat, faker } from '@snaplet/copycat'

// const _endpoints = [
//     '/test-a',
//     '/test-b',
// ];

const _permissions = [
    'TEST',
    'TEST2',
];

const _roles = [
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
    console.log('Seeding permissions...');
    const { permission } = await seed.permission(x => x(_permissions.length, ({ index }) => ({
        description: copycat.sentence(index),
        action: "VIEW" as PermissionActionEnum, // copycat.oneOfString(Math.random(), ["VIEW", "EDIT", "DELETE", "CREATE", "MANAGE"])
        resource: _permissions[index] as ResourceEnum
    })));

    /**
     * Roles
     */
    console.log('Seeding roles...');
    const { role } = await seed.role(x => x(_roles.length, ({ index }) => ({
        roleName: _roles[index],
        _PermissionToRole: (x) => x({ min: 1, max: _permissions.length })
    })), { connect: { permission } });

    /**
     * Trainers
     */
    console.log('Seeding trainers...');
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