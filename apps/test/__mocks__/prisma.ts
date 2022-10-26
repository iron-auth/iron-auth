/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-underscore-dangle */
import type { Account, Prisma, PrismaClient, User } from '@prisma/client';
import cuid from 'cuid';
import { vi } from 'vitest';

type ModelTypeMap = {
  user: {
    model: User;
    primaryKey: 'id';
    inputType: User;
    prismaInputs: {
      create: Prisma.UserUncheckedCreateInput;
      update: Prisma.UserUpdateInput;
      where: Prisma.UserWhereInput;
      select: Prisma.UserSelect;
    };
  };
  account: {
    model: Account;
    primaryKey: 'id';
    inputType: Account;
    prismaInputs: {
      create: Prisma.AccountUncheckedCreateInput;
      update: Prisma.AccountUpdateInput;
      where: Prisma.AccountWhereInput;
      select: Prisma.AccountSelect;
    };
  };
};

type ResolveModel<Model extends keyof ModelTypeMap> = ModelTypeMap[Model]['model'];
type ResolveKey<Model extends keyof ModelTypeMap> = ModelTypeMap[Model]['primaryKey'];
type ResolveKeyType<
  Model extends keyof ModelTypeMap,
  Key extends ResolveKey<Model> = ResolveKey<Model>,
> = ResolveModel<Model>[Key];
type ResolveQueryData<
  Model extends keyof ModelTypeMap,
  ModelInput = ModelTypeMap[Model]['inputType'],
> = Partial<{
  [K in keyof ModelInput]: ModelInput[K];
}>;
type ResolvePrismaInput<
  Model extends keyof ModelTypeMap,
  Type extends keyof ModelTypeMap[Model]['prismaInputs'],
> = ModelTypeMap[Model]['prismaInputs'][Type];

type DataStore = {
  models: {
    [K in keyof ModelTypeMap]: Record<ResolveKeyType<K>, ResolveModel<K>>;
  };
};

// eslint-disable-next-line @typescript-eslint/naming-convention
const _data: DataStore = {
  models: {
    user: {},
    account: {},
  },
};

const findItem = <Model extends keyof ModelTypeMap>(
  model: Model,
  query: ResolveQueryData<Model>,
): ResolveModel<Model> | null => {
  const keys = Object.keys(query) as Partial<keyof ResolveModel<Model>>[];

  const modelValues = Object.values(_data.models[model]) as ResolveModel<Model>[];

  const foundItem = modelValues.find((item) => keys.every((key) => item[key] === query[key]));

  return foundItem || null;
};

const findItemByKey = <Model extends keyof ModelTypeMap>(
  model: Model,
  id: ResolveKeyType<Model> | undefined,
): ResolveModel<Model> | null => {
  return (id && _data.models[model][id]) || null;
};

const upsertItem = <Model extends keyof ModelTypeMap>(
  model: Model,
  key: ResolveKeyType<Model>,
  newData: ResolveQueryData<Model>,
): ResolveModel<Model> => {
  _data.models[model][key] = {
    ...(_data.models[model][key] || {}),
    ...newData,
  };

  const updatedItem = findItemByKey(model, key);

  return updatedItem as NonNullable<typeof updatedItem>;
};

const selectFromItem = <Model extends keyof ModelTypeMap>(
  model: Model,
  key: ResolveKeyType<Model>,
  query: ResolvePrismaInput<Model, 'select'>,
) => {
  const returnedData = {} as Partial<ResolveQueryData<Model>>;

  const item = _data.models[model][key as ResolveKeyType<Model>];
  Object.keys(query).forEach((queryKey) => {
    if (
      query[queryKey as keyof ResolvePrismaInput<Model, 'select'>] &&
      item[queryKey as keyof ResolveQueryData<Model>] !== undefined
    ) {
      returnedData[queryKey as keyof ResolveQueryData<Model>] =
        item[queryKey as keyof ResolveQueryData<Model>];
    }
  });

  return returnedData;
};

// const deleteItem = <Model extends keyof ModelTypeMap>(
//   model: Model,
//   key: ResolveKeyType<Model>,
// ): void => {
//   delete _data.models[model][key];
// };

const count = <Model extends keyof ModelTypeMap>(model: Model): number => {
  return Object.keys(_data.models[model]).length;
};

const refinePrismaInput = <
  Model extends keyof ModelTypeMap,
  Type extends keyof ModelTypeMap[Model]['prismaInputs'] = 'update',
  Data extends ResolvePrismaInput<Model, Type> = ResolvePrismaInput<Model, Type>,
>(
  data: Data,
): ResolveQueryData<Model> => {
  const newData: ResolveQueryData<Model> = {};

  // @ts-expect-error - weird typescript error?
  Object.keys(data).forEach((key) => {
    const oldItem = data[key as keyof Data];

    if (oldItem) {
      if (typeof oldItem === 'object' && 'set' in oldItem) {
        // @ts-expect-error - we know that the key should exist
        newData[key] = (oldItem as { set: string }).set;
      } else if (!(typeof oldItem === 'object' && 'create' in oldItem)) {
        // @ts-expect-error - we know that the key should exist
        newData[key] = oldItem;
      } else {
        // This value shouldn't fit into the model's data.
      }
    }
  });

  return newData;
};

