import { Element, load } from 'cheerio';
import axios from 'axios';
import { Player } from '../models/player';
import Skill from '../emums/skill';

const toUser = (ele: Element, skill: Skill): Player => {
  const $ = load(ele);
  const skillName = Skill[skill].toLowerCase();
  const player = $('a');
  const rank = $('td').first().text();
  const deathNote = $('img').attr('title');
  let diedAt = null;
  if (deathNote) {
    diedAt = new Date(Date.parse(deathNote.split('died:')[1].trim()));
  }
  const username = player.text();
  return {
    username,
    [skillName]: parseInt(rank, 10),
    diedAt,
  };
};

export default class Highscores {
  private static baseURL = 'https://secure.runescape.com';

  private page: number;

  private skill: Skill;

  constructor(skill: Skill) {
    this.page = 1;
    this.skill = skill;
  }

  async read() {
    const contentBuffer = await axios
      .get(`${Highscores.baseURL}/m=hiscore_oldschool_hardcore_ironman/overall?table=${this.skill}&page=${this.page}`, { headers: { 'Content-Type': 'application/json' }, responseType: 'arraybuffer' });
    // Encoding doesn't work when parsing as utf8, so parse as ascii
    const content = contentBuffer.data.toString('ascii');
    const $ = load(content);
    const rows = $(('.personal-hiscores__row'));
    const players = rows.map((i, ele) => toUser(ele, this.skill));
    return players;
  }

  nextPage() {
    this.page += 1;
  }
}
