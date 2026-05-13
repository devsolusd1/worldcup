export type CountryToken = {
  id: string;
  name: string;
  code: string;
  iso2: string;
  ticker: string;
  mint: string | null;
  launchlabUrl?: string;
};

export type HubToken = {
  ticker: string;
  name: string;
  mint: string | null;
  description: string;
  launchlabUrl?: string;
};

export const HUB: HubToken = {
  ticker: "CUP",
  name: "World Cup Raydium",
  mint: null,
  description:
    "The hub token. A portion of trading fees from every country coin flows back to buy and burn CUP.",
};

const c = (
  id: string,
  name: string,
  code: string,
  iso2: string,
): CountryToken => ({
  id,
  name,
  code,
  iso2,
  ticker: code,
  mint: null,
});

// 2026 FIFA World Cup — official 48 qualified teams.
// Source: https://en.wikipedia.org/wiki/2026_FIFA_World_Cup
export const COUNTRIES: CountryToken[] = [
  // CONCACAF (6) — hosts + Curaçao, Haiti, Panama
  c("usa", "United States", "USA", "us"),
  c("canada", "Canada", "CAN", "ca"),
  c("mexico", "Mexico", "MEX", "mx"),
  c("curacao", "Curaçao", "CUW", "cw"),
  c("haiti", "Haiti", "HAI", "ht"),
  c("panama", "Panama", "PAN", "pa"),

  // CONMEBOL (6)
  c("brazil", "Brazil", "BRA", "br"),
  c("argentina", "Argentina", "ARG", "ar"),
  c("uruguay", "Uruguay", "URU", "uy"),
  c("colombia", "Colombia", "COL", "co"),
  c("ecuador", "Ecuador", "ECU", "ec"),
  c("paraguay", "Paraguay", "PAR", "py"),

  // UEFA (16)
  c("france", "France", "FRA", "fr"),
  c("england", "England", "ENG", "gb-eng"),
  c("scotland", "Scotland", "SCO", "gb-sct"),
  c("spain", "Spain", "ESP", "es"),
  c("portugal", "Portugal", "POR", "pt"),
  c("germany", "Germany", "GER", "de"),
  c("netherlands", "Netherlands", "NED", "nl"),
  c("belgium", "Belgium", "BEL", "be"),
  c("croatia", "Croatia", "CRO", "hr"),
  c("switzerland", "Switzerland", "SUI", "ch"),
  c("austria", "Austria", "AUT", "at"),
  c("norway", "Norway", "NOR", "no"),
  c("sweden", "Sweden", "SWE", "se"),
  c("czech", "Czech Republic", "CZE", "cz"),
  c("turkey", "Turkey", "TUR", "tr"),
  c("bosnia", "Bosnia and Herzegovina", "BIH", "ba"),

  // AFC (9)
  c("japan", "Japan", "JPN", "jp"),
  c("korea", "South Korea", "KOR", "kr"),
  c("iran", "Iran", "IRN", "ir"),
  c("australia", "Australia", "AUS", "au"),
  c("saudi", "Saudi Arabia", "KSA", "sa"),
  c("qatar", "Qatar", "QAT", "qa"),
  c("uzbekistan", "Uzbekistan", "UZB", "uz"),
  c("iraq", "Iraq", "IRQ", "iq"),
  c("jordan", "Jordan", "JOR", "jo"),

  // CAF (10)
  c("morocco", "Morocco", "MAR", "ma"),
  c("senegal", "Senegal", "SEN", "sn"),
  c("algeria", "Algeria", "ALG", "dz"),
  c("egypt", "Egypt", "EGY", "eg"),
  c("tunisia", "Tunisia", "TUN", "tn"),
  c("ivorycoast", "Ivory Coast", "CIV", "ci"),
  c("ghana", "Ghana", "GHA", "gh"),
  c("dr-congo", "DR Congo", "COD", "cd"),
  c("cape-verde", "Cape Verde", "CPV", "cv"),
  c("south-africa", "South Africa", "RSA", "za"),

  // OFC (1)
  c("newzealand", "New Zealand", "NZL", "nz"),
];

if (COUNTRIES.length !== 48) {
  throw new Error(
    `Expected 48 countries, got ${COUNTRIES.length}. Update lib/countries.ts.`,
  );
}

export function allMints(): string[] {
  const mints: string[] = [];
  if (HUB.mint) mints.push(HUB.mint);
  for (const country of COUNTRIES) {
    if (country.mint) mints.push(country.mint);
  }
  return mints;
}
