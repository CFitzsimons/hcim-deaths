import logger from '../config/logger';
import Highscores from '../classes/highscores';
import Skill from '../emums/skill';
import { Player } from '../models/player';

const RECORDS_PER_PAGE = 25;

const pause = (timeInSeconds: number) => new Promise((resolve) => (
  // eslint-disable-next-line no-promise-executor-return
  setTimeout(resolve, timeInSeconds * 1000)
));

const crawlSkillRecords = async (skill = Skill.OVERALL, totalRecords = 300) => {
  logger.info(`Attempting to find the top ${totalRecords} records for ${Skill[skill]}`);
  const highscoreCrawler = new Highscores(skill);
  const pagesRequired = Math.floor(totalRecords / RECORDS_PER_PAGE);
  const allPlayerRecords: Player[] = [];
  for (let i = 0; i < pagesRequired; i += 1) {
    /* eslint-disable no-await-in-loop */
    const pageOfPlayers = await highscoreCrawler.read();
    if (pageOfPlayers.length === 0) {
      logger.warn('Failed to get records, likley rate limiting, trying again shortly...');
      await pause(5);
      i -= 1;
      // eslint-disable-next-line no-continue
      continue;
    }
    /* eslint-enable no-await-in-loop */
    allPlayerRecords.push(...pageOfPlayers);
    highscoreCrawler.nextPage();
  }
  logger.info(`Found a total of ${allPlayerRecords.length} records for ${Skill[skill]}`);
  return allPlayerRecords;
};

const crawlKillRecords = async () => {

};

export {
  crawlSkillRecords,
  crawlKillRecords,
};
