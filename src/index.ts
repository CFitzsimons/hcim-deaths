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
  const allPlayers = [];
  allPlayers.push(await crawlSkillRecords(Skill.OVERALL, 1000));
  allPlayers.push(await crawlSkillRecords(Skill.AGILITY));
  allPlayers.push(await crawlSkillRecords(Skill.ATTACK));
  allPlayers.push(await crawlSkillRecords(Skill.CONSTRUCTION));
  allPlayers.push(await crawlSkillRecords(Skill.COOKING));
  allPlayers.push(await crawlSkillRecords(Skill.CRAFTING));
  allPlayers.push(await crawlSkillRecords(Skill.DEFENCE));
  allPlayers.push(await crawlSkillRecords(Skill.FARMING));
  allPlayers.push(await crawlSkillRecords(Skill.FIREMAKING));
  allPlayers.push(await crawlSkillRecords(Skill.FISHING));
  allPlayers.push(await crawlSkillRecords(Skill.FLETCHING));
  allPlayers.push(await crawlSkillRecords(Skill.HERBLORE));
  allPlayers.push(await crawlSkillRecords(Skill.HITPOINTS));
  allPlayers.push(await crawlSkillRecords(Skill.HUNTER));
  allPlayers.push(await crawlSkillRecords(Skill.MAGIC));
  allPlayers.push(await crawlSkillRecords(Skill.MINING));
  allPlayers.push(await crawlSkillRecords(Skill.PRAYER));
  allPlayers.push(await crawlSkillRecords(Skill.RANGED));
  allPlayers.push(await crawlSkillRecords(Skill.RUNECRAFTING));
  allPlayers.push(await crawlSkillRecords(Skill.SLAYER));
  allPlayers.push(await crawlSkillRecords(Skill.SMITHING));
  allPlayers.push(await crawlSkillRecords(Skill.STRENGTH));
  allPlayers.push(await crawlSkillRecords(Skill.THIEVING));
  allPlayers.push(await crawlSkillRecords(Skill.WOODCUTTING));
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
