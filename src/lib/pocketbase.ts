import PocketBase from 'pocketbase';
import 'dotenv/config';

const url = process.env.POCKETBASE_URL || "http://localhost:3001";
export const pb = new PocketBase(url);



export async function authenticateAdminIfNeeded() : Promise<boolean> {
    try {
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
        return true;
    } catch (error) {
        console.error("❌ Admin auth failed:", error);
        throw new Error(`Failed to authenticate as admin: ${(error as Error).message || error}`);
    }
}
