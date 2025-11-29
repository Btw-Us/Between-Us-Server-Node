import PocketBase from 'pocketbase';
import 'dotenv/config';
import { CollectionName } from "../utils/collectionName.js";

const url = process.env.POCKETBASE_URL || 'http://localhost:3001';
export const pb = new PocketBase(url);


export async function authenticateAdminIfNeeded() {
    try {
        const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
        const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
            throw new Error(
                'Admin credentials are not set. Please provide POCKETBASE_ADMIN_EMAIL and POCKETBASE_ADMIN_PASSWORD in environment variables.',
            );
        }

        await pb.collection('_superusers').authWithPassword(adminEmail, adminPassword);
    } catch (error) {
        throw new Error(`Failed to authenticate as admin: ${(error as Error).message || error}`);
    }
}

async function init() {
    try {
        await authenticateAdminIfNeeded();
        const exists = await checkCollectionExists(CollectionName.ServerTokens);
        if (!exists) {
            await createServerDatabase();
        }
        const userDbExists = await checkCollectionExists(CollectionName.User);
        if (!userDbExists) {
            await createUserAuthCollection();
        }

        const deviceDetailsExists = await checkCollectionExists(CollectionName.DeviceDetails);
        if (!deviceDetailsExists) {
            await createDeviceDetailsCollection();
        }

        
    } catch (error) {
        console.error("Error during PocketBase initialization:", error);
    }
}

init();


function checkCollectionExists(collectionName: string): Promise<boolean> {
    return pb.collections.getOne(collectionName)
        .then(() => true)
        .catch((err: any) => {
            if (err?.status === 404) {
                return false;
            }
            throw new Error(`Failed to check collection "${collectionName}": ${err?.message || err}`);
        });
}


async function createServerDatabase() {
    try {
       
        const base = await pb.collections.create({
            name: CollectionName.ServerTokens,
            type: 'base',
            createRule: '',
            updateRule: null,
            deleteRule: null,
            listRule: null,
            viewRule: null,
            fields: [
                {
                    name: 'generated_from',
                    type: 'select',
                    required: true,
                    maxSelect: 1,
                    values: [
                        'SERVER',
                        'CLIENT',
                        'ADMIN_PANEL'
                    ]
                },
                // token field (text field)
                {
                    name: 'token',
                    type: 'text',
                    required: true
                },
                // expires_at field (datetime field - optional)
                {
                    name: 'expires_at',
                    type: 'date', // PocketBase uses 'date' for datetime
                    required: false // makes it optional
                }
            ],
        });
        console.log("PocketBase initialized with base:", base);
    } catch (error) {
        console.error("Error initializing PocketBase:", error);
        throw new Error(`Failed to initialize PocketBase: ${(error as Error).message || error}`);
    }
}


async function createUserAuthCollection(): Promise<void> {
    try {
        const collectionName = CollectionName.User; // or "users"

        // Check if collection already exists
        const exists = await checkCollectionExists(collectionName);
        if (exists) {
            console.log(`Collection "${collectionName}" already exists, skipping creation.`);
            return;
        }

        // Create the users (auth) collection with all exact specifications
        const userCollection = await pb.collections.create({
            name: collectionName,
            type: 'auth',
            listRule: '@request.auth.uid != ""',
            viewRule: '@request.auth.uid != ""',
            createRule: '@request.auth.uid != ""',
            updateRule: '@request.auth.uid != ""',
            deleteRule: null,
            fields: [
                // Custom uid field (non-system)
                {
                    name: 'uid',
                    type: 'text',
                    required: true,
                    max: 36,
                    min: 0,
                    pattern: '',
                    autogeneratePattern: '',
                    hidden: false,
                    presentable: false,
                    primaryKey: false,
                    system: false,
                },
                {
                    name: 'created',
                    type: 'autodate',
                    required: false,
                    hidden: false,
                    presentable: false,
                    system: false,
                    onCreate: true,
                    onUpdate: false,
                },
                {
                    name: 'updated',
                    type: 'autodate',
                    required: false,
                    hidden: false,
                    presentable: false,
                    system: false,
                    onCreate: true,
                    onUpdate: true,
                }
                // PocketBase auto-creates system auth fields: id, password, tokenKey, email, 
                // emailVisibility, verified with exact specs from your JSON
            ],
            indexes: [
                `CREATE UNIQUE INDEX idx_tokenKey_c9nw1nmuhs ON ${collectionName} (tokenKey)`,
                `CREATE UNIQUE INDEX idx_email_c9nw1nmuhs ON ${collectionName} (email) WHERE email != ''`,
                `CREATE UNIQUE INDEX idx_MkNFR46IPG ON ${collectionName} (uid)`,
                `CREATE INDEX idx_3eKKoBSr7w ON ${collectionName} (password, email)`
            ],
            system: false,
            // Auth configurations
            authRule: '',
            manageRule: null,
            authAlert: {
                enabled: true,
                emailTemplate: {
                    subject: 'Login from a new location',
                    body: `<p>Hello,</p>
<p>We noticed a login to your {APP_NAME} account from a new location:</p>
<p><em>{ALERT_INFO}</em></p>
<p><strong>If this wasn't you, you should immediately change your {APP_NAME} account password to revoke access from all other locations.</strong></p>
<p>If this was you, you may disregard this email.</p>
<p>
  Thanks,<br/>
  {APP_NAME} team
</p>`
                }
            },
            oauth2: {
                enabled: false,
                mappedFields: {
                    id: '',
                    name: '',
                    username: '',
                    avatarURL: ''
                }
            },
            passwordAuth: {
                enabled: true,
                identityFields: ['email']
            },
            mfa: {
                enabled: false,
                duration: 1800,
                rule: ''
            },
            otp: {
                enabled: true,
                duration: 180,
                length: 8,
                emailTemplate: {
                    subject: 'OTP for {APP_NAME}',
                    body: `<p>Hello,</p>
<p>Your one-time password is: <strong>{OTP}</strong></p>
<p><i>If you didn't ask for the one-time password, you can ignore this email.</i></p>
<p>
  Thanks,<br/>
  {APP_NAME} team
</p>`
                }
            },
            authToken: {
                duration: 604800
            },
            passwordResetToken: {
                duration: 1800
            },
            emailChangeToken: {
                duration: 1800
            },
            verificationToken: {
                duration: 259200
            },
            fileToken: {
                duration: 180
            },
            verificationTemplate: {
                subject: 'Verify your {APP_NAME} email',
                body: `<p>Hello,</p>
<p>Thank you for joining us at {APP_NAME}.</p>
<p>Click on the button below to verify your email address.</p>
<p>
  <a class="btn" href="{APP_URL}/_/#/auth/confirm-verification/{TOKEN}" target="_blank" rel="noopener">Verify</a>
</p>
<p>
  Thanks,<br/>
  {APP_NAME} team
</p>`
            },
            resetPasswordTemplate: {
                subject: 'Reset your {APP_NAME} password',
                body: `<p>Hello,</p>
<p>Click on the button below to reset your password.</p>
<p>
  <a class="btn" href="{APP_URL}/_/#/auth/confirm-password-reset/{TOKEN}" target="_blank" rel="noopener">Reset password</a>
</p>
<p><i>If you didn't ask to reset your password, you can ignore this email.</i></p>
<p>
  Thanks,<br/>
  {APP_NAME} team
</p>`
            },
            confirmEmailChangeTemplate: {
                subject: 'Confirm your {APP_NAME} new email address',
                body: `<p>Hello,</p>
<p>Click on the button below to confirm your new email address.</p>
<p>
  <a class="btn" href="{APP_URL}/_/#/auth/confirm-email-change/{TOKEN}" target="_blank" rel="noopener">Confirm new email</a>
</p>
<p><i>If you didn't ask to change your email address, you can ignore this email.</i></p>
<p>
  Thanks,<br/>
  {APP_NAME} team
</p>`
            }
        });

        console.log(`✅ User auth collection "${collectionName}" created successfully:`, userCollection);
    } catch (error) {
        if ((error as any)?.status === 409) {
            console.log(`Collection "${CollectionName.User}" already exists (409).`);
            return;
        }
        console.error("❌ Failed to create User auth collection:", error);
        throw new Error(`Failed to create User auth collection: ${(error as Error).message || error}`);
    }
}


