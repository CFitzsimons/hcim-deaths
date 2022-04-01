import Highscores from '../classes/highscores';
import Skill from '../emums/skill';
import { Player } from '../models/player';

const RECORDS_PER_PAGE = 25;

const crawlSkillRecords = async (skill = Skill.OVERALL, totalRecords = 100) => {
  console.info(`Attempting to find the top ${totalRecords} records for ${Skill[skill]}`);
  const highscoreCrawler = new Highscores(skill);
  const pagesRequired = Math.floor(totalRecords / RECORDS_PER_PAGE);
  const allPlayerRecords: Player[] = [];
  for (let i = 0; i < pagesRequired; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const pageOfPlayers = await highscoreCrawler.read();
    allPlayerRecords.push(...pageOfPlayers);
    highscoreCrawler.nextPage();
  }
  console.info(`Found a total of ${allPlayerRecords.length} records for ${Skill[skill]}`);
  return allPlayerRecords;
};

const topOneHundred = async () => {

};

export {
  crawlSkillRecords,
  topOneHundred,
};
