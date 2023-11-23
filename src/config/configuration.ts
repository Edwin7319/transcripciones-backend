export default () => ({
  port: parseInt(process.env.PORT, 10) || 8080,
  database: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    dropSchema: process.env.DATABASE_DROP_SCHEMA === 'true',
    synchronize: process.env.DATABASE_SYNCRHRONIZE === 'true',
  },
});
