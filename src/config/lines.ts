// Satirical lines and ticker headlines
// HARD RULE: Fictional situational humour only (traffic, press, microphones, rallies, tea breaks)

export const RIVAL_LINES = [
  'Ruko bhai, ruko!',
  'Ek minute baat suno!',
  'Itni jaldi kya hai?',
  'Bas thoda aur!',
  'Press conference kab doge?',
  'Hawa ka rukh badal raha hai!',
  'Questions ke answer kahan hain?!',
  'Microphone se bhaagna band karo!',
];

export const POPUP_SHOUTS = [
  '+Vote!',
  'Rally Mode!',
  'Breaking News!',
  'Chai Time!',
  'Massive Turnout!',
  'Double Campaign!',
  'Cordon Clear!',
  'Helicopter Wave!',
];

export const NEWS_TICKER_TEMPLATES = [
  'BREAKING: Neta Ji runs {distance} m and collects {votes} votes before being caught by Vipaksh Bhai.',
  'SPECIAL REPORT: High-speed election sprint halts after {distance} m with {votes} ballot slips secured.',
  'WITNESS ACCOUNT: Neta Ji sprinted through {distance} m of street traffic, bagging {votes} public votes!',
  'LIVE HEADLINE: Massive marathon campaign covers {distance} meters with {votes} votes in the bank!',
];

export function formatGameOverTicker(distance: number, votes: number): string {
  const index = Math.floor(Math.random() * NEWS_TICKER_TEMPLATES.length);
  const template = NEWS_TICKER_TEMPLATES[index];
  return template
    .replace('{distance}', Math.floor(distance).toLocaleString())
    .replace('{votes}', votes.toLocaleString());
}
