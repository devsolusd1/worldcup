export type CountryToken = {
  id: string;
  name: string;
  code: string;
  flag: string;
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
  name: "World Cup Coin",
  mint: null,
  description:
    "The hub token. A portion of trading fees from every country coin flows back to buy and burn CUP.",
};

const c = (
  id: string,
  name: string,
  code: string,
  flag: string,
): CountryToken => ({
  id,
  name,
  code,
  flag,
  ticker: `${code}CUP`,
  mint: null,
});

// 2026 World Cup — 48 participants.
// Hosts: USA, Canada, Mexico. The remaining 45 slots reflect the most likely
// qualified nations from each confederation as of the build date — adjust this
// list to match the final FIFA draw before launch.
export const COUNTRIES: CountryToken[] = [
  // Hosts (CONCACAF)
  c("usa", "United States", "USA", "🇺🇸"),
  c("canada", "Canada", "CAN", "🇨🇦"),
  c("mexico", "Mexico", "MEX", "🇲🇽"),

  // CONMEBOL (6 direct)
  c("brazil", "Brazil", "BRA", "🇧🇷"),
  c("argentina", "Argentina", "ARG", "🇦🇷"),
  c("uruguay", "Uruguay", "URU", "🇺🇾"),
  c("colombia", "Colombia", "COL", "🇨🇴"),
  c("ecuador", "Ecuador", "ECU", "🇪🇨"),
  c("paraguay", "Paraguay", "PAR", "🇵🇾"),

  // UEFA (16)
  c("france", "France", "FRA", "🇫🇷"),
  c("england", "England", "ENG", "🏴󠁧󠁢󠁥󠁮󠁧󠁿"),
  c("spain", "Spain", "ESP", "🇪🇸"),
  c("portugal", "Portugal", "POR", "🇵🇹"),
  c("germany", "Germany", "GER", "🇩🇪"),
  c("italy", "Italy", "ITA", "🇮🇹"),
  c("netherlands", "Netherlands", "NED", "🇳🇱"),
  c("belgium", "Belgium", "BEL", "🇧🇪"),
  c("croatia", "Croatia", "CRO", "🇭🇷"),
  c("switzerland", "Switzerland", "SUI", "🇨🇭"),
  c("denmark", "Denmark", "DEN", "🇩🇰"),
  c("austria", "Austria", "AUT", "🇦🇹"),
  c("poland", "Poland", "POL", "🇵🇱"),
  c("serbia", "Serbia", "SRB", "🇷🇸"),
  c("hungary", "Hungary", "HUN", "🇭🇺"),
  c("norway", "Norway", "NOR", "🇳🇴"),

  // AFC (8 direct)
  c("japan", "Japan", "JPN", "🇯🇵"),
  c("korea", "South Korea", "KOR", "🇰🇷"),
  c("iran", "Iran", "IRN", "🇮🇷"),
  c("australia", "Australia", "AUS", "🇦🇺"),
  c("saudi", "Saudi Arabia", "KSA", "🇸🇦"),
  c("qatar", "Qatar", "QAT", "🇶🇦"),
  c("uzbekistan", "Uzbekistan", "UZB", "🇺🇿"),
  c("iraq", "Iraq", "IRQ", "🇮🇶"),

  // CAF (9)
  c("morocco", "Morocco", "MAR", "🇲🇦"),
  c("senegal", "Senegal", "SEN", "🇸🇳"),
  c("algeria", "Algeria", "ALG", "🇩🇿"),
  c("egypt", "Egypt", "EGY", "🇪🇬"),
  c("tunisia", "Tunisia", "TUN", "🇹🇳"),
  c("cameroon", "Cameroon", "CMR", "🇨🇲"),
  c("nigeria", "Nigeria", "NGA", "🇳🇬"),
  c("ivorycoast", "Ivory Coast", "CIV", "🇨🇮"),
  c("ghana", "Ghana", "GHA", "🇬🇭"),

  // CONCACAF (3 more)
  c("panama", "Panama", "PAN", "🇵🇦"),
  c("costarica", "Costa Rica", "CRC", "🇨🇷"),
  c("jamaica", "Jamaica", "JAM", "🇯🇲"),

  // OFC (1 direct)
  c("newzealand", "New Zealand", "NZL", "🇳🇿"),

  // Intercontinental playoff winners (2) — placeholders
  c("bolivia", "Bolivia", "BOL", "🇧🇴"),
  c("dr-congo", "DR Congo", "COD", "🇨🇩"),
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
