import { encode, decode } from 'base64-arraybuffer';

// Many thanks to the SubtleCrypto MDN docs for parts of this code.
// https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto

const getKey = async (secret: string, usage: KeyUsage[], previousIv?: Uint8Array) => {
  const encodedSecret = new TextEncoder().encode(secret);
  const hashedSecret = await crypto.subtle.digest('SHA-256', encodedSecret);

  const iv = previousIv ?? crypto.getRandomValues(new Uint8Array(12));

  const algorithm = { name: 'AES-GCM', iv };

  const key = await crypto.subtle.importKey('raw', hashedSecret, algorithm, false, usage);

  return { key, algorithm, iv };
};

export const encrypt = async (plainText: string, secret: string, previousIv?: Uint8Array) => {
  const { key, algorithm, iv } = await getKey(secret, ['encrypt'], previousIv);

  const encodedPlainText = new TextEncoder().encode(plainText);
  const encryptedBuffer = await crypto.subtle.encrypt(algorithm, key, encodedPlainText);

  const encryptedBase64 = encode(encryptedBuffer);
  const ivBase64 = encode(iv);
  const combinedBase64 = `${ivBase64}_${encryptedBase64}`;

  return { encrypted: encryptedBase64, iv: ivBase64, combined: combinedBase64 };
};

export const decrypt = async (combined: string, secret: string) => {
  const [ivBase64, encryptedBase64] = combined.split('_');

  if (!ivBase64 || !encryptedBase64) {
    throw new Error('Invalid encrypted string');
  }

  const iv = new Uint8Array(decode(ivBase64));
  const encryptedBuffer = decode(encryptedBase64);

  const { key, algorithm } = await getKey(secret, ['decrypt'], iv);

  const decryptedBuffer = await crypto.subtle.decrypt(algorithm, key, encryptedBuffer);

  const decrypted = new TextDecoder().decode(decryptedBuffer);

  return decrypted;
};

export const compare = async (plainText: string, combined: string, secret: string) => {
  const [ivBase64, encryptedBase64] = combined.split('_');

  if (!ivBase64 || !encryptedBase64) {
    throw new Error('Invalid encrypted string');
  }

  const iv = new Uint8Array(decode(ivBase64));

  const { encrypted } = await encrypt(plainText, secret, iv);

  return encrypted === encryptedBase64;
};

export const hash = async (plainText: string) => {
  const hashedBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(plainText));

  const hashedArray = Array.from(new Uint8Array(hashedBuffer));

  const hashedHex = hashedArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  return hashedHex;
};

export const compareHash = async (plainText: string, rawHash: string) => {
  const hashed = await hash(plainText);

  return hashed === rawHash;
};
