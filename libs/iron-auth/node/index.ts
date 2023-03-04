import { Crypto } from '@peculiar/webcrypto';
import { getCrypto } from './webcrypto';

getCrypto(new Crypto());

export * from '../src';