type InferFromPrismaEnumerable<T> = T extends Prisma.Enumerable<infer U> ? U : T;
const refinePrismaEnumerable = <T extends Prisma.Enumerable<unknown>>(
  value: T | undefined,
  idx = 0,
): InferFromPrismaEnumerable<T> | undefined => {
  if (Array.isArray(value)) {
    return value[idx] ?? undefined;
  }

  return (value ?? undefined) as InferFromPrismaEnumerable<T> | undefined;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
const _methods = {
  account: {
    connectOrCreate: (
      userId: any,
      input:
        | Prisma.Enumerable<Prisma.AccountCreateOrConnectWithoutUserInput>
        | Prisma.Enumerable<Prisma.AccountCreateWithoutUserInput>
        | undefined,
    ) => {
      const connectOrCreate = refinePrismaEnumerable(input);

      if (connectOrCreate) {
        const foundAccount =
          'where' in connectOrCreate &&
          findItem(
            'account',
            connectOrCreate.where.provider_providerAccountId ??
              ((connectOrCreate.where.id && { id: connectOrCreate.where.id }) || {}),
          );

        if (!foundAccount) {
          upsertItem(
            'account',
            cuid(),
            refinePrismaInput<'account', 'create'>({
              ...('create' in connectOrCreate ? connectOrCreate.create : connectOrCreate),
              userId,
            }),
          );
        }
      }
    },
  },
  user: {
    upsert: (
      inputUserId: any | undefined,
      updateData: Prisma.UserUpsertArgs['update'],
      createData: Prisma.UserUpsertArgs['create'],
    ) => {
      let userId: any | undefined = inputUserId;
      let existingUser: User | null | undefined;

      if (userId) {
        existingUser = findItemByKey('user', userId);
      } else {
        userId = cuid();
      }

      const { accounts, ...data } = existingUser ? updateData : createData;

      const refinedInput = existingUser
        ? refinePrismaInput<'user', 'update'>(data)
        : refinePrismaInput<'user', 'create'>({ ...createData, id: userId });

      const newUserItem = upsertItem('user', userId, refinedInput);

      _methods.account.connectOrCreate(userId, accounts?.connectOrCreate ?? accounts?.create);

      return newUserItem;
    },

    connectOrCreate: (
      where: Prisma.UserCreateOrConnectWithoutAccountsInput['where'],
      create: Prisma.UserCreateOrConnectWithoutAccountsInput['create'],
    ) => {
      const foundUser = findItem('user', where);

      if (!foundUser) {
        const userId = cuid();

        return upsertItem(
          'user',
          // @ts-expect-error - use a cuid for the sake of testing
          userId,
          // @ts-expect-error - use a cuid for the sake of testing
          refinePrismaInput<'user', 'create'>({ ...create, id: userId }),
        );
      }

      return foundUser;
    },

    create: (data: Prisma.UserCreateArgs['data']) => {
      const foundUser = findItem('user', { email: data.email });
      if (foundUser) return null;

      const userId = cuid();

      return upsertItem(
        'user',
        // @ts-expect-error - use a cuid for the sake of testing
        userId,
        // @ts-expect-error - use a cuid for the sake of testing
        refinePrismaInput<'user', 'create'>({ ...data, id: userId }),
      );
    },
  },
};

export const destroy = () => {
  _data.models = {
    user: {},
    account: {},
  };
};

export const prismaMock = {
  prisma: {
    user: {
      count: vi.fn(() => count('user')),

      upsert: vi.fn(
        ({ where: { id: userId }, create, update }: Prisma.UserUpsertArgs): User | null => {
          const userItem = _methods.user.upsert(userId, update, create);

          return userItem;
        },
      ),
    },

    account: {
      count: vi.fn(() => count('account')),

      findFirst: vi.fn(({ where, select }: Prisma.AccountFindFirstArgs) => {
        if (!where) return null;

        const accountItem = findItem('account', refinePrismaInput<'account', 'where'>(where));

        const userItem =
          select?.user &&
          accountItem?.userId &&
          findItem('user', refinePrismaInput<'user', 'where'>({ id: accountItem.userId }));

        return accountItem
          ? {
              ...accountItem,
              ...(userItem && { user: userItem }),
            }
          : null;
      }),

      create: vi.fn(({ data, select }: Prisma.AccountCreateArgs) => {
        const { user, ...accountData } = data;

        let newUserItem: User | null | undefined;

        if (user?.connectOrCreate) {
          newUserItem = _methods.user.connectOrCreate(
            user.connectOrCreate.where,
            user.connectOrCreate.create,
          );
        } else if (user?.create) {
          newUserItem = _methods.user.create(user.create);
        }
        if (!newUserItem) return null;

        const newAccountItemId = cuid();
        const accountItem = upsertItem(
          'account',
          newAccountItemId,
          refinePrismaInput<'account', 'create'>({
            id: newAccountItemId,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            userId: newUserItem!.id,
            type: accountData.type,
            provider: accountData.provider,
            providerAccountId: accountData.providerAccountId,
            providerAccountData: accountData.providerAccountData,
          }),
        );

        return select
          ? {
              ...selectFromItem('account', accountItem.id, select),
              ...(select.user &&
                (select.user as Prisma.UserArgs).select && {
                  user: selectFromItem(
                    'user',
                    accountItem.userId,
                    (select.user as Prisma.UserArgs).select as Prisma.UserSelect,
                  ),
                }),
            }
          : null;
      }),
    },
  } as unknown as PrismaClient,
};

export const { prisma } = prismaMock;

export default prismaMock;
