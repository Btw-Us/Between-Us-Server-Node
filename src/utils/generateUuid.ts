import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';

const NAMESPACE_UUID = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

function generateUuid() {
    return uuidv4();
}

function generateUuidFromSub(name: string) {
    return generateUuidV5(name);
}

function generateUuidV5(name: string) {
    const nameBytes = Buffer.from(name, 'utf8');
    const namespaceBytes = uuidToBytes(NAMESPACE_UUID);

    const hash = createHash('sha1');
    hash.update(namespaceBytes);
    hash.update(nameBytes);
    const digest: Buffer = hash.digest();

    digest[6] = (digest[6]! & 0x0f) | 0x50;
    digest[8] = (digest[8]! & 0x3f) | 0x80;

    return bytesToUuid(digest);
}

function uuidToBytes(uuid: string) {
    const hex = uuid.replace(/-/g, '');
    return Buffer.from(hex, 'hex');
}

function bytesToUuid(bytes: Buffer) {
    const hex = bytes.toString('hex', 0, 16);
    return [
        hex.substring(0, 8),
        hex.substring(8, 12),
        hex.substring(12, 16),
        hex.substring(16, 20),
        hex.substring(20, 32)
    ].join('-');
}

export { generateUuid, generateUuidFromSub };