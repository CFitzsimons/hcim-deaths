import { Element, load } from 'cheerio';
import axios from 'axios';
import { Player } from '../models/player';

const toUser = (ele: Element): Player => {
  const $ = load(ele);
  const player = $('a');
  const rank = $('td').first().text();
  const deathNote = $('img').attr('title');
  let diedAt = null;
  if (deathNote) {
    diedAt = new Date(Date.parse(deathNote.split('died:')[1].trim()));
  }
  const { href } = player.attr();
  const username = player.text();
  return {
    username,
    link: href,
    rank: parseInt(rank, 10),
    diedAt,
  };
};

export default class Highscores {
  private static baseURL = 'https://secure.runescape.com';

  private page: number;

  constructor() {
    this.page = 1;
  }

  async read() {
    const contentBuffer = await axios
      .get(`${Highscores.baseURL}/m=hiscore_oldschool_hardcore_ironman/overall?table=0&page=${this.page}`, { headers: { 'Content-Type': 'application/json' }, responseType: 'arraybuffer' });
    // Encoding doesn't work when parsing as utf8, so parse as ascii
    const content = contentBuffer.data.toString('ascii');
    const $ = load(content);
    const rows = $(('.personal-hiscores__row'));
    const players = rows.map((i, ele) => toUser(ele));
    return players;
  }

  nextPage() {
    this.page += 1;
  }
}
