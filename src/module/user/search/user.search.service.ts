import { pb } from '../../../lib/pocketbase.js';
import { CollectionName } from '../../../utils/collectionName.js';

export class UserSearchService {
    // Ensure you call this with page=1 from your controller
    async searchUsers(query: string, page: number = 0, perPage: number = 10) {
        try {
            const filter = `username ~ "%${query}%"`;
            const users = await pb.collection(CollectionName.Users)
                .getList(page, perPage,{
                    filter: filter,
                    sort: '-created',
                    expand: ''
                });
            return users;
        } catch (error) {
            console.error('User search failed:', error);
            return [];
        }
    }

}