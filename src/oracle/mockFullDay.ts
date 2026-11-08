/**
 * Full day of football + multi-sport matches with all betting markets.
 * Markets: 1X2, Double Chance, BTTS, Over/Under, HT/FT, Correct Score, Asian Handicap
 */

export type MarketType =
  | '1x2' | 'double_chance' | 'btts' | 'over_under'
  | 'ht_ft' | 'correct_score' | 'asian_handicap';

export interface Outcome { id: string; label: string; oddsBps: number; }
export interface Market  { type: MarketType; label: string; outcomes: Outcome[]; }
export interface FullMatch {
  id: string; competition: string; competitionIcon: string;
  country: string; homeTeam: string; awayTeam: string;
  kickoff: string; markets: Market[]; isFeatured?: boolean;
}

function ho(h: number): string {
  return new Date(Date.now() + h * 3600_000).toISOString();
}

const bps = (v: number) => Math.round(v * 10000);

function m1x2(h: number, d: number, a: number): Market {
  return { type: '1x2', label: 'Match Result', outcomes: [
    { id: '1', label: '1', oddsBps: bps(h) },
    { id: 'X', label: 'X', oddsBps: bps(d) },
    { id: '2', label: '2', oddsBps: bps(a) },
  ]};
}
function mDC(hx: number, h12: number, x2: number): Market {
  return { type: 'double_chance', label: 'Double Chance', outcomes: [
    { id: '1X', label: '1X', oddsBps: bps(hx) },
    { id: '12', label: '12', oddsBps: bps(h12) },
    { id: 'X2', label: 'X2', oddsBps: bps(x2) },
  ]};
}
function mBTTS(y: number, n: number): Market {
  return { type: 'btts', label: 'Both Teams To Score', outcomes: [
    { id: 'yes', label: 'Yes', oddsBps: bps(y) },
    { id: 'no',  label: 'No',  oddsBps: bps(n) },
  ]};
}
function mOU(line: number, ov: number, un: number): Market {
  return { type: 'over_under', label: `Over/Under ${line}`, outcomes: [
    { id: `o${line}`, label: `Over ${line}`,  oddsBps: bps(ov) },
    { id: `u${line}`, label: `Under ${line}`, oddsBps: bps(un) },
  ]};
}
function mAH(line: number, h: number, a: number): Market {
  const lbl = line > 0 ? `+${line}` : `${line}`;
  return { type: 'asian_handicap', label: `Asian Handicap ${lbl}`, outcomes: [
    { id: `ah_h${line}`, label: `${lbl} Home`, oddsBps: bps(h) },
    { id: `ah_a${line}`, label: `${lbl} Away`, oddsBps: bps(a) },
  ]};
}
function mHtFt(
  hh:number,hd:number,ha:number,
  dh:number,dd:number,da:number,
  ah:number,ad:number,aa:number
): Market {
  return { type: 'ht_ft', label: 'Half Time / Full Time', outcomes: [
    {id:'1/1',label:'1/1',oddsBps:bps(hh)},{id:'1/X',label:'1/X',oddsBps:bps(hd)},{id:'1/2',label:'1/2',oddsBps:bps(ha)},
    {id:'X/1',label:'X/1',oddsBps:bps(dh)},{id:'X/X',label:'X/X',oddsBps:bps(dd)},{id:'X/2',label:'X/2',oddsBps:bps(da)},
    {id:'2/1',label:'2/1',oddsBps:bps(ah)},{id:'2/X',label:'2/X',oddsBps:bps(ad)},{id:'2/2',label:'2/2',oddsBps:bps(aa)},
  ]};
}
function mCS(scores: [string,number][]): Market {
  return { type: 'correct_score', label: 'Correct Score',
    outcomes: scores.map(([s,o])=>({id:s,label:s,oddsBps:bps(o)}))};
}

