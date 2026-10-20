export interface LibraryCard {
  category: string;
  title: string;
  description: string;
  image: string;
  alt: string;
  meta: string;
  slug: string;
}
export const libraryCards: readonly LibraryCard[] = [
  {
    category: 'practice',
    title: 'Мистецтво наміру',
    description: 'Як перетворити розмите бажання на зрозуміле запитання до себе та конкретну дію.',
    image: '/assets/intention.webp',
    alt: 'Запалена свічка біля відкритого щоденника',
    meta: 'ПРАКТИКА · 6 ХВ ЧИТАННЯ',
    slug: 'intention',
  },
  {
    category: 'symbols',
    title: 'Мова символів',
    description:
      'Коло, поріг і світло: як читати образи з увагою до контексту та власного досвіду.',
    image: '/assets/symbols.webp',
    alt: 'Рука малює символ сонця пером на папері',
    meta: 'СИМВОЛИ · 5 ХВ ЧИТАННЯ',
    slug: 'symbols',
  },
  {
    category: 'tradition',
    title: 'Шлях дослідника',
    description:
      'З чого почати знайомство з окультними текстами та як відрізняти джерело від переказу.',
    image: '/assets/researcher.webp',
    alt: 'Латунний компас, кристал і зелений записник',
    meta: 'ТРАДИЦІЇ · 7 ХВ ЧИТАННЯ',
    slug: 'sources',
  },
];
