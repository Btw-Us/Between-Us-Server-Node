import PocketBase from 'pocketbase';
import 'dotenv/config';
import { CollectionName } from "../utils/collectionName.js";

const url = process.env.POCKETBASE_URL || 'http://localhost:3001';
export const pb = new PocketBase(url);


async function authenticateAdminIfNeeded() {
    try {
        const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
        const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
            throw new Error(
                'Admin credentials are not set. Please provide POCKETBASE_ADMIN_EMAIL and POCKETBASE_ADMIN_PASSWORD in environment variables.',
            );
        }

        await pb.collection('_superusers').authWithPassword(adminEmail, adminPassword);
    } catch (error) {
        throw new Error(`Failed to authenticate as admin: ${(error as Error).message || error}`);
    }
}

async function init() {
    try {
        await authenticateAdminIfNeeded();
        const exists = await checkCollectionExists(CollectionName.ServerTokens);
        if (!exists) {
            await createServerDatabase();
        }
    } catch (error) {
        console.error("Error during PocketBase initialization:", error);
    }
}

init();


function checkCollectionExists(collectionName: string): Promise<boolean> {
    return pb.collections.getOne(collectionName)
        .then(() => true)
        .catch((err: any) => {
            if (err?.status === 404) {
                return false;
            }
            throw new Error(`Failed to check collection "${collectionName}": ${err?.message || err}`);
        });
}


async function createServerDatabase() {
    try {
        const base = await pb.collections.create({
            name: CollectionName.ServerTokens,
            type: 'base',
            createRule: '',
            updateRule: null,
            deleteRule: null,
            listRule: null,
            viewRule: null,
            fields: [
                {
                    name: 'generated_from',
                    type: 'select',
                    required: true,
                    maxSelect: 1,
                    values: [
                        'SERVER',
                        'CLIENT',
                        'ADMIN_PANEL'
                    ]
                },
                // token field (text field)
                {
                    name: 'token',
                    type: 'text',
                    required: true
                },
                // expires_at field (datetime field - optional)
                {
                    name: 'expires_at',
                    type: 'date', // PocketBase uses 'date' for datetime
                    required: false // makes it optional
                }
            ],
        });
        console.log("PocketBase initialized with base:", base);
    } catch (error) {
        console.error("Error initializing PocketBase:", error);
        throw new Error(`Failed to initialize PocketBase: ${(error as Error).message || error}`);
    }
}
