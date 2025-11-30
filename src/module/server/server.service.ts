import { GeneratedFrom } from './server.model.js';
import { CollectionName } from '../../utils/collectionName.js';
import { pb, authenticateAdminIfNeeded } from '../../lib/pocketbase.js';

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
    async checkIsValidServerToken(token: string): Promise<boolean> {
        try {
            await authenticateAdminIfNeeded();
            const records = await pb.collection(CollectionName.ServerTokens).getFullList({
                filter: `token="${token}"`,
                limit: 1
            });
            return records.length > 0;
        } catch (error) {
            console.error('PocketBase query error:', error);
            throw new Error(`Failed to validate server token: ${(error as Error).message || error}`);
        }
    }
}