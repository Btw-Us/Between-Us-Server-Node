import PocketBase from 'pocketbase';
import 'dotenv/config';

const url = process.env.POCKETBASE_URL || 'http://localhost:3001';
export const pb = new PocketBase(url);
