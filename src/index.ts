import 'dotenv/config';
import Skill from './emums/skill';
import { batchUpsert, Player } from './models/player';
import { crawlSkillRecords } from './services/overall';

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

const main = async () => {
  const allPlayers: Player[] = [];
  allPlayers.push(...await crawlSkillRecords());
  allPlayers.push(...await crawlSkillRecords(Skill.AGILITY));
  allPlayers.push(...await crawlSkillRecords(Skill.ATTACK));
  allPlayers.push(...await crawlSkillRecords(Skill.CONSTRUCTION));
  allPlayers.push(...await crawlSkillRecords(Skill.COOKING));
  allPlayers.push(...await crawlSkillRecords(Skill.CRAFTING));
  allPlayers.push(...await crawlSkillRecords(Skill.DEFENCE));
  allPlayers.push(...await crawlSkillRecords(Skill.FARMING));
  allPlayers.push(...await crawlSkillRecords(Skill.FIREMAKING));
  allPlayers.push(...await crawlSkillRecords(Skill.FISHING));
  allPlayers.push(...await crawlSkillRecords(Skill.FLETCHING));
  allPlayers.push(...await crawlSkillRecords(Skill.HERBLORE));
  allPlayers.push(...await crawlSkillRecords(Skill.HITPOINTS));
  allPlayers.push(...await crawlSkillRecords(Skill.HUNTER));
  allPlayers.push(...await crawlSkillRecords(Skill.MAGIC));
  allPlayers.push(...await crawlSkillRecords(Skill.MINING));
  allPlayers.push(...await crawlSkillRecords(Skill.PRAYER));
  allPlayers.push(...await crawlSkillRecords(Skill.RANGED));
  allPlayers.push(...await crawlSkillRecords(Skill.RUNECRAFTING));
  allPlayers.push(...await crawlSkillRecords(Skill.SLAYER));
  allPlayers.push(...await crawlSkillRecords(Skill.SMITHING));
  allPlayers.push(...await crawlSkillRecords(Skill.STRENGTH));
  allPlayers.push(...await crawlSkillRecords(Skill.THIEVING));
  allPlayers.push(...await crawlSkillRecords(Skill.WOODCUTTING));
  const updatablePlayers = mergePlayers(allPlayers);
  await batchUpsert(updatablePlayers);
  process.exit(0);
};

main();
