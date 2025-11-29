import { pb } from '../lib/pocketbase.js';
import 'dotenv/config';

const createCollection = async () => {
    try {
        const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
        const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
            console.error('Please set POCKETBASE_ADMIN_EMAIL and POCKETBASE_ADMIN_PASSWORD in .env');
            process.exit(1);
        }

        console.log('Authenticating as admin...');
        await pb.admins.authWithPassword(adminEmail, adminPassword);

        const collectionName = 'ServerToken';

        try {
            await pb.collections.getFirstListItem(`name="${collectionName}"`);
            console.log(`Collection '${collectionName}' already exists.`);
        } catch (e) {
            console.log(`Collection '${collectionName}' not found. Creating...`);
            await pb.collections.create({
                name: collectionName,
                type: 'base',
                schema: [
                    {
                        name: 'token',
                        type: 'text',
                        required: true,
                        unique: true
                    },
                    {
                        name: 'generated_from',
                        type: 'select',
                        required: true,
                        options: {
                            values: ['SERVER', 'CLIENT', 'ADMIN_PANEL']
                        }
                    },
                    {
                        name: 'created_by_user_id',
                        type: 'text',
                        required: false
                    },
                    {
                        name: 'expires_at',
                        type: 'date',
                        required: false
                    }
                ]
            });
            console.log(`Collection '${collectionName}' created successfully.`);
        }

    } catch (error) {
        console.error('Error initializing PocketBase:', error);
    }
};

createCollection();
