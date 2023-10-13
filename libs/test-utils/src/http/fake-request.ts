import { IncomingMessage } from 'http';

export type RequestOptions = {
	url?: string;
	method?: string;
	headers?: Record<string, string | string[] | undefined>;
	query?: Partial<Record<string, string | string[]>>;
	body?: unknown;
	cookies?: Record<string, string>;
};

export class FakeRequest extends IncomingMessage {
	query: Record<string, string> = {};

	cookies: Record<string, string> = {};

	body: unknown = undefined;

	constructor({ url, method, headers, query, body, cookies }: RequestOptions) {
		super(process.stdin);

		this.url = url;
		this.method = method;
		this.headers = headers ?? {};
		this.query = query as Record<string, string>;
		this.body = body;
		this.cookies = cookies ?? {};
	}
}
