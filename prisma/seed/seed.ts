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
     * Exercises
     */
    console.log('Seeding exercises...');
    const { exercise } = await seed.exercise(x => x(10, () => ({
        name: faker.lorem.words(2),
        bodypart: copycat.oneOfString(Math.random(), ["CHEST", "BACK", "LEGS", "ARMS", "SHOULDERS", "CORE"]),
        category: copycat.oneOfString(Math.random(), ["STRENGTH", "CARDIO", "FLEXIBILITY"]),
        aliases: [faker.lorem.word(), faker.lorem.word(), faker.lorem.word()].slice(0, Math.floor(Math.random() * 3) + 1),
    })));

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
            id: faker.string.uuid(),
            /**
             * UserRoles
             */
            userRoles: (x) => x({ min: 1, max: 2 }),
            /**
             * Programs
             */
            programs: (x: any) => x({ min: 1, max: 2 }, () => ({
                type: copycat.oneOfString(Math.random(), ["LIBRARY", "CUSTOM"]),
                name: faker.lorem.words(2),
                description: faker.lorem.sentence(),
                trainerPrograms: (x: any) => x({ min: 1, max: 2 }),
                programExercises: (x: any) => x({ min: 1, max: 5 }, () => ({
                    exercise: (x: any) => x(1),
                    order: copycat.int(Math.random(), { min: 1, max: 10 }),
                    sets: copycat.int(Math.random(), { min: 1, max: 5 }),
                    reps: copycat.int(Math.random(), { min: 1, max: 20 }),
                    duration: copycat.int(Math.random(), { min: 1, max: 60 }),
                    notes: faker.lorem.sentence(),
                }), { connect: { exercise } }),
            })),
            userProgram: (x: any) => x(1)
        }))
    })), { connect: { role } });

    /**
     * 
     */

    console.log("Database seeded successfully!");

    process.exit();
};

main();

// npx prisma db seed