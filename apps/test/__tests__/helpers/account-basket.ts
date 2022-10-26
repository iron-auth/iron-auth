export type AccountBasketAccount = {
  id?: string;
  email: string;
  password: string;
  name?: string;
  cookie?: string;
};

export const defaultAccounts = {
  primary: {
    email: 'test-account@ixionlabs.com',
    password: 'Password_123',
  },
  secondary: {
    email: 'test-account-alt@ixionlabs.com',
    password: 'Password_123-alt',
  },
  tertiary: {
    email: 'test-account-alt2@ixionlabs.com',
    password: 'Password_123-alt2',
  },
  invalid: {
    email: 'invalid-email@ixionlabs',
    password: 'invalid-password',
  },
};

export class AccountBasket<
  T extends Record<string, AccountBasketAccount> = Record<string, AccountBasketAccount>,
> {
  private accounts: Record<keyof typeof defaultAccounts & keyof T, AccountBasketAccount>;

  constructor(accounts?: T) {
    this.accounts = { ...defaultAccounts, ...accounts };
  }

  public add(key: keyof typeof defaultAccounts, data: AccountBasketAccount) {
    this.accounts[key] = data;
  }

  public update(key: keyof typeof this.accounts, data: Partial<AccountBasketAccount>) {
    this.accounts[key] = {
      ...this.accounts[key],
      ...data,
    } as AccountBasketAccount;
  }

  public get(key: keyof typeof this.accounts) {
    return this.accounts[key];
  }
}
