// Prisma v7 configuration file
// Connection URL for migrations (moved from schema.prisma)

export default {
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL || "file:./dev.db",
  },
};
