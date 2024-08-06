/**
 * ! Executing this script will delete all data in your database and seed it with 10 versions.
 * ! Make sure to adjust the script to your needs.
 * Use any TypeScript runner to run this script, for example: `npx tsx seed.ts`
 * Learn more about the Seed Client by following our guide: https://docs.snaplet.dev/seed/getting-started
 */
import { type ResourceEnum, PermissionActionEnum, ProgramTypeEnum, createSeedClient } from "@snaplet/seed";
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

// temporarily import exercise data
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const exercises = (require('./data/exercises.json')).data.map((exercise: any) => ({
    name: exercise.name,
    bodyPart: exercise.bodypart,
    category: exercise.category,
    aliases: exercise.aliases,
    iconUrl: `https://fp-dashboard.pages.dev/images/exercises/${exercise.name_url}.png`
}));


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
    const { exercise } = await seed.exercise(x => x(exercises.length, ({ index }) => ({
        name: exercises[index].name,
        bodyPart: exercises[index].bodyPart,
        category: exercises[index].category,
        aliases: exercises[index].aliases,
        iconUrl: exercises[index].iconUrl
    })));

    /**
     * Programs
     */
    console.log('Seeding programs...');
    const { program } = await seed.program(x => x(10, () => ({
        type: copycat.oneOfString(Math.random(), ["LIBRARY", "CUSTOM"]) as ProgramTypeEnum,
        name: faker.lorem.words(2),
        description: faker.lorem.sentence(),
        /**
         * Program Exercises
         */
        programExercises: (x: any) => x({ min: 8, max: 16 }, ({ index }: { index: number }) => ({
            order: index,
            sets: copycat.int(Math.random(), { min: 1, max: 5 }),
            reps: copycat.int(Math.random(), { min: 1, max: 20 }),
            duration: copycat.int(Math.random(), { min: 1, max: 60 }),
            notes: faker.lorem.sentence(),
        }), { connect: { exercise } })
    })), { connect: { exercise } });

    /**
     * Trainers
     */
    console.log('Seeding trainers...');
    await seed.trainer(x => x(3, () => ({
        businessName: faker.company.name(),
        authorizedUserIds: [],
        /**
         * Users
         */
        users: (x: any) => x({ min: 3, max: 6 }, () => ({
            email: faker.internet.email(),
            id: faker.string.uuid(),
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            phoneNumber: faker.phone.number(),
            country: faker.location.country(),

            /**
             * UserRoles
             */
            userRoles: (x: any) => x({ min: 1, max: 2 }),
            /**
             * UserPrograms
             */
            userProgram: (x: any) => x(1)
        }), { connect: program }),
        /**
         * TrainerPrograms
         */
        trainerPrograms: (x: any) => x({ min: 2, max: 5 })
    })), { connect: { role } });

    console.log("Database seeded successfully!");

    process.exit();
};

main();

// npx prisma db seed