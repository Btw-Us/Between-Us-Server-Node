import { pb } from '../lib/pocketbase.js';

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

export async function createBaseCollectionIfNotExists(
    collectionName: string,
    schema: any[],
    rules?: {
        listRule?: string | null;
        viewRule?: string | null;
        createRule?: string | null;
        updateRule?: string | null;
        deleteRule?: string | null;
    }
) {
    await authenticateAdminIfNeeded();

    // Check if collection exists
    try {
        const existing = await pb.collections.getOne(collectionName);
        // If collection exists, ensure required schema fields are present. If any are missing, update the collection.
        if (Array.isArray(schema) && Array.isArray(existing.schema)) {
            const existingNames = new Set(existing.schema.map((f: any) => f.name));
            const missingFields = schema.filter((f: any) => !existingNames.has(f.name));
            if (missingFields.length > 0) {
                const mergedSchema = [...existing.schema, ...missingFields];
                try {
                    await pb.collections.update(existing.id, { schema: mergedSchema });
                } catch (updateErr) {
                    throw new Error(
                        `Failed to update collection "${collectionName}" schema: ${((updateErr as Error).message) || updateErr}`,
                    );
                }
            }
        }
        return;
    } catch (err: any) {
        if (!err?.status || err.status !== 404) {
            throw new Error(
                `Failed to check collection "${collectionName}": ${err?.message || err}`,
            );
        }
    }

    // Create base collection
    try {
        await pb.collections.create({
            name: collectionName,
            type: 'base',
            listRule: rules?.listRule ?? '',
            viewRule: rules?.viewRule ?? '',
            createRule: rules?.createRule ?? '',
            updateRule: rules?.updateRule ?? '',
            deleteRule: rules?.deleteRule ?? '',
            schema,
        });
    } catch (error) {
        throw new Error(
            `Failed to create collection "${collectionName}": ${(error as Error).message || error}`,
        );
    }
}


export const defaultAuthCollectionRules = {
    listRule: '@request.auth.id != ""',
    viewRule: '@request.auth.id != ""',
    createRule: '@request.auth.id != ""',
    updateRule: '@request.auth.id != ""',
    deleteRule: '@request.auth.id != ""',
};

// q: What if I want to change the only viewRule and keep others default?
// a: You can spread the defaultAuthCollectionRules and override the viewRule like this:
//    {
//        ...defaultAuthCollectionRules,
//        viewRule: 'your custom rule here'
//    }

export async function createAuthCollectionIfNotExists(
    collectionName: string,
    schema: any[],
    rules = defaultAuthCollectionRules,
) {
    await authenticateAdminIfNeeded();
    // Check if collection exists
    try {
        await pb.collections.getOne(collectionName);
        // If no error, collection already exists; nothing to do
        return;
    } catch (err: any) {
        // If it's NOT a "not found" error, rethrow
        if (!err?.status || err.status !== 404) {
            throw new Error(
                `Failed to check collection "${collectionName}": ${err?.message || err}`,
            );
        }
    }
    // Create auth collection
    try {
        await pb.collections.create({
            name: collectionName,
            type: 'auth',
            ...rules,
            schema,
        });
    } catch (error) {
        throw new Error(
            `Failed to create collection "${collectionName}": ${(error as Error).message || error}`,
        );
    }
}