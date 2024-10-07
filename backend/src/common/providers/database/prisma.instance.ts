import { Prisma, PrismaClient } from "@prisma/client";
import { S3Service } from "src/modules/s3/s3.service";

export type ExtendedPrismaClient = ReturnType<
  typeof createExtendedPrismaClient
>;

export type PrismaTransactionClient = Omit<
  ExtendedPrismaClient,
  "$extends" | "$transaction" | "$disconnect" | "$connect" | "$on" | "$use"
>;

export const createExtendedPrismaClient = (params: { s3: S3Service }) => {
  const { s3 } = params;

  const client = new PrismaClient()
    .$extends({
      model: {
        $allModels: {
          async findManyAndCount<Model, Args>(
            this: Model,
            args: Prisma.Exact<Args, Prisma.Args<Model, "findMany">>
          ): Promise<{
            data: Prisma.Result<Model, Args, "findMany">;
            count: number;
          }> {
            const [data, count] = await Promise.all([
              (this as any).findMany(args),
              (this as any).count({ where: (args as any).where }),
            ]);

            return { data, count };
          },
        },
      },
    })

    .$extends({
      query: {
        media: {
          delete: async ({ args, query }) => {
            // -- Fetch the media record to get the fileKey
            const media = await client.media.findUnique({
              where: { id: args.where.id },
            });

            // -- Run the query and throw an error if the query fails
            const queryResult = await query(args);

            // -- The record was deleted successfully...
            if (media) {
              // Delete the file from S3
              await s3.delete({ fileKey: media.fileKey });
            }

            return queryResult;
          },
        },
      },
    });

  return client;
};
