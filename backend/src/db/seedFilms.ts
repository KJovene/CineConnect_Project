import { getFilmDetail } from "../services/films/filmsService.js";

const OMDB_IDS: { id: string; label: string }[] = [
  // --- Action & Superhéros ---
  { id: "tt0468569", label: "The Dark Knight (2008)" },
  { id: "tt1375666", label: "Inception (2010)" },
  { id: "tt0133093", label: "The Matrix (1999)" },
  { id: "tt4154796", label: "Avengers: Endgame (2019)" },
  { id: "tt4154756", label: "Avengers: Infinity War (2018)" },
  { id: "tt0172495", label: "Gladiator (2000)" },
  { id: "tt0103064", label: "Terminator 2 (1991)" },
  { id: "tt1843866", label: "Captain America: The Winter Soldier (2014)" },
  { id: "tt2015381", label: "Guardians of the Galaxy (2014)" },
  { id: "tt3498820", label: "Captain America: Civil War (2016)" },

  // --- Drame ---
  { id: "tt0111161", label: "The Shawshank Redemption (1994)" },
  { id: "tt0068646", label: "The Godfather (1972)" },
  { id: "tt0071562", label: "The Godfather Part II (1974)" },
  { id: "tt0108052", label: "Schindler's List (1993)" },
  { id: "tt0120815", label: "Saving Private Ryan (1998)" },
  { id: "tt0169547", label: "American Beauty (1999)" },
  { id: "tt0120586", label: "American History X (1998)" },
  { id: "tt0073486", label: "One Flew Over the Cuckoo's Nest (1975)" },
  { id: "tt0405159", label: "Million Dollar Baby (2004)" },
  { id: "tt2024544", label: "12 Years a Slave (2013)" },
  { id: "tt0118799", label: "Life is Beautiful (1997)" },
  { id: "tt0317248", label: "City of God (2002)" },
  { id: "tt0253474", label: "The Pianist (2002)" },
  { id: "tt7286456", label: "Joker (2019)" },
  { id: "tt1205489", label: "Gran Torino (2008)" },

  // --- Science-Fiction ---
  { id: "tt0816692", label: "Interstellar (2014)" },
  { id: "tt0082971", label: "Raiders of the Lost Ark (1981)" },
  { id: "tt0076759", label: "Star Wars: A New Hope (1977)" },
  { id: "tt0080684", label: "The Empire Strikes Back (1980)" },
  { id: "tt0086190", label: "Return of the Jedi (1983)" },
  { id: "tt0088763", label: "Back to the Future (1985)" },
  { id: "tt0910970", label: "WALL·E (2008)" },
  { id: "tt0078748", label: "Alien (1979)" },
  { id: "tt0057012", label: "Dr. Strangelove (1964)" },
  { id: "tt0209144", label: "Memento (2000)" },

  // --- Thriller & Suspense ---
  { id: "tt0110912", label: "Pulp Fiction (1994)" },
  { id: "tt0137523", label: "Fight Club (1999)" },
  { id: "tt0102926", label: "The Silence of the Lambs (1991)" },
  { id: "tt0114814", label: "The Usual Suspects (1995)" },
  { id: "tt0482571", label: "The Prestige (2006)" },
  { id: "tt1130884", label: "Shutter Island (2010)" },
  { id: "tt0477348", label: "No Country for Old Men (2007)" },
  { id: "tt0116282", label: "Fargo (1996)" },
  { id: "tt0167404", label: "The Sixth Sense (1999)" },
  { id: "tt0401792", label: "Sin City (2005)" },

  // --- Fantastique & Aventure ---
  {
    id: "tt0167260",
    label: "The Lord of the Rings: The Return of the King (2003)",
  },
  {
    id: "tt0120737",
    label: "The Lord of the Rings: The Fellowship of the Ring (2001)",
  },
  { id: "tt0167261", label: "The Lord of the Rings: The Two Towers (2002)" },
  { id: "tt0266697", label: "Kill Bill: Vol. 1 (2003)" },
  { id: "tt0361748", label: "Inglourious Basterds (2009)" },
  { id: "tt1853728", label: "Django Unchained (2012)" },
  { id: "tt0097576", label: "Indiana Jones and the Last Crusade (1989)" },

  // --- Animation ---
  { id: "tt0245429", label: "Spirited Away (2001)" },
  { id: "tt0347149", label: "Howl's Moving Castle (2004)" },
  { id: "tt0114709", label: "Toy Story (1995)" },
  { id: "tt0435761", label: "Toy Story 3 (2010)" },
  { id: "tt0266543", label: "Finding Nemo (2003)" },
  { id: "tt0317705", label: "The Incredibles (2004)" },
  { id: "tt0892769", label: "How to Train Your Dragon (2010)" },
  { id: "tt4633694", label: "Spider-Man: Into the Spider-Verse (2018)" },

  // --- Comédie ---
  { id: "tt0211915", label: "Amélie (2001)" },
  { id: "tt0338013", label: "Eternal Sunshine of the Spotless Mind (2004)" },
  { id: "tt3783958", label: "La La Land (2016)" },
  { id: "tt8946378", label: "Knives Out (2019)" },
  { id: "tt6710474", label: "Everything Everywhere All at Once (2022)" },
  { id: "tt2084970", label: "The Imitation Game (2014)" },
  { id: "tt0993846", label: "The Wolf of Wall Street (2013)" },

  // --- Horreur ---
  { id: "tt0081505", label: "The Shining (1980)" },
  { id: "tt0073195", label: "Jaws (1975)" },
  { id: "tt0180093", label: "Requiem for a Dream (2000)" },
  { id: "tt0364569", label: "Oldboy (2003)" },

  // --- Crime & Gangsters ---
  { id: "tt0099685", label: "Goodfellas (1990)" },
  { id: "tt0110413", label: "Léon: The Professional (1994)" },
  { id: "tt6751668", label: "Parasite (2019)" },
  { id: "tt0790636", label: "Dallas Buyers Club (2013)" },

  // --- Films classiques ---
  { id: "tt0050083", label: "12 Angry Men (1957)" },
  { id: "tt0078788", label: "Apocalypse Now (1979)" },
  { id: "tt0047478", label: "Seven Samurai (1954)" },
  { id: "tt0060196", label: "The Good, the Bad and the Ugly (1966)" },
  { id: "tt0056172", label: "Lawrence of Arabia (1962)" },
  { id: "tt0045152", label: "Singin' in the Rain (1952)" },

  // --- Drame moderne ---
  { id: "tt2560138", label: "Snowpiercer (2013)" },
  { id: "tt0087843", label: "Once Upon a Time in America (1984)" },
  { id: "tt0087884", label: "Witness (1985)" },
  { id: "tt1663662", label: "Pacific Rim (2013)" },
  { id: "tt0096895", label: "Batman (1989)" },
  { id: "tt0100157", label: "Misery (1990)" },
  { id: "tt0060107", label: "Psycho (1960)" },
  { id: "tt0395169", label: "Hotel Rwanda (2004)" },
  { id: "tt0353969", label: "Millions (2004)" },
  { id: "tt0367594", label: "Charlie and the Chocolate Factory (2005)" },
  { id: "tt0790636", label: "Dallas Buyers Club (2013)" },
];

