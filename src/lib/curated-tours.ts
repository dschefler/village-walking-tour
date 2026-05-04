export interface CuratedTour {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  locations: string[];
}

export const CURATED_TOURS: CuratedTour[] = [
  {
    slug: 'black-history',
    name: 'Black History in Southampton Village',
    tagline: "Honoring the contributions and legacy of Black residents who shaped Southampton's story",
    description:
      'Trace the profound contributions and enduring legacy of Black residents in Southampton — from the story of Pyrrhus Concer, a formerly enslaved man who became a celebrated figure in whaling history, to the North End community institutions that persevered through generations.',
    locations: [
      'SAAM',
      'Pyrrhus Concer Home',
      'Mercator Cooper Home',
      'The Mackie House',
      'Old North End Cemetery',
      'Bowden Square',
    ],
  },
  {
    slug: 'revolutionary',
    name: 'Revolutionary Southampton Village',
    tagline: "Walk in the footsteps of Patriots and Loyalists during America's founding era",
    description:
      "Visit the homes and landmarks that witnessed Southampton's turbulent years during the American Revolution. Long Island was occupied by British forces for much of the war — these sites tell the story of loyalty, resistance, and survival on the East End.",
    locations: [
      'Erskine House',
      'Pelletreau Shop',
      '1708 House',
      'The Mackie House',
      'Halsey House',
    ],
  },
  {
    slug: 'veterans',
    name: 'Veterans Walk Through Southampton Village',
    tagline: "Honoring the brave men and women who served our country",
    description:
      "Honor Southampton's veterans with a tour of the memorials, monuments, and historic sites dedicated to those who served from the Revolutionary War through the 20th century. As our nation approaches its 250th Anniversary, these sites remind us of the sacrifices made for freedom.",
    locations: [
      'Southampton History Museum',
      'Monument Square',
      'Veterans Hall',
      'Lake Agawam',
      '1708 House',
      'Erskine House',
    ],
  },
];

export function getCuratedTour(slug: string): CuratedTour | undefined {
  return CURATED_TOURS.find((t) => t.slug === slug);
}

export function matchesLocation(siteName: string, curatedName: string): boolean {
  const sn = siteName.toLowerCase();
  const cn = curatedName.toLowerCase();
  return sn.includes(cn) || cn.includes(sn);
}
