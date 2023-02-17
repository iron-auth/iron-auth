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

  _getRedirectUrl() {
    return this._redirectUrl;
  }

  _getJSONData() {
    return this._jsonResp;
  }
}
