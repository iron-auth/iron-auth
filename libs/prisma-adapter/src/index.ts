import type { GenericAdapterConfig } from '@iron-auth/core/types';
import type { PrismaClient } from '@prisma/client';

/**
 * A prisma adapter for Iron Auth.
 *
 * It enables using Prisma as an ORM for the database that stores the Iron Auth data.
 *
 * @param prisma - The prisma client instance.
 * @returns The adapter.
 */
export const prismaAdapter = (prisma: PrismaClient): GenericAdapterConfig => ({
  create: ({
    userId,
    type,
    providerId,
    accountId,
    username = null,
    name = null,
    image = null,
    email = null,
    accountData = null,
  }) =>
    prisma.account.create({
      data: {
        type,
        provider: providerId,
        providerAccountId: accountId,
        providerAccountData: accountData,
        user: userId
          ? {
              connectOrCreate: {
                where: {
                  id: userId,
                },
                create: {
                  username,
                  name,
                  image,
                  email,
                },
              },
            }
          : {
              create: {
                username,
                name,
                image,
                email,
              },
            },
      },
      select: {
        id: true,
        userId: true,
        type: true,
        provider: true,
        providerAccountId: true,
        providerAccountData: true,
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    }),

  findAccount: ({ type, providerId, accountId, accountData }) =>
    prisma.account.findFirst({
      where: {
        type,
        provider: providerId,
        providerAccountId: accountId,
        providerAccountData: accountData,
      },
      select: {
        id: true,
        userId: true,
        type: true,
        provider: true,
        providerAccountId: true,
        providerAccountData: true,
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    }),
});
