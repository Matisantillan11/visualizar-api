import path from 'node:path';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: path.join('src/shared/database/prisma', 'schema.prisma'),
  migrations: {
    path: path.join('src/shared/database', 'migrations'),
  },
  views: {
    path: path.join('src/shared/database', 'views'),
  },
  typedSql: {
    path: path.join('src/shared/database', 'queries'),
  },
});
