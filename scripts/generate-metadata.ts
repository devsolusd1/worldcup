import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "metadata");
const WEBSITE = "https://www.worldcupraydium.fun/";
const DESCRIPTION = "";

type Entry = { name: string; symbol: string; imageCid: string };

// Image CIDs from Pinata. Names match what the user provided when uploading
// the 1024x1024 PNG metadata images.
const ENTRIES: Entry[] = [
  { name: "Algeria", symbol: "ALG", imageCid: "bafkreihyirapba6ae4q52wlbifk3qjieysnodf4w5j4ff6hvmghstfj7bu" },
  { name: "Argentina", symbol: "ARG", imageCid: "bafkreiaoz7kfv6pn26hmzsvgurx2wq2tdjc3af3nfw6rojhzr4xn4tipha" },
  { name: "Australia", symbol: "AUS", imageCid: "bafkreibwk4y573hspygqw2eiqo4b66ryyzpisq2c3zj4e6kjdhtobxceyy" },
  { name: "Austria", symbol: "AUT", imageCid: "bafkreib65dcdb554dhoehetostnftjl64ptpoov22gvhcgxntyokwyvpgu" },
  { name: "Belgium", symbol: "BEL", imageCid: "bafkreif7hfeur7zolmzbu6o4fbv5ue25uvhjh2avxhcbqqynuuuz65jbca" },
  { name: "Bosnia and Herzegovina", symbol: "BIH", imageCid: "bafkreihvmhx6pwowsdci2npg72mp36eqx7f7hkcm42xgkgl2r6xrabsoxu" },
  { name: "Brazil", symbol: "BRA", imageCid: "bafkreibhlyatuq3xd5b3pnhsyv5inh2mmlblmcw7v6ezjhhw4rfnrr6lwq" },
  { name: "Canada", symbol: "CAN", imageCid: "bafkreiakeeehlhiszdfrpfzchtcgalou67kpsyiz6nkkn2whzple5yrxre" },
  { name: "Ivory Coast", symbol: "CIV", imageCid: "bafkreieosoaquk2o5krdviy6b5xlhfwcjsuhen7q5nxpiyo54g6vzdo5aa" },
  { name: "Democratic Republic of the Congo", symbol: "COD", imageCid: "bafkreib3nfeefpvkmex3n2onanvrqrkoa2iv5uluykbqob3rzhextjsmly" },
  { name: "Colombia", symbol: "COL", imageCid: "bafkreigzuj3ehosfxy7ysywjycau3nnhixv66qi5ikq7jbv6qu7cqhb4dq" },
  { name: "Cape Verde", symbol: "CPV", imageCid: "bafkreicc623qn4tdzw5crlu5wrfv4c2lecydqn7udkos4gkxhxvw6nogoq" },
  { name: "Croatia", symbol: "CRO", imageCid: "bafkreigy2v2u4hrjnpvgpz5tldqyaxkmuahavkqkqheadnkj2dw54xilhm" },
  { name: "Curacao", symbol: "CUW", imageCid: "bafkreico53hzoouabitqssdwzqqkplpel4qdeowmbzul57rrz5ofpuq5c4" },
  { name: "Czech Republic", symbol: "CZE", imageCid: "bafkreibylp3wuqxn3ug7isqlt6vfpajwx6ff2tznbk6qwqz4uhz3btokyq" },
  { name: "Ecuador", symbol: "ECU", imageCid: "bafkreigy7s3geypajrr37v72j44pzvmxm7lt2xv5246oyicdpbsk5ekqfe" },
  { name: "Egypt", symbol: "EGY", imageCid: "bafkreiaqlebqcxps636yb3glcx7spdiwilgkqchdnxebf7g63mgpo4ea5y" },
  { name: "England", symbol: "ENG", imageCid: "bafkreih4oi4runei26idibbbgdhzav3pniocgt3s74rm5likiw44io2ure" },
  { name: "Spain", symbol: "ESP", imageCid: "bafkreietykyoujn34fd5lmdhwd3ytqnyvbp2ln6tfylthtnoxxjbtcugti" },
  { name: "France", symbol: "FRA", imageCid: "bafkreie3sysg2xieszhtrmd7k65gwgu37iwksbeivjczzozbbcoddtfrr4" },
  { name: "Germany", symbol: "GER", imageCid: "bafkreiew6w5ylvknydr6ajbpvoplabqd5m72xhywh3fqwuuur4zge2utrm" },
  { name: "Ghana", symbol: "GHA", imageCid: "bafkreigeg6rnsqnutxo7fv4wqfrepbvrai235gslnzarxaawwrevgypfxi" },
  { name: "Haiti", symbol: "HAI", imageCid: "bafkreiavmgzrfl3jan267iil5ltrzogkgiqk7m5363e6f7skdzgjnk5bgq" },
  { name: "Iran", symbol: "IRN", imageCid: "bafkreiay3hscddy4al6qxoi47zrqwvryyx26iwmbnw4cbgu7nvcphsu3r4" },
  { name: "Iraq", symbol: "IRQ", imageCid: "bafkreid7soxnybggtl3kancmwpzu3kpdunlw6ppognueizwuhw2rk67whu" },
  { name: "Jordan", symbol: "JOR", imageCid: "bafkreiectpcocckzcgfybjrrfr623p2oe5i6euenmrojbynlg7qpqbpcq4" },
  { name: "Japan", symbol: "JPN", imageCid: "bafkreielwldonawougyqhfb6xzz7ikkl2edk7pl3yywsqkaqghodieifwq" },
  { name: "South Korea", symbol: "KOR", imageCid: "bafkreiboczidn6tp4pzpuv4rwsafth3u74wc7qb5krqsy4yspmpe4rosr4" },
  { name: "Saudi Arabia", symbol: "KSA", imageCid: "bafkreie4qt2rig25rgdkghwkyj6f4o6ujji4cxo6p6ycvbneasyzejzcgi" },
  { name: "Morocco", symbol: "MAR", imageCid: "bafkreibommsjcpj45nydkwczgxbrzdkxk6iuiuag4andgxz5lqatwyq7ye" },
  { name: "Mexico", symbol: "MEX", imageCid: "bafkreibwjxi3swjkc6abxjn32ejwc2hzxdn2mcdsmp7kdwqrktctzt6bd4" },
  { name: "Netherlands", symbol: "NED", imageCid: "bafkreia6q4eauxjuhgjivbkn6lmg7qav6pcixk62r3af6xs6pdwmzfybdm" },
  { name: "Norway", symbol: "NOR", imageCid: "bafkreiesyu227sreg4lki5wpqyysnptnlajfklt4ivfkbnck5wkxypevoy" },
  { name: "New Zealand", symbol: "NZL", imageCid: "bafkreihin4xwrcqdya6xyi7jy24talczpcytbexmzrzm465ncv7p5ykyum" },
  { name: "Panama", symbol: "PAN", imageCid: "bafkreib6kzps5dy7ovoq3bhliylrd7rwmxnxcfmc3mcvd66h4u6xpmjqy4" },
  { name: "Paraguay", symbol: "PAR", imageCid: "bafkreiaqsr6r5j3giflzq5oytcoasuxdkr5fmck62f3cpchxaq7y5muwfe" },
  { name: "Portugal", symbol: "POR", imageCid: "bafkreidvaakrupcxvhioz3vbo6hhltcbrps6ziwcud5sd2c2wdg7coycru" },
  { name: "Qatar", symbol: "QAT", imageCid: "bafkreihjbnvnpvswgdc3kuej7n27ovtn2pt3tunrrhnztaymju2wgfzxda" },
  { name: "South Africa", symbol: "RSA", imageCid: "bafkreiacqosova5ob4amxqm3iljd7b2xylovdd5szceqeud7lscg3f4kfu" },
  { name: "Scotland", symbol: "SCO", imageCid: "bafkreif3envjk3lpj4qwsveb2dmzl4a2dkx43gadxufhsjuw7x3uhjlcvm" },
  { name: "Senegal", symbol: "SEN", imageCid: "bafkreig5bgqjysves7cyazw3fgizs2p6xclibt4s3sfmudamrzvypdm3vu" },
  { name: "Switzerland", symbol: "SUI", imageCid: "bafkreidefi22tq233s55k23neiabo6g4lyskqdt5edmmrxzvv5wtmgfuqa" },
  { name: "Sweden", symbol: "SWE", imageCid: "bafkreifxwz54qxbseou5h5yl22m3itwnkng7dsmmn5ydakf2tpxypb56ee" },
  { name: "Tunisia", symbol: "TUN", imageCid: "bafkreigmeq5hhcacseov5tiivnnhg7p7mqjj2owcnp3lmd73nl3rwpz7ve" },
  { name: "Turkey", symbol: "TUR", imageCid: "bafkreih2lljwc2h2vgzasfsjawtni6z46x4srapd2v2a7hn4nemt3nz6ty" },
  { name: "Uruguay", symbol: "URU", imageCid: "bafkreifmgewtddduodk7bhllqhecanqa5xjeevkwebtaobrp5qq3hk6nfy" },
  { name: "United States", symbol: "USA", imageCid: "bafkreicirmjxmkd2jmmkvjw3x7ubt34ds7zrbnefk5aofose5vgpe5aybq" },
  { name: "Uzbekistan", symbol: "UZB", imageCid: "bafkreigaguu3d7c5o5wd62dlx7tufhohusvhvgc3qipbz5zbidqz3vvxhe" },
];

async function main() {
  if (ENTRIES.length !== 48) {
    throw new Error(`Expected 48 entries, got ${ENTRIES.length}`);
  }

  await mkdir(OUT_DIR, { recursive: true });

  for (const entry of ENTRIES) {
    const metadata = {
      name: entry.name,
      symbol: entry.symbol,
      description: DESCRIPTION,
      website: WEBSITE,
      image: `https://ipfs.io/ipfs/${entry.imageCid}`,
    };
    const outPath = path.join(OUT_DIR, `${entry.symbol}.json`);
    await writeFile(outPath, JSON.stringify(metadata, null, 2) + "\n", "utf-8");
  }

  console.log(`✓ Wrote ${ENTRIES.length} JSON files to ${OUT_DIR}`);
  console.log(ENTRIES.map((e) => e.symbol).join("  "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
