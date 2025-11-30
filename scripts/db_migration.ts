import PocketBase from 'pocketbase';
import 'dotenv/config';
import { CollectionName } from "../src/utils/collectionName.js";
const url = process.env.POCKETBASE_URL || "http://localhost:3001";
export const pb = new PocketBase(url);

let isAdminAuthenticated = false;

export async function authenticateAdminIfNeeded() {
    try {
        if (isAdminAuthenticated) {
            isAdminAuthenticated = true;
            console.log("✅ Admin already authenticated");
            return
        }
        const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
        const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
            throw new Error(
                'Admin credentials are not set. Please provide POCKETBASE_ADMIN_EMAIL and POCKETBASE_ADMIN_PASSWORD in environment variables.',
            );
        }

        pb.autoCancellation(false);
        await pb.collection('_superusers').authWithPassword(adminEmail, adminPassword);
        console.log("✅ Admin authenticated successfully");
        isAdminAuthenticated = true;
    } catch (error) {
        console.error("❌ Admin auth failed:", error);
        throw new Error(`Failed to authenticate as admin: ${(error as Error).message || error}`);
    }
}

// Helper to print specific validation errors from PocketBase
function logErrorDetails(collectionName: string, error: any) {
    console.error(`❌ Failed to create ${collectionName}:`);
    if (error?.response?.data) {
        console.error("   Validation Details:", JSON.stringify(error.response.data, null, 2));
    } else {
        console.error("   Error:", error.message || error);
    }
}


async function checkCollectionExists(collectionName: string): Promise<boolean> {
    try {
        await pb.collections.getOne(collectionName);
        return true;
    } catch (err: any) {
        return err?.status === 404;
    }
}



async function createAllAppCollections() {
    try {
        // 1. Authenticate FIRST
        await authenticateAdminIfNeeded();

        // 2. Safely delete default "users" collection
        try {
            const defaultUsersExists = await checkCollectionExists("users");
            // Only delete if our custom collection name isn't also "users"
            if (defaultUsersExists && (CollectionName.Users as string) !== 'users') {
                await pb.collections.delete("users");
                console.log('🗑️ Deleted default "users" collection');
            }
        } catch (error: any) {
            console.log("⚠️ Could not delete default users collection (may not exist):", error.status);
        }

        // 3. Create collections in proper order
        const collectionsToCreate = [
            { name: CollectionName.ServerTokens, fn: createServerDatabase },
            { name: CollectionName.DeviceDetails, fn: createDeviceDetailsCollection },
            { name: CollectionName.FriendRequest, fn: createFriendRequestCollection },
            { name: CollectionName.UserFriendList, fn: createFriendsListCollection },
            { name: CollectionName.Users, fn: createUserAuthCollection }
        ];

        for (const { name, fn } of collectionsToCreate) {
            console.log(`🟡 Creating ${name}...`);
            try {
                await fn();
            } catch (error: any) {
                // FIX: Check for specific "name exists" validation error
                const isNameConflict = error?.response?.data?.name?.code === 'validation_collection_name_exists';

                // If it's a 409 OR a name validation conflict, we treat it as "Already exists"
                if (error?.status === 409 || isNameConflict) {
                    console.log(`ℹ️ ${name} already exists, skipping creation.`);
                } else {
                    // It's a real error (e.g., invalid field definition), so we crash
                    logErrorDetails(name, error);
                    throw error;
                }
            }
        }

        // 4. Setup relations
        console.log("🔗 Setting up relations...");
        await setupRelations();

        console.log("✅ All collections and relations created successfully!");
    } catch (error) {
        console.error("❌ Fatal error during initialization:", error);
        process.exit(1);
    }
}

async function createServerDatabase() {
    // FIX: Ensure name is valid (lowercase/snake_case)
    const name = CollectionName.ServerTokens;

    const base = await pb.collections.create({
        name: name,
        type: 'base',
        listRule: null,
        viewRule: null,
        createRule: '',
        updateRule: null,
        deleteRule: null,
        fields: [
            {
                name: 'generated_from',
                type: 'select',
                required: true,
                // FIX: Updated structure for Select fields
                maxSelect: 1,
                values: ['SERVER', 'CLIENT', 'ADMIN_PANEL']
            },
            { name: 'token', type: 'text', required: true },
            { name: 'expires_at', type: 'date', required: false }
        ]
    });
    console.log("✅ ServerTokens created:", base.name);
}

