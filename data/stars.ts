/**
 * Real Arabic and Bedouin star heritage. Coordinates (J2000) are taken from the
 * HYG catalogue (data/bright-stars.json) so the lore stars sit exactly where the
 * chart draws them. Etymology follows the standard references (Kunitzsch & Smart,
 * "A Dictionary of Modern Star Names"); anything uncertain is flagged, not guessed.
 *
 * This dataset grounds the Guide so it narrates true heritage, not hallucination.
 */

export interface LoreStar {
  id: string;
  proper: string; // catalogue proper name, used to join with bright-stars.json
  arabic: string;
  transliteration: string;
  meaning: string;
  constellation: string;
  con: string; // IAU 3-letter code
  ra: number; // J2000 right ascension, degrees
  dec: number; // J2000 declination, degrees
  mag: number; // apparent visual magnitude
  lore: string; // real, checkable heritage
  seasonMarker?: string; // role in the Anwa seasonal calendar, where it has one
}

export const LORE_STARS: LoreStar[] = [
  {
    id: "suhail",
    proper: "Canopus",
    arabic: "سهيل",
    transliteration: "Suhail",
    meaning: "Suhail, a proper name; the great star of the south",
    constellation: "Carina",
    con: "Car",
    ra: 95.9879,
    dec: -52.6957,
    mag: -0.62,
    lore: "The second brightest star in the night sky and one of the most culturally important stars in Arabia. Bedouin navigators steered by it and named sons after it.",
    seasonMarker:
      "Its heliacal rising, the first pre-dawn sighting low in the south in late summer, was read across Arabia as the sign that the worst of the heat had broken and cooler nights were coming.",
  },
  {
    id: "aldebaran",
    proper: "Aldebaran",
    arabic: "الدبران",
    transliteration: "al-Dabaran",
    meaning: "the follower",
    constellation: "Taurus",
    con: "Tau",
    ra: 68.9802,
    dec: 16.5093,
    mag: 0.87,
    lore: "Named the follower because it rises after, and appears to chase, the Pleiades across the sky. It marks the glaring eye of the bull.",
  },
  {
    id: "altair",
    proper: "Altair",
    arabic: "الطائر",
    transliteration: "al-Ta'ir",
    meaning: "the flying one",
    constellation: "Aquila",
    con: "Aql",
    ra: 297.6958,
    dec: 8.8683,
    mag: 0.76,
    lore: "From al-nasr al-ta'ir, the flying eagle. The two stars flanking it were read as the eagle's outspread wings.",
  },
  {
    id: "vega",
    proper: "Vega",
    arabic: "الواقع",
    transliteration: "al-Waqi'",
    meaning: "the swooping one",
    constellation: "Lyra",
    con: "Lyr",
    ra: 279.2346,
    dec: 38.7837,
    mag: 0.03,
    lore: "From al-nasr al-waqi', the swooping or falling eagle, the counterpart to the flying eagle Altair across the summer Milky Way.",
  },
  {
    id: "betelgeuse",
    proper: "Betelgeuse",
    arabic: "يد الجوزاء",
    transliteration: "Yad al-Jawza",
    meaning: "the hand of al-Jawza",
    constellation: "Orion",
    con: "Ori",
    ra: 88.7929,
    dec: 7.4071,
    mag: 0.45,
    lore: "The red shoulder of Orion. The European name is a centuries-old garbling of the Arabic phrase for the hand of al-Jawza, the central figure the Arabs saw in these stars.",
  },
  {
    id: "rigel",
    proper: "Rigel",
    arabic: "رجل الجوزاء",
    transliteration: "Rijl al-Jawza",
    meaning: "the foot of al-Jawza",
    constellation: "Orion",
    con: "Ori",
    ra: 78.6345,
    dec: -8.2016,
    mag: 0.18,
    lore: "The bright blue-white foot of al-Jawza, the figure the Arabs placed where Europe later drew Orion. It sits just below the celestial equator, near overhead from Al Qua'a in winter.",
  },
  {
    id: "deneb",
    proper: "Deneb",
    arabic: "ذنب الدجاجة",
    transliteration: "Dhanab al-Dajaja",
    meaning: "the tail of the hen",
    constellation: "Cygnus",
    con: "Cyg",
    ra: 310.358,
    dec: 45.2803,
    mag: 1.25,
    lore: "Marks the tail of al-Dajaja, the hen, the figure the Arabs traced along the bright summer Milky Way that runs straight overhead at Al Qua'a in the warm months.",
  },
  {
    id: "fomalhaut",
    proper: "Fomalhaut",
    arabic: "فم الحوت",
    transliteration: "Fam al-Hut",
    meaning: "the mouth of the fish",
    constellation: "Piscis Austrinus",
    con: "PsA",
    ra: 344.4126,
    dec: -29.6222,
    mag: 1.17,
    lore: "A lone bright star low in the autumn south, named for the mouth of the southern fish. With little else around it, it was an easy seasonal marker.",
  },
  {
    id: "algol",
    proper: "Algol",
    arabic: "الغول",
    transliteration: "al-Ghul",
    meaning: "the ghoul",
    constellation: "Perseus",
    con: "Per",
    ra: 47.0422,
    dec: 40.9556,
    mag: 2.09,
    lore: "The demon star. It is an eclipsing binary that visibly dims and brightens every few days, and the unsettling wink earned it the name of the desert ghoul.",
  },
  {
    id: "sirius",
    proper: "Sirius",
    arabic: "الشعرى",
    transliteration: "al-Shi'ra",
    meaning: "al-Shi'ra, the brightest star",
    constellation: "Canis Major",
    con: "CMa",
    ra: 101.2872,
    dec: -16.7161,
    mag: -1.44,
    lore: "The brightest star in the whole sky. The Arabs distinguished al-Shi'ra al-Yamaniyya, this star to the south, from al-Shi'ra al-Shamiyya, Procyon to the north.",
  },
  {
    id: "thurayya",
    proper: "Alcyone",
    arabic: "الثريا",
    transliteration: "al-Thurayya",
    meaning: "the abundant little ones",
    constellation: "Taurus (the Pleiades)",
    con: "Tau",
    ra: 56.8712,
    dec: 24.1051,
    mag: 2.85,
    lore: "The Pleiades, a tight knot of stars and one of the most loved sights in Arab sky lore. Alcyone is its brightest member. al-Thurayya remains a common given name.",
    seasonMarker:
      "Its movements anchored the seasonal calendar: the timing of its dawn rising and dusk setting told farmers and herders when the year had turned.",
  },
];

/** Quick lookup by catalogue proper name, so the chart can flag lore stars in brass. */
export const LORE_BY_PROPER: Record<string, LoreStar> = Object.fromEntries(
  LORE_STARS.map((s) => [s.proper, s]),
);

/** The two cultural systems the Guide can draw on. Both are real and well documented. */
export interface CulturalSystem {
  id: string;
  arabic: string;
  transliteration: string;
  title: string;
  summary: string;
}

export const CULTURAL_SYSTEMS: CulturalSystem[] = [
  {
    id: "manazil",
    arabic: "منازل القمر",
    transliteration: "Manazil al-Qamar",
    title: "The 28 lunar mansions",
    summary:
      "The 28 small star groups the Moon passes through, one each night, as it goes round the sky in a sidereal month. Each mansion has a name and a set of stars, and together they form a nightly calendar the Moon itself keeps.",
  },
  {
    id: "anwa",
    arabic: "أنواء",
    transliteration: "Anwa",
    title: "The Bedouin star calendar",
    summary:
      "The old desert system that ties the heliacal risings and settings of stars to the seasons, the weather, and the expected rains. A naw' is the moment one star group sets in the west at dawn as another rises opposite. Reading the anwa is reading the year from the sky, and it is where this platform takes its name.",
  },
];