async function createDeviceDetailsCollection(): Promise<void> {
    try {
        const collectionName = CollectionName.DeviceDetails; 
        const exists = await checkCollectionExists(collectionName);
        if (exists) {
            console.log(`Collection "${collectionName}" already exists, skipping creation.`);
            return;
        }

        // Create the UserDevice (base) collection
        const deviceCollection = await pb.collections.create({
            name: collectionName,
            type: 'base',
            listRule: null,
            viewRule: '@request.auth.uid != ""',
            createRule: '@request.auth.uid != ""',
            updateRule: '@request.auth.uid != ""',
            deleteRule: null,
            fields: [
                {
                    name: 'deviceId',
                    type: 'text',
                    required: true,
                    max: 36,
                    min: 0,
                    pattern: '',
                    autogeneratePattern: '',
                    hidden: false,
                    presentable: false,
                    primaryKey: false,
                    system: false,
                },
                {
                    name: 'deviceName',
                    type: 'text',
                    required: true,
                    max: 0,
                    min: 0,
                    pattern: '',
                    autogeneratePattern: '',
                    hidden: false,
                    presentable: false,
                    primaryKey: false,
                    system: false,
                },
                {
                    name: 'uuid',
                    type: 'text',
                    required: true,
                    max: 36,
                    min: 0,
                    pattern: '',
                    autogeneratePattern: '',
                    hidden: false,
                    presentable: false,
                    primaryKey: false,
                    system: false,
                },
                {
                    name: 'created',
                    type: 'autodate',
                    required: false,
                    hidden: false,
                    presentable: false,
                    system: false,
                    onCreate: true,
                    onUpdate: false,
                },
                {
                    name: 'updated',
                    type: 'autodate',
                    required: false,
                    hidden: false,
                    presentable: false,
                    system: false,
                    onCreate: true,
                    onUpdate: true,
                },
                {
                    name: 'lastLoginAt',
                    type: 'autodate',
                    required: false,
                    hidden: false,
                    presentable: false,
                    system: false,
                    onCreate: true,
                    onUpdate: true,
                },
            ],
            indexes: [
                `CREATE UNIQUE INDEX idx_nbFzBiXXVC ON ${collectionName} (deviceId)`,
                `CREATE UNIQUE INDEX idx_ahd9NSmWZR ON ${collectionName} (uuid)`,
                `CREATE UNIQUE INDEX idx_zpzHlKXFF8 ON ${collectionName} (deviceId, uuid)`
            ],
            system: false,
        });

        console.log(`✅ DeviceDetails collection "${collectionName}" created successfully:`, deviceCollection);
    } catch (error) {
        if ((error as any)?.status === 409) {
            console.log(`Collection "${CollectionName.DeviceDetails}" already exists (409).`);
            return;
        }
        console.error("❌ Failed to create DeviceDetails collection:", error);
        throw new Error(`Failed to create DeviceDetails collection: ${(error as Error).message || error}`);
    }
}
