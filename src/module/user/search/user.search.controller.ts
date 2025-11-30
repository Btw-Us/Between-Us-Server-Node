import { UserSearchService } from './user.search.service.js';

const userSearchService = new UserSearchService();

export async function searchUsers(req: any, res: any) {
    const query = req.query.q as string;
    const perpage = parseInt(req.query.limit as string) || 10;
    const page = parseInt(req.query.offset as string) || 0;
    if (!query) {
        return res.status(400).json({
            error: 'Bad Request',
            message: 'Missing required query parameter: q'
        });
    }
    try {
        const users = await userSearchService.searchUsers(query, page, perpage);
        res.status(200).json({
            users
        });
    } catch (error) {
        res.status(500).json({
            error: 'Server Error',
            message: `User search failed: ${(error as Error).message || error}`
        });
    }
}

// q: what will be search url ? /user/search?q=somequery&limit=10&offset=0