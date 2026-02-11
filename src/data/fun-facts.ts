/**
 * "Did You Know?" fun facts for walking tour sites.
 * Keyed by partial site name for flexible matching.
 */

const SITE_FACTS: Record<string, string[]> = {
  'rogers memorial library': [
    'Harriet Jones Rogers left just $10,000 and a plot of land in 1892 to build a free library — she\'d never even lived in Southampton.',
    'The original 1895 building on Job\'s Lane had room for 20,000 books and an upstairs apartment for the caretaker.',
    'One of the library\'s first book donations — 400 volumes — came from William Pelletreau, whose family\'s silver shop is also on this tour.',
    'The new building opened in 2000 at 91 Coopers Farm Road — over 100 years after the original, and 10 times the size.',
  ],
  'wwi memorial': [
    'The 1923 memorial honors 325 Southampton men and boys who served in WWI — in a village with a tiny year-round population.',
    'Architect William Edgar Moran carved the shields of four nations into the limestone: France, England, New York, and the United States.',
    'Stand inside the colonnade and you can see both Lake Agawam and the Atlantic Ocean through the columns.',
    '"Agawam" is a Native American word — the Shinnecock people lived on these shores for thousands of years before English settlers arrived in 1640.',
  ],
  'agawam park': [
    'The 1923 memorial honors 325 Southampton men and boys who served in WWI — in a village with a tiny year-round population.',
    'Architect William Edgar Moran carved the shields of four nations into the limestone: France, England, New York, and the United States.',
    'Stand inside the colonnade and you can see both Lake Agawam and the Atlantic Ocean through the columns.',
    '"Agawam" is a Native American word — the Shinnecock people lived on these shores for thousands of years before English settlers arrived in 1640.',
  ],
  'southampton history museum': [
    'The museum campus spans 12 historic structures covering nearly 400 years of local history — all on one lane.',
    'The Rogers Mansion at its center was built in 1843 by whaling captain Albert Rogers, at the peak of the whaling industry.',
    'The Rogers family owned this land since 1648 — nearly 200 years before the mansion was built.',
    'The museum was organized in 1898 and originally held pageants and antique lectures, not just exhibits.',
  ],
  'pelletreau silver shop': [
    'This 1686 trade shop is one of the oldest continuously operated trade shops in the Americas — still open to visitors today.',
    'Elias Pelletreau apprenticed in Manhattan under French Huguenot master Simeon Soumaine, then returned to Southampton to rival Paul Revere in talent.',
    'During the Revolutionary War, the Pelletreau family fled to Connecticut as refugees for six years before returning to this shop.',
    'Three generations of Pelletreaus worked silver in this building, crafting everything from shoe buckles to tankards.',
  ],
  'halsey house': [
    'Built circa 1683, this is believed to be the oldest English frame house in all of New York State.',
    'Around 1730 the entire house was physically rotated to face South Main Street — and reshaped into a fashionable saltbox.',
    'Thomas Halsey Sr. sailed from England in the 1630s with his wife and four children — among Southampton\'s very first English colonists.',
    'The Southampton History Museum purchased the house in 1958 to save it from demolition and has preserved it ever since.',
  ],
};

/**
 * Look up facts for a site by name. Does case-insensitive partial matching
 * so "Rogers Memorial Library" matches the key "rogers memorial library",
 * and "WWI Memorial / Agawam Park" matches "wwi memorial".
 */
export function getFactsForSite(siteName: string): string[] {
  const lower = siteName.toLowerCase();
  for (const [key, facts] of Object.entries(SITE_FACTS)) {
    if (lower.includes(key) || key.includes(lower)) {
      return facts;
    }
  }
  return [];
}