const DELAY_MS = 250; // Délai entre chaque appel OMDB pour éviter le rate limiting

/**
 * Pause l'exécution pendant `ms` millisecondes
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Déduplique la liste d'IDs OMDB (au cas où)
 */
function deduplicateIds(
  list: { id: string; label: string }[],
): { id: string; label: string }[] {
  const seen = new Set<string>();
  return list.filter(({ id }) => {
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

async function seedFilms(): Promise<void> {
  const uniqueList = deduplicateIds(OMDB_IDS);
  const total = uniqueList.length;

  console.log(`\n🎬 Seed films — ${total} films à traiter\n`);
  console.log("━".repeat(50));

  let inserted = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < uniqueList.length; i++) {
    const { id, label } = uniqueList[i];
    const progress = `[${String(i + 1).padStart(3, " ")}/${total}]`;

    try {
      const film = await getFilmDetail(id);

      if (film) {
        console.log(`✅ ${progress} ${label}`);
        inserted++;
      } else {
        console.log(
          `⚠️  ${progress} ${label} — réponse vide (film introuvable)`,
        );
        skipped++;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`❌ ${progress} ${label} — ${message}`);
      failed++;
    }

    // Respecter le rate limit OMDB (1 000 req/jour sur plan gratuit)
    if (i < uniqueList.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  console.log("\n" + "━".repeat(50));
  console.log(`\n✨ Seed terminé !`);
  console.log(`   ✅ Insérés/mis à jour : ${inserted}`);
  console.log(`   ⚠️  Ignorés           : ${skipped}`);
  console.log(`   ❌ Échoués            : ${failed}`);
  console.log(`   📊 Total traités      : ${total}\n`);

  process.exit(failed > 0 ? 1 : 0);
}

seedFilms().catch((err) => {
  console.error("\n💥 Erreur fatale :", err);
  process.exit(1);
});
