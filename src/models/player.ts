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

const fromSQLDate = (date: string | null) => {
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

const upsertPlayers = async (records: Player[]) => {
  const trx = await knex.transaction();
  try {
    await Promise.all(records.map((record) => upsertPlayer(record, trx)));
    await trx.commit();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    await trx.rollback();
  }
};

const findAll = async (): Promise<Player[]> => {
  const players = await knex('Overall')
    .select('*');
  return players.map((player) => ({
    username: player.username,
    diedAt: fromSQLDate(player.diedAt),
    rank: player.position,
  }));
};

export {
  upsertPlayers,
  upsertPlayer,
  findAll,
};
