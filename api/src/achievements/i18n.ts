/**
 * Achievement copy in every supported locale. Keyed by achievement id.
 *
 * The English values mirror the strings the evaluators currently hardcode
 * — they remain the canonical fallback if a row is missing in JA.
 */
import type { Locale } from '../common/locale';

type Copy = { title: string; description: string };
type Table = Record<string, Copy>;

const EN: Table = {
  'first-steps': { title: 'First steps', description: 'Mark your first cover as visited.' },
  'rookie-trainer': { title: 'Rookie trainer', description: 'Visit 5 covers.' },
  'road-warrior': { title: 'Road warrior', description: 'Visit 25 covers.' },
  'halfway-there': { title: 'Halfway there', description: 'Visit half of all covers (235).' },
  'pokemon-master': { title: 'Pokémon Master', description: 'Visit all 470 covers.' },
  globetrotter: { title: 'Globetrotter', description: 'Visit covers in 10 different prefectures.' },
  'all-prefectures': { title: 'Every prefecture', description: 'Visit at least one cover in every prefecture that has one.' },
  'local-hero': { title: 'Local hero', description: 'Visit every cover in a single prefecture.' },
  'fire-fan': { title: 'Fire-type fan', description: 'Visit 5 covers featuring Fire-type Pokémon.' },
  'water-fan': { title: 'Water-type fan', description: 'Visit 5 covers featuring Water-type Pokémon.' },
  'grass-fan': { title: 'Grass-type fan', description: 'Visit 5 covers featuring Grass-type Pokémon.' },
  'electric-fan': { title: 'Electric-type fan', description: 'Visit 5 covers featuring Electric-type Pokémon.' },
  'dragon-master': { title: 'Dragon master', description: 'Visit 5 covers featuring Dragon-type Pokémon.' },
  'ghost-hunter': { title: 'Ghost hunter', description: 'Visit 5 covers featuring Ghost-type Pokémon.' },
  'fairy-collector': { title: 'Fairy collector', description: 'Visit 5 covers featuring Fairy-type Pokémon.' },
  rainbow: { title: 'Rainbow', description: 'Visit covers featuring every Pokémon type.' },
  'on-a-roll': { title: 'On a roll', description: 'Mark 3 visits within a 24-hour window.' },
  'week-of-visits': { title: 'Week of visits', description: 'Visit at least one cover on 7 consecutive days (JST).' },
  'early-bird': { title: 'Early bird', description: 'Mark a visit before 8 a.m. JST.' },
  'night-owl': { title: 'Night owl', description: 'Mark a visit after 10 p.m. JST.' },
};

const JA: Table = {
  'first-steps': { title: 'はじめの一歩', description: '最初のマンホールを訪問済みにする。' },
  'rookie-trainer': { title: 'ルーキートレーナー', description: '5枚のマンホールを訪問する。' },
  'road-warrior': { title: 'ロードウォリアー', description: '25枚のマンホールを訪問する。' },
  'halfway-there': { title: '折り返し地点', description: '全マンホールの半分（235枚）を訪問する。' },
  'pokemon-master': { title: 'ポケモンマスター', description: '470枚すべてのマンホールを訪問する。' },
  globetrotter: { title: '世界旅行者', description: '10都道府県のマンホールを訪問する。' },
  'all-prefectures': { title: '全都道府県制覇', description: 'マンホールがあるすべての都道府県で1枚以上訪問する。' },
  'local-hero': { title: '地元の英雄', description: '1つの都道府県のすべてのマンホールを訪問する。' },
  'fire-fan': { title: 'ほのおタイプ愛好家', description: 'ほのおタイプのポケモンが登場する5枚を訪問する。' },
  'water-fan': { title: 'みずタイプ愛好家', description: 'みずタイプのポケモンが登場する5枚を訪問する。' },
  'grass-fan': { title: 'くさタイプ愛好家', description: 'くさタイプのポケモンが登場する5枚を訪問する。' },
  'electric-fan': { title: 'でんきタイプ愛好家', description: 'でんきタイプのポケモンが登場する5枚を訪問する。' },
  'dragon-master': { title: 'ドラゴンマスター', description: 'ドラゴンタイプのポケモンが登場する5枚を訪問する。' },
  'ghost-hunter': { title: 'ゴーストハンター', description: 'ゴーストタイプのポケモンが登場する5枚を訪問する。' },
  'fairy-collector': { title: 'フェアリーコレクター', description: 'フェアリータイプのポケモンが登場する5枚を訪問する。' },
  rainbow: { title: 'レインボー', description: 'すべてのポケモンタイプが登場するマンホールを訪問する。' },
  'on-a-roll': { title: '絶好調', description: '24時間以内に3枚訪問する。' },
  'week-of-visits': { title: '一週間連続', description: '7日連続でマンホールを訪問する（日本時間）。' },
  'early-bird': { title: '早起き鳥', description: '日本時間の朝8時前に訪問を記録する。' },
  'night-owl': { title: '夜ふくろう', description: '日本時間の夜10時以降に訪問を記録する。' },
};

export function localiseAchievement(
  id: string,
  fallback: Copy,
  locale: Locale,
): Copy {
  const table = locale === 'ja' ? JA : EN;

  return table[id] ?? fallback;
}
