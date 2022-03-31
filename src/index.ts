import 'dotenv/config';
import { upsertPlayers } from './models/player';
import { topOneThousand } from './services/overall';

const main = async () => {
  const topPlayers = await topOneThousand();
  await upsertPlayers(topPlayers);
  process.exit(0);
};

main();
