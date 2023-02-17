// eslint-disable-next-line import/no-extraneous-dependencies
import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './mock-server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
