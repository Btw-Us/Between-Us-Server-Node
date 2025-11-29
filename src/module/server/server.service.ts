import { GeneratedFrom } from './server.model.js';
import { CollectionName } from '../../utils/collectionName.js';
import { pb } from '../../lib/pocketbase.js';

export class ServerService {
    async createServerToken(generatedFrom: GeneratedFrom, expiresAt?: string) {
        const tokenData = {
            token: crypto.randomUUID(),
            generated_from: generatedFrom,
            expires_at: expiresAt || null
        };
        try {
            const record = await pb.collection(CollectionName.ServerTokens).create(tokenData);
            return record;
        } catch (error) {
            console.error('PocketBase create error:', error);
            throw new Error(`Failed to create server token: ${(error as Error).message || error}`);
        }
    }
}