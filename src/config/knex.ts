import knex from 'knex';

const {
  DB_PORT,
  DB_HOST,
  DB_USERNAME,
  DB_DATABASE,
  DB_PASSWORD,
} = process.env;

const configuredKnex = knex({
  client: 'mysql',
  connection: {
    database: DB_DATABASE,
    host: DB_HOST,
    user: DB_USERNAME,
    password: DB_PASSWORD,
    port: parseInt(DB_PORT ?? '3306', 10),
  },
});

export default configuredKnex;
