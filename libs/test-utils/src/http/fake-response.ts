/* eslint-disable no-underscore-dangle */

import { ServerResponse } from 'http';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class FakeResponse<T = any> extends ServerResponse {
	_redirectUrl: string | undefined;

	_jsonResp: T | undefined;

	public status(code: number) {
		this.statusCode = code;
		return this;
	}

	public redirect(url: string): FakeResponse;
	public redirect(status: number, url: string): FakeResponse;

	public redirect(status: number | string, url?: string): FakeResponse {
		if (typeof status === 'string') {
			this._redirectUrl = status;
		} else {
			this.statusCode = status;
			this._redirectUrl = url;
		}
		return this;
	}

	public json(data: T) {
		this._jsonResp = data;
		this.setHeader('Content-Type', 'application/json;charset=UTF-8');
		this.end(JSON.stringify(data));
	}

	public override end(...args: unknown[]): this {
		if (
			args.length === 1 &&
			typeof args[0] === 'string' &&
			this.getHeader('Content-Type')?.toString().includes('application/json')
		) {
			this._jsonResp = JSON.parse(args[0]) as T;
		}

		const locationHeader = this.getHeader('Location');
		if (locationHeader) {
			this._redirectUrl = locationHeader.toString();
		}

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore - this.end() is not typed correctly
		super.end(...args);

		return this;
	}

	_getRedirectUrl() {
		return this._redirectUrl;
	}

	_getJSONData() {
		return this._jsonResp;
	}
}
