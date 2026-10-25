import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const SECRET_KEY = process.env.IDENTITY_ENCRYPTION_KEY; 

if (!SECRET_KEY) {
  throw new Error('IDENTITY_ENCRYPTION_KEY must be set in .env (32-byte hex)');
}

const KEY_BUFFER = Buffer.from(SECRET_KEY, 'hex');

export function encryptIdentity(plainText) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY_BUFFER, iv);
  const ciphertext = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    ciphertext: ciphertext.toString('hex'),
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
  };
}

export function decryptIdentity({ ciphertext, iv, authTag }) {
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY_BUFFER, Buffer.from(iv, 'hex'));
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  const plain = Buffer.concat([
    decipher.update(Buffer.from(ciphertext, 'hex')),
    decipher.final(),
  ]);
  return plain.toString('utf8');
}

export function hashIdNumber(idNumber) {
  const pepper = process.env.ID_HASH_PEPPER || '';
  return crypto.createHash('sha256').update(idNumber + pepper).digest('hex');
}