async function createDeviceDetailsCollection() {
    const collectionName = CollectionName.DeviceDetails;
    const deviceCollection = await pb.collections.create({
        name: collectionName,
        type: 'base',
        listRule: '@request.auth.uid != ""',
        viewRule: '@request.auth.uid != ""',
        createRule: '@request.auth.uid != ""',
        updateRule: '@request.auth.uid != ""',
        deleteRule: null,
        fields: [
            { name: 'deviceId', type: 'text', required: true, max: 36 },
            { name: 'deviceName', type: 'text', required: true },
            { name: 'uid', type: 'text', required: true, max: 36 },
            { name: 'created', type: 'autodate', onCreate: true },
            { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
            { name: 'lastLoginAt', type: 'date' } // Changed from autodate to date for manual control if needed
        ],
        indexes: [
            `CREATE UNIQUE INDEX idx_deviceId ON ${collectionName} (deviceId)`,
            `CREATE UNIQUE INDEX idx_deviceName ON ${collectionName} (deviceName)`,
            `CREATE UNIQUE INDEX idx_uid_deviceId ON ${collectionName} (uid, deviceId)`
        ],
        system: false
    });
    console.log("✅ DeviceDetails created:", deviceCollection.name);
}

async function createFriendRequestCollection() {
    const collectionName = CollectionName.FriendRequest;
    await pb.collections.create({
        name: collectionName,
        type: 'base',
        listRule: '@request.auth.uid != ""',
        viewRule: '@request.auth.uid != ""',
        createRule: '@request.auth.uid != ""',
        updateRule: '@request.auth.uid != ""',
        deleteRule: null,
        fields: [
            { name: 'senderuid', type: 'text', required: true, max: 36 },
            { name: 'revieveruid', type: 'text', required: true, max: 36 },
            {
                name: 'state',
                type: 'select',
                required: false,
                // FIX: Updated structure for Select fields
                maxSelect: 1,
                values: ['accept', 'decline']
            },
            { name: 'created', type: 'autodate', onCreate: true },
            { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true }
        ],
        indexes: [
            `CREATE UNIQUE INDEX idx_senderuid ON ${collectionName} (senderuid)`,
            `CREATE UNIQUE INDEX idx_revieweruid ON ${collectionName} (revieveruid)`,
            `CREATE UNIQUE INDEX idx_state ON ${collectionName} (state)`,
            `CREATE UNIQUE INDEX idx_revieweruid_senderuid_state ON ${collectionName} (revieveruid, senderuid, state)`,
        ],
        system: false
    });
    console.log("✅ FriendRequest created:", collectionName);
}

async function createFriendsListCollection() {
    const collectionName = CollectionName.UserFriendList;
    await pb.collections.create({
        name: collectionName,
        type: 'base',
        listRule: '@request.auth.uid != ""',
        viewRule: '@request.auth.uid != ""',
        createRule: '@request.auth.uid != ""',
        updateRule: '@request.auth.uid != ""',
        deleteRule: null,
        fields: [
            { name: 'useruid', type: 'text', required: true, max: 36 },
            { name: 'frienduid', type: 'text', required: true, max: 36 },
            { name: 'chat_room_id', type: 'text', required: false },
            { name: 'created', type: 'autodate', onCreate: true },
            { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true }
        ],
        indexes: [
            `CREATE UNIQUE INDEX idx_user_friend ON ${collectionName} (useruid, frienduid)`,
            `CREATE UNIQUE INDEX idx_chat_room ON ${collectionName} (chat_room_id)`,
            `CREATE UNIQUE INDEX idx_chat_user_friend ON ${collectionName} (chat_room_id, frienduid, useruid)`,
            `CREATE UNIQUE INDEX idx_useruid ON ${collectionName} (useruid)`,
            `CREATE UNIQUE INDEX idx_frienduid ON ${collectionName} (frienduid)`
        ],
        system: false
    });
    console.log("✅ FriendsList created:", collectionName);
}

async function createUserAuthCollection() {
    const collectionName = CollectionName.Users;
    await pb.collections.create({
        name: collectionName,
        type: 'auth',
        listRule: '@request.auth.uid != ""',
        viewRule: '@request.auth.uid != ""',
        createRule: '',
        updateRule: '@request.auth.uid != ""',
        deleteRule: null,
        fields: [
            { name: 'uid', type: 'text', required: true, max: 36 },
            { name: 'fullname', type: 'text', required: false, max: 100 },
            { name: 'username', type: 'text', required: true, max: 10 },
            { name: 'created', type: 'autodate', onCreate: true },
            { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true }
        ],
        indexes: [
            `CREATE UNIQUE INDEX idx_uid ON ${collectionName} (uid)`,
            `CREATE UNIQUE INDEX idx_email ON ${collectionName} (email)`,
            `CREATE UNIQUE INDEX idx_username ON ${collectionName} (username)`,
            `CREATE UNIQUE INDEX idx_uid_email ON ${collectionName} (uid, email)`,
            `CREATE UNIQUE INDEX idx_email_password ON ${collectionName} (email, password)`,
        ],
        system: false,
        passwordAuth: { enabled: true, identityFields: ['email'] }
    });
    console.log("✅ Users auth collection created:", collectionName);
}

export async function setupRelations() {
    try {
        // Get collection IDs
        const usersCollection = await pb.collections.getOne(CollectionName.Users);
        const deviceCollection = await pb.collections.getOne(CollectionName.DeviceDetails);
        const friendRequestCollection = await pb.collections.getOne(CollectionName.FriendRequest);
        const friendsListCollection = await pb.collections.getOne(CollectionName.UserFriendList);

        // Update Users collection with relation fields
        // We fetch existing fields to avoid overwriting them accidentally
        const currentFields = usersCollection.fields || [];

        // Remove existing relation fields if they exist to prevent duplicates
        const baseFields = currentFields.filter((f: any) =>
            !['devicedetails', 'friendslist', 'friendsrequestlist'].includes(f.name)
        );

        await pb.collections.update(usersCollection.id, {
            fields: [
                ...baseFields,
                {
                    name: 'devicedetails',
                    type: 'relation',
                    collectionId: deviceCollection.id,
                    maxSelect: 1,
                    cascadeDelete: false,
                    required: false,
                    system: false
                },
                {
                    name: 'friendslist',
                    type: 'relation',
                    collectionId: friendsListCollection.id,
                    maxSelect: 10000000000000000,
                    cascadeDelete: false,
                    required: false,
                    system: false
                },
                {
                    name: 'friendsrequestlist',
                    type: 'relation',
                    collectionId: friendRequestCollection.id,
                    maxSelect: 10000000000000000,
                    cascadeDelete: false,
                    required: false,
                    system: false
                }
            ]
        });

        console.log("✅ Relations configured successfully!");
    } catch (error: any) {
        logErrorDetails("Relations", error);
    }
}




createAllAppCollections();
// }