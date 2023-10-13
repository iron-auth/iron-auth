import { compare, compareHash, decrypt, encrypt, hash } from 'iron-auth/src/utils/encryption';
import { expect, suite, test } from 'vitest';

suite('Encryption', () => {
	test('Encrypt + decrypt work', async () => {
		const password = 'Test string';
		const passwordAlt = 'Alternative test string';

		const secret = 'Random secret';

		const { encrypted, iv, combined } = await encrypt(password, secret);
		const {
			encrypted: encryptedAlt,
			iv: ivAlt,
			combined: combinedAlt,
		} = await encrypt(passwordAlt, secret);

		expect(encrypted).not.toEqual(encryptedAlt);
		expect(iv).not.toEqual(ivAlt);
		expect(combined).not.toEqual(combinedAlt);

		expect(encrypted).not.toEqual(password);
		expect(encryptedAlt).not.toEqual(passwordAlt);

		const decrypted = await decrypt(combined, secret);
		const decryptedAlt = await decrypt(combinedAlt, secret);

		expect(decrypted).not.toEqual(decryptedAlt);

		expect(decrypted).toEqual(password);
		expect(decryptedAlt).toEqual(passwordAlt);
	});

	test('Compare encrypted strings works', async () => {
		const password = 'Test string';
		const passwordAlt = 'Alternative test string';

		const secret = 'Random secret';
		const alternativeSecret = 'Alternative secret';

		const { combined } = await encrypt(password, secret);
		expect(combined).not.toEqual(password);

		const samePassword = await compare(password, combined, secret);
		expect(samePassword).toEqual(true);

		const notSamePasswordDiffSecret = await compare(password, combined, alternativeSecret);
		expect(notSamePasswordDiffSecret).toEqual(false);

		const notSamePassword = await compare(passwordAlt, combined, secret);
		expect(notSamePassword).toEqual(false);
	});

	test('Hashing works', async () => {
		const plainText = 'Test string';
		const planTextHashed = 'a3e49d843df13c2e2a7786f6ecd7e0d184f45d718d1ac1a8a63e570466e489dd';
		const plainTextAlt = 'Alternative test string';
		const plainTextHashedAlt = '1f0c59ca205a19ae422d710bd72461aafdaedf4f91a4f27b4cd85d1ef82a23f5';

		const hashed = await hash(plainText);
		const hashedAlt = await hash(plainTextAlt);

		expect(hashed).not.toEqual(hashedAlt);

		expect(hashed).toEqual(planTextHashed);
		expect(hashedAlt).toEqual(plainTextHashedAlt);

		const sameHash = await compareHash(plainText, hashed);
		expect(sameHash).toEqual(true);

		const sameHashAlt = await compareHash(plainTextAlt, hashedAlt);
		expect(sameHashAlt).toEqual(true);

		const notSameHash = await compareHash(plainTextAlt, hashed);
		expect(notSameHash).toEqual(false);
	});
});
