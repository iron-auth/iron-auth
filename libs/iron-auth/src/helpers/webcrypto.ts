type Webcrypto = {
  getRandomValues: <T extends ArrayBufferView | null>(array: T) => T;
  randomUUID: () => string;
  readonly subtle: SubtleCrypto;
};

type ExtendedCryptoOptional = Crypto & { webcrypto?: Webcrypto };
type ExtendedCrypto = Crypto & { webcrypto: Webcrypto };

let crypto: Webcrypto;

export const getCrypto = (fallback?: Webcrypto | undefined) => {
  if (!crypto) {
    if (typeof globalThis.crypto?.subtle === 'object') {
      crypto = globalThis.crypto;
    } else if (
      typeof (globalThis.crypto as ExtendedCryptoOptional)?.webcrypto?.subtle === 'object'
    ) {
      crypto = (globalThis.crypto as ExtendedCrypto).webcrypto;
    } else if (fallback) {
      crypto = fallback;
    } else {
      throw new Error('WebCrypto not supported');
    }

    globalThis.crypto = crypto;
  }

  return crypto;
};
