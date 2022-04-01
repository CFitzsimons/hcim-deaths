import 'dotenv/config';
import { writeFileSync } from 'fs';
import knex from './config/knex';
import Skill from './emums/skill';
import { Player, upsertPlayersWithTransaction } from './models/player';
import { crawlSkillRecords } from './services/crawler';
import notifyRecentDeaths from './services/notifier';

const mergePlayers = (allRecords: Player[]): Player[] => {
  const playerMap = new Map<string, Player>();
  allRecords.forEach((record) => {
    if (playerMap.has(record.username)) {
      const existingEntry = playerMap.get(record.username);
      playerMap.set(record.username, {
        ...existingEntry,
        ...record,
      });
    } else {
      playerMap.set(record.username, record);
    }
  });
  return [...playerMap.values()];
};
/**
 * This main file is just an easy way to test during
 * development.  This will be moved into a CRON
 * job for actual deployment.
 */
const main = async () => {
  const crawlers = [
    crawlSkillRecords(),
    crawlSkillRecords(Skill.AGILITY),
    crawlSkillRecords(Skill.ATTACK),
    crawlSkillRecords(Skill.CONSTRUCTION),
    crawlSkillRecords(Skill.COOKING),
    crawlSkillRecords(Skill.CRAFTING),
    crawlSkillRecords(Skill.DEFENCE),
    crawlSkillRecords(Skill.FARMING),
    crawlSkillRecords(Skill.FIREMAKING),
    crawlSkillRecords(Skill.FISHING),
    crawlSkillRecords(Skill.FLETCHING),
    crawlSkillRecords(Skill.HERBLORE),
    crawlSkillRecords(Skill.HITPOINTS),
    crawlSkillRecords(Skill.HUNTER),
    crawlSkillRecords(Skill.MAGIC),
    crawlSkillRecords(Skill.MINING),
    crawlSkillRecords(Skill.PRAYER),
    crawlSkillRecords(Skill.RANGED),
    crawlSkillRecords(Skill.RUNECRAFTING),
    crawlSkillRecords(Skill.SLAYER),
    crawlSkillRecords(Skill.SMITHING),
    crawlSkillRecords(Skill.STRENGTH),
    crawlSkillRecords(Skill.THIEVING),
    crawlSkillRecords(Skill.WOODCUTTING),
  ];
  const allPlayers = await Promise.all(crawlers);
  const updatablePlayers = mergePlayers(allPlayers.flat());
  const notifablePlayers = notifyRecentDeaths(updatablePlayers);
  const trx = await knex.transaction();
  const success = await upsertPlayersWithTransaction(updatablePlayers, trx);
  if (success) {
    // TODO: Use notifiable players after the DB has been updated to
    await trx.commit();
  } else {
    // Do not notify and roll back changes for manual intervention
    await trx.rollback();
  }
  writeFileSync('debug.json', JSON.stringify(notifablePlayers, null, 2));
  process.exit(0);
};

main();
