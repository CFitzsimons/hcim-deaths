import Highscores from '../classes/highscores';
import Skill from '../emums/skill';

const topOneThousand = async (skill = Skill.OVERALL) => {
  const highscoreCrawler = new Highscores(skill);
  let totalFetched = 0;
  const limit = 100;
  const playersPerPage = 25;
  const allPlayers = [];
  while (limit - totalFetched > 0) {
    // eslint-disable-next-line no-await-in-loop
    const recordsForPage = await highscoreCrawler.read();
    allPlayers.push(...recordsForPage);
    highscoreCrawler.nextPage();
    totalFetched += playersPerPage;
  }
  return allPlayers;
};

const topOneHundred = async () => {

};

export {
  topOneThousand,
  topOneHundred,
};
