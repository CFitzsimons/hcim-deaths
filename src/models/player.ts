import { Knex } from 'knex';
import knex from '../config/knex';

export type Player = {
  username: string;
  link?: string;
  overall?: number;
  herblore?: number;
  diedAt: Date | string | null;
}

const toSQLDate = (date: Date | null) => date?.toJSON().slice(0, 19).replace('T', ' ');

const fromSQLDate = (date: string | Date | null) => {
  if (typeof date === 'object') {
    // Already converted
    return date;
  }
  if (!date) {
    return null;
  }
  const dateParts = date.split(/[- :]/).map((part) => parseInt(part, 10));

  // Apply each element to the Date function
  const convertedDate = new Date(
    Date.UTC(
      dateParts[0],
      dateParts[1] - 1,
      dateParts[2],
      dateParts[3],
      dateParts[4],
      dateParts[5],
    ),
  );
  return convertedDate;
};

const toDatabasePlayer = (record: Player): Player => {
  const convertedPlayer = JSON.parse(JSON.stringify(record));
  if (typeof record.diedAt === 'object') {
    convertedPlayer.diedAt = toSQLDate(record.diedAt);
  }
  return convertedPlayer;
};

const upsertPlayer = async (record: Player, transaction: Knex.Transaction) => {
  await knex('Player')
    .insert(toDatabasePlayer(record))
    .onConflict('username')
    .merge()
    .transacting(transaction);
};

const upsertPlayersWithTransaction = async (records: Player[], trx: Knex.Transaction) => {
  try {
    await Promise.all(records.map((record) => upsertPlayer(record, trx)));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return false;
  }
  return true;
};

const upsertPlayers = async (records: Player[]) => {
  const trx = await knex.transaction();
  const success = await upsertPlayersWithTransaction(records, trx);
  if (!success) {
    await trx.rollback();
    console.error('Failed to update players');
    process.exit(1);
  }
  trx.commit();
};

const batchUpsert = async (records: Player[]) => {
  const BATCH_SIZE = 20;
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, Math.min(i + BATCH_SIZE, records.length));
    console.info(`Starting to insert ${BATCH_SIZE} records into the DB.`);
    // eslint-disable-next-line no-await-in-loop
    await upsertPlayers(batch);
    console.info(`Finshed inserting ${BATCH_SIZE} records into the DB.`);
  }
};

type PlayerSearch = {
  usernames?: string[];
}

const search = async (query: Knex.QueryBuilder, searchQuery: PlayerSearch): Promise<Player[]> => {
  const {
    usernames,
  } = searchQuery || {};
  if (usernames) {
    query
      .whereIn('username', usernames);
  }
  return (await query) as Player[];
};

const findAll = async (searchQuery = {} as PlayerSearch): Promise<Player[]> => {
  const query = knex('Player')
    .select('*');
  const players = await search(query, searchQuery);
  return players.map((player) => ({
    ...player,
    diedAt: fromSQLDate(player.diedAt),
  }));
};

export {
  batchUpsert,
  upsertPlayers,
  upsertPlayer,
  upsertPlayersWithTransaction,
  findAll,
};
