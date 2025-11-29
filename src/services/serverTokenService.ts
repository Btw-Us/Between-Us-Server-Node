import { pb } from '../lib/pocketbase.js';
import { type ServerToken, GeneratedFrom } from '../models/serverToken.js';
import { randomUUID } from 'crypto';

const COLLECTION_NAME = 'ServerToken';

export class ServerService {
    async createServerTokken(generatedFrom: GeneratedFrom, createByUserId?: string, expriesAt?: string) {
        try {
            const token = randomUUID();
            const data: Omit<ServerToken, 'id' | 'created_at'> = {
                token,
                generated_from: generatedFrom,
                created_by_user_id: createByUserId,
                expires_at: expriesAt
            };

            console.log(`Attempting to create record in collection: ${COLLECTION_NAME}`);
            console.log('Data:', data);
            const record = await pb.collection(COLLECTION_NAME).create(data);
            return record;
        } catch (error: any) {
            console.error('PocketBase create error:', error);
            if (error.status === 404) {
                throw new Error(`Collection '${COLLECTION_NAME}' not found in PocketBase. Please create it.`);
            }
            throw error;
        }
    }

    async getServerToken(token: string) {
        try {
            const record = await pb.collection(COLLECTION_NAME).getFirstListItem(`token="${token}"`);
            return record;
        } catch (error) {
            return null;
        }
    }
}
