import { Knex } from 'knex';
import knex from '../config/knex';

export type Player = {
  username: string;
  link?: string;
  rank: number;
  diedAt: Date | null;
}

const toSQLDate = (date: Date | null) => date?.toJSON().slice(0, 19).replace('T', ' ');

const fromSQLDate = (date: string | null) => {
  if (!date) {
    return null;
  }
  const t = date.split(/[- :]/).map((part) => parseInt(part, 10));

  // Apply each element to the Date function
  const d = new Date(Date.UTC(t[0], t[1] - 1, t[2], t[3], t[4], t[5]));
  return d;
};

const upsertPlayer = async (record: Player, transaction: Knex.Transaction) => {
  await knex('Player')
    .insert({
      username: record.username,
      diedAt: toSQLDate(record.diedAt),
      position: record.rank,
    })
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
  const players = await knex('Player')
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