export const FULL_DAY_MATCHES: FullMatch[] = [

  // ══════════════════════════════════════════════════════════════════
  // ENGLISH PREMIER LEAGUE
  // ══════════════════════════════════════════════════════════════════
  {
    id:'epl_001', isFeatured:true,
    competition:'Premier League', competitionIcon:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', country:'England',
    homeTeam:'Arsenal', awayTeam:'Manchester United', kickoff:ho(1.5),
    markets:[
      m1x2(2.10,3.40,3.60),
      mDC(1.28,1.45,1.70),
      mBTTS(1.80,2.00),
      mOU(2.5,1.85,1.95),
      mOU(3.5,3.20,1.36),
      mAH(-0.5,2.05,1.85),
      mHtFt(4.5,8.0,22,3.8,4.2,9.0,14,18,9.5),
      mCS([['1-0',5.5],['2-0',7.0],['2-1',7.5],['1-1',6.0],['0-1',9.0],['0-0',9.5],['3-1',12],['3-0',10],['0-2',14],['2-2',14]]),
    ],
  },
  {
    id:'epl_002',
    competition:'Premier League', competitionIcon:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', country:'England',
    homeTeam:'Chelsea', awayTeam:'Liverpool', kickoff:ho(1.5),
    markets:[
      m1x2(2.80,3.20,2.50),
      mDC(1.52,1.42,1.60),
      mBTTS(1.75,2.05),
      mOU(2.5,1.80,2.00),
      mOU(3.5,3.10,1.38),
      mAH(0,1.93,1.93),
      mHtFt(6.5,10,28,3.5,4.5,7.5,12,16,7.0),
      mCS([['1-1',6.5],['1-0',7.0],['0-1',6.0],['2-1',8.0],['1-2',7.5],['0-0',9.0],['2-2',12],['2-0',9.0]]),
    ],
  },
  {
    id:'epl_003',
    competition:'Premier League', competitionIcon:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', country:'England',
    homeTeam:'Manchester City', awayTeam:'Tottenham', kickoff:ho(4),
    markets:[
      m1x2(1.55,4.20,6.50),
      mDC(1.18,1.22,2.30),
      mBTTS(1.90,1.90),
      mOU(2.5,1.75,2.05),
      mOU(3.5,2.80,1.45),
      mAH(-1.5,2.10,1.80),
      mHtFt(3.8,7.5,30,4.2,5.0,11,18,22,16),
      mCS([['2-0',6.0],['3-0',8.0],['2-1',7.0],['3-1',9.0],['1-0',7.5],['1-1',8.0],['0-1',18],['0-0',14]]),
    ],
  },
  {
    id:'epl_004',
    competition:'Premier League', competitionIcon:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', country:'England',
    homeTeam:'Newcastle United', awayTeam:'Aston Villa', kickoff:ho(4),
    markets:[
      m1x2(2.20,3.30,3.20),
      mDC(1.38,1.55,1.65),
      mBTTS(1.85,1.95),
      mOU(2.5,1.90,1.90),
      mOU(1.5,1.30,3.30),
      mAH(0,1.90,1.90),
      mCS([['1-0',6.5],['2-1',8.0],['1-1',6.0],['0-1',7.5],['2-0',8.5],['0-0',9.5],['1-2',9.0],['2-2',14]]),
    ],
  },
  {
    id:'epl_005',
    competition:'Premier League', competitionIcon:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', country:'England',
    homeTeam:'Brighton', awayTeam:'West Ham', kickoff:ho(6),
    markets:[
      m1x2(2.00,3.40,3.75),
      mDC(1.32,1.60,1.72),
      mBTTS(1.80,2.00),
      mOU(2.5,1.88,1.92),
      mAH(0,1.88,1.88),
      mCS([['1-0',6.5],['2-0',8.0],['1-1',6.5],['2-1',8.5],['0-1',8.0],['0-0',9.0]]),
    ],
  },
  {
    id:'epl_006',
    competition:'Premier League', competitionIcon:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', country:'England',
    homeTeam:'Brentford', awayTeam:'Wolves', kickoff:ho(6),
    markets:[
      m1x2(2.10,3.30,3.50),
      mBTTS(1.75,2.05),
      mOU(2.5,1.90,1.90),
      mOU(1.5,1.28,3.50),
      mAH(0,1.90,1.90),
      mCS([['1-0',7.0],['1-1',6.5],['2-1',8.5],['0-1',8.0],['2-0',9.0],['0-0',10]]),
    ],
  },
  {
    id:'epl_007',
    competition:'Premier League', competitionIcon:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', country:'England',
    homeTeam:'Everton', awayTeam:'Crystal Palace', kickoff:ho(8),
    markets:[
      m1x2(2.30,3.10,3.20),
      mBTTS(1.85,1.95),
      mOU(2.5,1.95,1.85),
      mAH(0,1.92,1.92),
      mCS([['1-0',7.0],['1-1',6.5],['0-1',7.0],['2-0',9.0],['0-0',9.0],['2-1',9.5]]),
    ],
  },
  {
    id:'epl_008',
    competition:'Premier League', competitionIcon:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', country:'England',
    homeTeam:'Fulham', awayTeam:'Leicester City', kickoff:ho(8),
    markets:[
      m1x2(2.00,3.30,3.90),
      mBTTS(1.80,2.00),
      mOU(2.5,1.90,1.90),
      mAH(0,1.88,1.88),
      mCS([['1-0',6.5],['2-0',8.5],['1-1',6.5],['2-1',8.0],['0-1',9.0],['0-0',9.5]]),
    ],
  },
  {
    id:'epl_009',
    competition:'Premier League', competitionIcon:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', country:'England',
    homeTeam:'Nottingham Forest', awayTeam:'Southampton', kickoff:ho(10),
    markets:[
      m1x2(1.85,3.40,4.20),
      mBTTS(1.78,2.02),
      mOU(2.5,1.90,1.90),
      mCS([['1-0',6.5],['2-0',8.0],['1-1',7.0],['0-0',9.5],['2-1',8.5],['0-1',10]]),
    ],
  },
  {
    id:'epl_010',
    competition:'Premier League', competitionIcon:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', country:'England',
    homeTeam:'Ipswich Town', awayTeam:'Burnley', kickoff:ho(10),
    markets:[
      m1x2(2.40,3.10,3.00),
      mBTTS(1.82,1.98),
      mOU(2.5,1.92,1.88),
      mCS([['1-0',7.0],['1-1',6.5],['2-1',8.5],['0-1',7.5],['0-0',9.0],['2-0',9.0]]),
    ],
  },

  // ══════════════════════════════════════════════════════════════════
  // UEFA CHAMPIONS LEAGUE
  // ══════════════════════════════════════════════════════════════════
  {
    id:'ucl_001', isFeatured:true,
    competition:'Champions League', competitionIcon:'🏆', country:'Europe',
    homeTeam:'Real Madrid', awayTeam:'Bayern Munich', kickoff:ho(2),
    markets:[
      m1x2(2.05,3.50,3.40),
      mDC(1.30,1.55,1.70),
      mBTTS(1.72,2.08),
      mOU(2.5,1.78,2.02),
      mOU(3.5,3.10,1.40),
      mAH(-0.25,2.00,1.90),
      mHtFt(4.2,8.5,20,3.5,4.5,8.0,14,17,8.5),
      mCS([['1-0',6.0],['2-0',7.5],['2-1',7.5],['1-1',5.5],['0-1',8.0],['1-2',9.0],['0-0',9.0],['3-1',11],['3-0',10]]),
    ],
  },
  {
    id:'ucl_002',
    competition:'Champions League', competitionIcon:'🏆', country:'Europe',
    homeTeam:'PSG', awayTeam:'Inter Milan', kickoff:ho(2),
    markets:[
      m1x2(1.95,3.60,4.00),
      mDC(1.28,1.45,1.85),
      mBTTS(1.80,2.00),
      mOU(2.5,1.82,1.98),
      mOU(3.5,3.40,1.32),
      mAH(-0.25,1.95,1.95),
      mCS([['1-0',6.5],['2-0',8.0],['2-1',7.5],['1-1',6.0],['0-0',9.5],['0-1',10],['3-0',12],['1-2',13]]),
    ],
  },
  {
    id:'ucl_003',
    competition:'Champions League', competitionIcon:'🏆', country:'Europe',
    homeTeam:'Barcelona', awayTeam:'Atletico Madrid', kickoff:ho(4),
    markets:[
      m1x2(2.10,3.40,3.50),
      mDC(1.33,1.52,1.70),
      mBTTS(1.78,2.02),
      mOU(2.5,1.85,1.95),
      mOU(3.5,3.20,1.38),
      mAH(0,1.92,1.92),
      mCS([['2-1',8.0],['1-0',6.5],['2-0',8.0],['1-1',6.0],['0-0',8.5],['0-1',9.5],['1-2',11],['3-1',11]]),
    ],
  },
  {
    id:'ucl_004',
    competition:'Champions League', competitionIcon:'🏆', country:'Europe',
    homeTeam:'Borussia Dortmund', awayTeam:'AC Milan', kickoff:ho(4),
    markets:[
      m1x2(2.30,3.30,3.10),
      mBTTS(1.80,2.00),
      mOU(2.5,1.88,1.92),
      mAH(0,1.90,1.90),
      mCS([['1-1',6.5],['1-0',7.0],['2-1',8.5],['0-1',7.5],['2-0',9.0],['0-0',9.0],['1-2',9.5]]),
    ],
  },
  {
    id:'ucl_005',
    competition:'Champions League', competitionIcon:'🏆', country:'Europe',
    homeTeam:'Manchester City', awayTeam:'Benfica', kickoff:ho(6),
    markets:[
      m1x2(1.45,4.50,7.00),
      mDC(1.15,1.18,2.80),
      mBTTS(1.82,1.98),
      mOU(2.5,1.72,2.08),
      mAH(-1.5,2.00,1.90),
      mCS([['2-0',6.5],['3-0',8.0],['2-1',7.5],['1-0',7.0],['3-1',10],['4-0',12]]),
    ],
  },
  {
    id:'ucl_006',
    competition:'Champions League', competitionIcon:'🏆', country:'Europe',
    homeTeam:'Arsenal', awayTeam:'Sporting CP', kickoff:ho(6),
    markets:[
      m1x2(1.60,4.00,5.50),
      mDC(1.22,1.28,2.40),
      mBTTS(1.80,2.00),
      mOU(2.5,1.78,2.02),
      mAH(-1.0,2.05,1.85),
      mCS([['2-0',7.0],['2-1',7.5],['1-0',6.5],['3-0',9.0],['1-1',7.5],['0-1',14]]),
    ],
  },

  // ══════════════════════════════════════════════════════════════════
  // UEFA EUROPA LEAGUE
  // ══════════════════════════════════════════════════════════════════
  {
    id:'uel_001',
    competition:'Europa League', competitionIcon:'🟠', country:'Europe',
    homeTeam:'Roma', awayTeam:'Ajax', kickoff:ho(3),
    markets:[
      m1x2(2.10,3.40,3.40),
      mBTTS(1.80,2.00),
      mOU(2.5,1.85,1.95),
      mAH(0,1.90,1.90),
      mCS([['1-1',6.5],['1-0',7.0],['2-1',8.5],['0-1',7.5],['2-0',9.0],['0-0',9.0]]),
    ],
  },
  {
    id:'uel_002',
    competition:'Europa League', competitionIcon:'🟠', country:'Europe',
    homeTeam:'Sevilla', awayTeam:'Eintracht Frankfurt', kickoff:ho(3),
    markets:[
      m1x2(2.00,3.30,3.75),
      mBTTS(1.82,1.98),
      mOU(2.5,1.88,1.92),
      mCS([['1-0',6.5],['2-1',8.0],['1-1',6.5],['0-1',8.5],['2-0',8.5],['0-0',9.5]]),
    ],
  },
  {
    id:'uel_003',
    competition:'Europa League', competitionIcon:'🟠', country:'Europe',
    homeTeam:'Tottenham', awayTeam:'Fenerbahce', kickoff:ho(5),
    markets:[
      m1x2(1.70,3.80,5.00),
      mBTTS(1.78,2.02),
      mOU(2.5,1.80,2.00),
      mAH(-1.0,2.10,1.80),
      mCS([['2-0',7.0],['2-1',7.5],['1-0',6.5],['3-0',9.5],['1-1',7.5]]),
    ],
  },

  // ══════════════════════════════════════════════════════════════════
  // LA LIGA
  // ══════════════════════════════════════════════════════════════════
  {
    id:'laliga_001',
    competition:'La Liga', competitionIcon:'🇪🇸', country:'Spain',
    homeTeam:'Real Madrid', awayTeam:'Sevilla', kickoff:ho(2),
    markets:[
      m1x2(1.55,4.00,6.00),
      mDC(1.18,1.22,2.60),
      mBTTS(1.85,1.95),
      mOU(2.5,1.75,2.05),
      mOU(3.5,2.80,1.45),
      mAH(-1.5,2.20,1.75),
      mCS([['2-0',6.5],['3-0',8.5],['2-1',7.5],['1-0',6.5],['3-1',10],['1-1',8.0]]),
    ],
  },
  {
    id:'laliga_002', isFeatured:true,
    competition:'La Liga', competitionIcon:'🇪🇸', country:'Spain',
    homeTeam:'Barcelona', awayTeam:'Real Sociedad', kickoff:ho(4),
    markets:[
      m1x2(1.65,3.80,5.50),
      mDC(1.20,1.25,2.50),
      mBTTS(1.82,1.98),
      mOU(2.5,1.78,2.02),
      mAH(-1.0,2.05,1.85),
      mCS([['2-0',7.0],['3-1',9.5],['2-1',7.5],['1-0',6.5],['3-0',9.0],['1-1',8.0],['0-1',16]]),
    ],
  },
  {
    id:'laliga_003',
    competition:'La Liga', competitionIcon:'🇪🇸', country:'Spain',
    homeTeam:'Atletico Madrid', awayTeam:'Valencia', kickoff:ho(6),
    markets:[
      m1x2(1.75,3.50,4.50),
      mBTTS(1.70,2.10),
      mOU(2.5,1.88,1.92),
      mAH(-0.5,1.95,1.95),
      mCS([['1-0',6.5],['2-0',8.0],['2-1',8.5],['1-1',7.0],['0-0',9.5],['0-1',12]]),
    ],
  },
  {
    id:'laliga_004',
    competition:'La Liga', competitionIcon:'🇪🇸', country:'Spain',
    homeTeam:'Athletic Bilbao', awayTeam:'Villarreal', kickoff:ho(8),
    markets:[
      m1x2(2.20,3.30,3.20),
      mBTTS(1.80,2.00),
      mOU(2.5,1.90,1.90),
      mCS([['1-0',7.0],['1-1',6.5],['2-1',8.5],['0-1',7.5],['2-0',9.0]]),
    ],
  },
  {
    id:'laliga_005',
    competition:'La Liga', competitionIcon:'🇪🇸', country:'Spain',
    homeTeam:'Osasuna', awayTeam:'Getafe', kickoff:ho(10),
    markets:[
      m1x2(2.30,3.10,3.20),
      mBTTS(1.88,1.92),
      mOU(2.5,1.95,1.85),
      mCS([['1-0',7.0],['1-1',6.5],['0-1',7.5],['2-1',9.0],['0-0',9.5]]),
    ],
  },

  // ══════════════════════════════════════════════════════════════════
  // SERIE A
  // ══════════════════════════════════════════════════════════════════
  {
    id:'seriea_001', isFeatured:true,
    competition:'Serie A', competitionIcon:'🇮🇹', country:'Italy',
    homeTeam:'Inter Milan', awayTeam:'Juventus', kickoff:ho(2),
    markets:[
      m1x2(2.20,3.20,3.30),
      mDC(1.40,1.52,1.62),
      mBTTS(1.78,2.02),
      mOU(2.5,1.85,1.95),
      mOU(1.5,1.25,3.80),
      mAH(0,1.90,1.90),
      mHtFt(5.0,9.0,25,3.8,4.2,8.5,14,18,8.0),
      mCS([['1-1',6.0],['2-1',8.0],['1-0',7.0],['2-0',8.5],['0-1',7.5],['0-0',8.5],['1-2',9.5]]),
    ],
  },
  {
    id:'seriea_002',
    competition:'Serie A', competitionIcon:'🇮🇹', country:'Italy',
    homeTeam:'AC Milan', awayTeam:'Roma', kickoff:ho(4),
    markets:[
      m1x2(2.00,3.30,3.80),
      mBTTS(1.80,2.00),
      mOU(2.5,1.88,1.92),
      mAH(-0.25,1.95,1.95),
      mCS([['1-0',7.0],['2-0',8.5],['1-1',6.5],['2-1',8.5],['0-1',9.0],['0-0',9.5]]),
    ],
  },
  {
    id:'seriea_003',
    competition:'Serie A', competitionIcon:'🇮🇹', country:'Italy',
    homeTeam:'Napoli', awayTeam:'Lazio', kickoff:ho(6),
    markets:[
      m1x2(1.90,3.50,4.20),
      mBTTS(1.75,2.05),
      mOU(2.5,1.80,2.00),
      mAH(-0.5,2.05,1.85),
      mCS([['1-0',6.5],['2-1',8.0],['2-0',7.5],['1-1',6.5],['0-0',9.5],['0-1',12]]),
    ],
  },
  {
    id:'seriea_004',
    competition:'Serie A', competitionIcon:'🇮🇹', country:'Italy',
    homeTeam:'Atalanta', awayTeam:'Fiorentina', kickoff:ho(8),
    markets:[
      m1x2(1.95,3.40,4.00),
      mBTTS(1.75,2.05),
      mOU(2.5,1.78,2.02),
      mOU(3.5,3.00,1.45),
      mCS([['2-1',7.5],['2-0',7.5],['1-1',6.5],['3-1',10],['1-0',7.0],['0-1',11]]),
    ],
  },
  {
    id:'seriea_005',
    competition:'Serie A', competitionIcon:'🇮🇹', country:'Italy',
    homeTeam:'Torino', awayTeam:'Bologna', kickoff:ho(10),
    markets:[
      m1x2(2.30,3.20,3.10),
      mBTTS(1.85,1.95),
      mOU(2.5,1.92,1.88),
      mCS([['1-1',6.5],['1-0',7.0],['0-1',7.0],['2-1',9.0],['0-0',9.0]]),
    ],
  },

  // ══════════════════════════════════════════════════════════════════
  // BUNDESLIGA
  // ══════════════════════════════════════════════════════════════════
  {
    id:'buli_001', isFeatured:true,
    competition:'Bundesliga', competitionIcon:'🇩🇪', country:'Germany',
    homeTeam:'Bayern Munich', awayTeam:'Borussia Dortmund', kickoff:ho(2),
    markets:[
      m1x2(1.70,3.80,4.80),
      mDC(1.22,1.32,2.20),
      mBTTS(1.78,2.02),
      mOU(2.5,1.70,2.10),
      mOU(3.5,2.60,1.50),
      mAH(-1.0,2.10,1.80),
      mHtFt(3.5,7.5,22,4.0,5.0,10,16,20,12),
      mCS([['2-1',7.5],['3-1',9.0],['2-0',7.0],['3-0',9.5],['1-1',7.0],['1-0',7.5],['1-2',14],['4-1',14]]),
    ],
  },
  {
    id:'buli_002',
    competition:'Bundesliga', competitionIcon:'🇩🇪', country:'Germany',
    homeTeam:'Bayer Leverkusen', awayTeam:'RB Leipzig', kickoff:ho(4),
    markets:[
      m1x2(2.10,3.30,3.40),
      mBTTS(1.80,2.00),
      mOU(2.5,1.85,1.95),
      mAH(0,1.90,1.90),
      mCS([['1-0',7.0],['2-1',8.0],['1-1',6.5],['2-0',8.5],['0-1',8.0],['0-0',9.5]]),
    ],
  },
  {
    id:'buli_003',
    competition:'Bundesliga', competitionIcon:'🇩🇪', country:'Germany',
    homeTeam:'Borussia Mönchengladbach', awayTeam:'Stuttgart', kickoff:ho(6),
    markets:[
      m1x2(2.25,3.20,3.20),
      mBTTS(1.82,1.98),
      mOU(2.5,1.90,1.90),
      mCS([['1-1',6.5],['1-0',7.0],['0-1',7.5],['2-1',9.0],['2-0',9.0],['0-0',9.5]]),
    ],
  },
  {
    id:'buli_004',
    competition:'Bundesliga', competitionIcon:'🇩🇪', country:'Germany',
    homeTeam:'Eintracht Frankfurt', awayTeam:'Wolfsburg', kickoff:ho(8),
    markets:[
      m1x2(2.00,3.30,3.80),
      mBTTS(1.80,2.00),
      mOU(2.5,1.88,1.92),
      mCS([['1-0',6.5],['2-0',8.5],['1-1',6.5],['2-1',8.5],['0-1',9.5],['0-0',10]]),
    ],
  },
  {
    id:'buli_005',
    competition:'Bundesliga', competitionIcon:'🇩🇪', country:'Germany',
    homeTeam:'Freiburg', awayTeam:'Mainz', kickoff:ho(10),
    markets:[
      m1x2(2.10,3.20,3.60),
      mBTTS(1.82,1.98),
      mOU(2.5,1.90,1.90),
      mCS([['1-0',7.0],['1-1',6.5],['2-1',9.0],['0-1',8.5],['0-0',9.5]]),
    ],
  },

  // ══════════════════════════════════════════════════════════════════
  // LIGUE 1
  // ══════════════════════════════════════════════════════════════════
  {
    id:'l1_001', isFeatured:true,
    competition:'Ligue 1', competitionIcon:'🇫🇷', country:'France',
    homeTeam:'PSG', awayTeam:'Marseille', kickoff:ho(3),
    markets:[
      m1x2(1.55,4.00,5.50),
      mDC(1.18,1.22,2.50),
      mBTTS(1.85,1.95),
      mOU(2.5,1.75,2.05),
      mOU(3.5,2.90,1.44),
      mAH(-1.5,2.15,1.75),
      mCS([['2-0',6.5],['3-0',8.5],['2-1',7.5],['1-0',6.5],['3-1',10],['1-1',8.5]]),
    ],
  },
  {
    id:'l1_002',
    competition:'Ligue 1', competitionIcon:'🇫🇷', country:'France',
    homeTeam:'Monaco', awayTeam:'Lyon', kickoff:ho(5),
    markets:[
      m1x2(1.95,3.40,3.90),
      mBTTS(1.82,1.98),
      mOU(2.5,1.88,1.92),
      mAH(-0.25,2.00,1.90),
      mCS([['1-0',6.5],['2-1',8.5],['1-1',6.5],['2-0',8.5],['0-1',9.5],['0-0',10]]),
    ],
  },
  {
    id:'l1_003',
    competition:'Ligue 1', competitionIcon:'🇫🇷', country:'France',
    homeTeam:'Lens', awayTeam:'Nice', kickoff:ho(7),
    markets:[
      m1x2(2.20,3.20,3.30),
      mBTTS(1.82,1.98),
      mOU(2.5,1.90,1.90),
      mCS([['1-0',7.0],['1-1',6.5],['0-1',7.5],['2-1',9.0],['2-0',9.5],['0-0',9.5]]),
    ],
  },
  {
    id:'l1_004',
    competition:'Ligue 1', competitionIcon:'🇫🇷', country:'France',
    homeTeam:'Lille', awayTeam:'Rennes', kickoff:ho(9),
    markets:[
      m1x2(2.00,3.30,3.75),
      mBTTS(1.80,2.00),
      mOU(2.5,1.90,1.90),
      mCS([['1-0',7.0],['2-0',8.5],['1-1',6.5],['0-0',10],['2-1',9.0],['0-1',9.5]]),
    ],
  },

  // ══════════════════════════════════════════════════════════════════
  // AFCON
  // ══════════════════════════════════════════════════════════════════
  {
    id:'afcon_001', isFeatured:true,
    competition:'AFCON', competitionIcon:'🌍', country:'Africa',
    homeTeam:'Nigeria', awayTeam:'Senegal', kickoff:ho(1),
    markets:[
      m1x2(2.50,2.90,2.80),
      mDC(1.52,1.50,1.55),
      mBTTS(1.90,1.90),
      mOU(2.5,2.00,1.80),
      mOU(1.5,1.38,2.95),
      mAH(0,1.90,1.90),
      mCS([['1-0',7.0],['0-1',7.0],['1-1',5.5],['2-1',9.0],['1-2',9.0],['0-0',7.5],['2-0',10],['0-2',10]]),
    ],
  },
  {
    id:'afcon_002',
    competition:'AFCON', competitionIcon:'🌍', country:'Africa',
    homeTeam:'Morocco', awayTeam:'Egypt', kickoff:ho(3),
    markets:[
      m1x2(2.20,2.90,3.10),
      mBTTS(1.95,1.85),
      mOU(2.5,1.98,1.82),
      mOU(1.5,1.35,3.05),
      mCS([['1-0',7.0],['0-1',8.0],['1-1',5.5],['0-0',7.5],['2-0',10],['2-1',10]]),
    ],
  },
  {
    id:'afcon_003',
    competition:'AFCON', competitionIcon:'🌍', country:'Africa',
    homeTeam:'Ghana', awayTeam:'Ivory Coast', kickoff:ho(5),
    markets:[
      m1x2(2.70,2.95,2.60),
      mBTTS(1.88,1.92),
      mOU(2.5,2.00,1.80),
      mCS([['1-0',7.5],['0-1',7.0],['1-1',5.5],['0-0',8.0],['2-1',10],['1-2',9.5]]),
    ],
  },
  {
    id:'afcon_004',
    competition:'AFCON', competitionIcon:'🌍', country:'Africa',
    homeTeam:'Cameroon', awayTeam:'South Africa', kickoff:ho(7),
    markets:[
      m1x2(2.10,2.90,3.40),
      mBTTS(1.92,1.88),
      mOU(2.5,1.95,1.85),
      mCS([['1-0',7.0],['0-0',8.0],['1-1',6.0],['2-0',9.5],['0-1',9.0],['2-1',10]]),
    ],
  },
  {
    id:'afcon_005',
    competition:'AFCON', competitionIcon:'🌍', country:'Africa',
    homeTeam:'Algeria', awayTeam:'Tunisia', kickoff:ho(9),
    markets:[
      m1x2(2.30,3.00,3.20),
      mBTTS(1.90,1.90),
      mOU(2.5,1.95,1.85),
      mCS([['1-0',7.0],['0-0',8.0],['1-1',6.0],['2-0',9.5],['0-1',9.0]]),
    ],
  },
  {
    id:'afcon_006',
    competition:'AFCON', competitionIcon:'🌍', country:'Africa',
    homeTeam:'DR Congo', awayTeam:'Mali', kickoff:ho(11),
    markets:[
      m1x2(2.40,2.90,2.90),
      mBTTS(1.92,1.88),
      mOU(2.5,1.98,1.82),
      mCS([['1-0',7.5],['0-1',7.5],['1-1',6.0],['0-0',8.5],['2-1',10],['1-2',10]]),
    ],
  },

  // ══════════════════════════════════════════════════════════════════
  // SCOTTISH PREMIERSHIP
  // ══════════════════════════════════════════════════════════════════
  {
    id:'spfl_001',
    competition:'Scottish Premiership', competitionIcon:'🏴󠁧󠁢󠁳󠁣󠁴󠁿', country:'Scotland',
    homeTeam:'Celtic', awayTeam:'Rangers', kickoff:ho(3),
    markets:[
      m1x2(1.90,3.50,4.00),
      mDC(1.30,1.50,1.85),
      mBTTS(1.80,2.00),
      mOU(2.5,1.85,1.95),
      mAH(-0.25,2.00,1.90),
      mCS([['1-0',6.5],['2-1',7.5],['1-1',6.0],['2-0',7.5],['0-1',9.0],['0-0',9.0],['3-0',11]]),
    ],
  },

  // ══════════════════════════════════════════════════════════════════
  // PORTUGUESE PRIMEIRA LIGA
  // ══════════════════════════════════════════════════════════════════
  {
    id:'por_001',
    competition:'Primeira Liga', competitionIcon:'🇵🇹', country:'Portugal',
    homeTeam:'Benfica', awayTeam:'Porto', kickoff:ho(4),
    markets:[
      m1x2(2.10,3.30,3.40),
      mBTTS(1.80,2.00),
      mOU(2.5,1.85,1.95),
      mAH(0,1.90,1.90),
      mCS([['1-0',7.0],['1-1',6.5],['2-1',8.0],['0-1',8.0],['2-0',8.5],['0-0',9.5]]),
    ],
  },
  {
    id:'por_002',
    competition:'Primeira Liga', competitionIcon:'🇵🇹', country:'Portugal',
    homeTeam:'Sporting CP', awayTeam:'Braga', kickoff:ho(6),
    markets:[
      m1x2(1.80,3.50,4.50),
      mBTTS(1.80,2.00),
      mOU(2.5,1.82,1.98),
      mCS([['1-0',6.5],['2-0',8.0],['2-1',8.0],['1-1',7.0],['0-1',12],['0-0',10]]),
    ],
  },

  // ══════════════════════════════════════════════════════════════════
  // TURKISH SUPER LIG
  // ══════════════════════════════════════════════════════════════════
  {
    id:'tur_001',
    competition:'Süper Lig', competitionIcon:'🇹🇷', country:'Turkey',
    homeTeam:'Galatasaray', awayTeam:'Fenerbahce', kickoff:ho(5),
    markets:[
      m1x2(2.20,3.20,3.20),
      mBTTS(1.78,2.02),
      mOU(2.5,1.85,1.95),
      mAH(0,1.90,1.90),
      mCS([['1-1',6.0],['1-0',7.0],['0-1',7.0],['2-1',8.5],['1-2',8.5],['0-0',8.5]]),
    ],
  },

  // ══════════════════════════════════════════════════════════════════
  // DUTCH EREDIVISIE
  // ══════════════════════════════════════════════════════════════════
  {
    id:'ned_001',
    competition:'Eredivisie', competitionIcon:'🇳🇱', country:'Netherlands',
    homeTeam:'Ajax', awayTeam:'PSV Eindhoven', kickoff:ho(4),
    markets:[
      m1x2(2.30,3.20,3.10),
      mBTTS(1.78,2.02),
      mOU(2.5,1.80,2.00),
      mOU(3.5,2.90,1.44),
      mCS([['1-1',6.5],['2-1',7.5],['1-2',7.5],['2-0',8.5],['0-2',9.5],['1-0',7.5]]),
    ],
  },

  // ══════════════════════════════════════════════════════════════════
  // NBA / NFL / UFC / TENNIS / CRICKET
  // ══════════════════════════════════════════════════════════════════
  {
    id:'nba_001',
    competition:'NBA', competitionIcon:'🏀', country:'USA',
    homeTeam:'LA Lakers', awayTeam:'Boston Celtics', kickoff:ho(5),
    markets:[
      { type:'1x2', label:'Match Result', outcomes:[
        { id:'1', label:'LA Lakers',      oddsBps:21000 },
        { id:'2', label:'Boston Celtics', oddsBps:17500 },
      ]},
      mOU(220.5,1.90,1.90),
      mOU(210.5,1.50,2.50),
    ],
  },
  {
    id:'nba_002',
    competition:'NBA', competitionIcon:'🏀', country:'USA',
    homeTeam:'Golden State Warriors', awayTeam:'Miami Heat', kickoff:ho(7),
    markets:[
      { type:'1x2', label:'Match Result', outcomes:[
        { id:'1', label:'Golden State Warriors', oddsBps:17000 },
        { id:'2', label:'Miami Heat',            oddsBps:22000 },
      ]},
      mOU(215.5,1.90,1.90),
    ],
  },
  {
    id:'nfl_001',
    competition:'NFL', competitionIcon:'🏈', country:'USA',
    homeTeam:'Kansas City Chiefs', awayTeam:'San Francisco 49ers', kickoff:ho(6),
    markets:[
      { type:'1x2', label:'Match Result', outcomes:[
        { id:'1', label:'Kansas City Chiefs',  oddsBps:18000 },
        { id:'2', label:'San Francisco 49ers', oddsBps:20500 },
      ]},
      mOU(48.5,1.90,1.90),
    ],
  },
  {
    id:'mma_001',
    competition:'UFC', competitionIcon:'🥊', country:'USA',
    homeTeam:'Jon Jones', awayTeam:'Stipe Miocic', kickoff:ho(9),
    markets:[
      { type:'1x2', label:'Fight Result', outcomes:[
        { id:'1', label:'Jon Jones',    oddsBps:14500 },
        { id:'2', label:'Stipe Miocic', oddsBps:28000 },
      ]},
      mOU(2.5,2.00,1.80),
    ],
  },
  {
    id:'tennis_001',
    competition:'ATP Wimbledon', competitionIcon:'🎾', country:'UK',
    homeTeam:'C. Alcaraz', awayTeam:'N. Djokovic', kickoff:ho(2),
    markets:[
      { type:'1x2', label:'Match Result', outcomes:[
        { id:'1', label:'C. Alcaraz',  oddsBps:18500 },
        { id:'2', label:'N. Djokovic', oddsBps:20000 },
      ]},
      mOU(3.5,1.70,2.10),
    ],
  },
  {
    id:'cricket_001',
    competition:'ICC World Cup', competitionIcon:'🏏', country:'International',
    homeTeam:'India', awayTeam:'Pakistan', kickoff:ho(1),
    markets:[
      { type:'1x2', label:'Match Result', outcomes:[
        { id:'1', label:'India',   oddsBps:16000 },
        { id:'2', label:'Pakistan',oddsBps:23000 },
      ]},
    ],
  },
];
