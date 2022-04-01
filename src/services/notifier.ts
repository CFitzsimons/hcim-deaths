import { Player, findAll } from '../models/player';

const notifyRecentDeaths = async (recentPlayers: Player[]) => {
  const threeDays = 1000 * 60 * 60 * 24 * 30;
  const threeDaysAgoStamp = Date.now() - threeDays;
  const allDeathsInLastThreeDays = recentPlayers.filter((player) => {
    if (!player.diedAt) {
      return false;
    }
    const deathDate = new Date(player.diedAt);
    return deathDate.getTime() > threeDaysAgoStamp;
  });
  const existingPlayers = await findAll({
    usernames: allDeathsInLastThreeDays.map((player) => player.username),
  });
  const notifiablePlayers = existingPlayers.filter((existingPlayer) => (
    existingPlayer.diedAt === null
  ));
  return notifiablePlayers;
};

export default notifyRecentDeaths;
