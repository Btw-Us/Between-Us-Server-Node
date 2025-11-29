import { GeneratedFrom, ServerTokenCollectionSchema, type ServerToken } from './server.model.js';
import { createBaseCollectionIfNotExists } from "../../lib/createCollection.js";
// import { CollectionName } from '../../utils/collectionName.js';
import { pb } from '../../lib/pocketbase.js';

export class ServerService {

    constructor() {
        this.init();
    }

    private async init() {
        try {
            await createBaseCollectionIfNotExists(
                "test",
                ServerTokenCollectionSchema,
                {
                    listRule: '',  // Public read (or set to null for admin-only)
                    viewRule: '',  // Public read (or set to null for admin-only)
                    createRule: '', // Public create (or customize as needed)
                    updateRule: null, // Admin only
                    deleteRule: null  // Admin only
                }
            );
        } catch (error) {
            console.error('Error creating base collection:', error);
            throw new Error(`Failed to initialize ServerService: ${(error as Error).message || error}`);
        }
    }

    async createServerToken(generatedFrom: GeneratedFrom, expiresAt?: string) {
        const tokenData = {
            token: crypto.randomUUID(),
            generated_from: generatedFrom,
            expires_at: expiresAt || null
        };
        try {
            const record = await pb.collection("test").create(tokenData);
            return record;
        } catch (error) {
            console.error('PocketBase create error:', error);
            throw new Error(`Failed to create server token: ${(error as Error).message || error}`);
        }
    }
}