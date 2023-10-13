type Webcrypto = {
	getRandomValues: <T extends ArrayBufferView | null>(array: T) => T;
	randomUUID: () => string;
	readonly subtle: SubtleCrypto;
};

type ExtendedCryptoOptional = Crypto & { webcrypto?: Webcrypto };
type ExtendedCrypto = Crypto & { webcrypto: Webcrypto };

export const getCrypto = (fallback?: Webcrypto | undefined) => {
	if (typeof globalThis.crypto?.subtle !== 'object') {
		if (typeof (globalThis.crypto as ExtendedCryptoOptional)?.webcrypto?.subtle === 'object') {
			(globalThis.crypto as Webcrypto) = (globalThis.crypto as ExtendedCrypto).webcrypto;
		} else if (fallback) {
			(globalThis.crypto as Webcrypto) = fallback;
		} else {
			throw new Error('WebCrypto not supported');
		}
	}

	return globalThis.crypto;
};
