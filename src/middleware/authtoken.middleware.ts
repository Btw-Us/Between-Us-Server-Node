import { pb } from "../lib/pocketbase.js";
import { CollectionName } from "../utils/collectionName.js";

declare global {
    namespace Express {
        interface Request {
            user?: any;
            pbToken?: string;
        }
    }
}

export async function authTokenMiddleware(req: any, res: any, next: any) {
    const token = req.headers['x-auth-token'];

    if (!token) {
        return res.status(401).json({ message: 'No auth token provided' });
    }

    // Reset auth store before applying token
    pb.authStore.clear();

    // ❗ Correct order: first save token, then refresh
    pb.authStore.save(token, null);

    // ❗ Do NOT use isValid because it checks **expiry** of the current session object,
    //    but you have not refreshed the token yet
    try {
        const authData = await pb.collection(CollectionName.Users).authRefresh();

        // Attach user + token to req
        req.user = authData.record;
        req.pbToken = authData.token; // use refreshed token, not old one

        return next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired auth token', error });
    }
}
