import { db } from "./index.js";
import { films, categories, filmsCategories } from "./schema.js";
import { eq } from "drizzle-orm";

/**
 * Script de seed pour peupler les tables `categories` et `films_categories`
 * à partir des genres OMDB déjà présents dans la table `films`.
 *
 * Usage: pnpm db:seed-categories
 */

/**
 * Parse la string de genres OMDB (ex: "Action, Crime, Drama")
 * et retourne un tableau de genres normalisés.
 */
function parseGenres(genreString: string | null): string[] {
  if (!genreString) return [];
  return genreString
    .split(",")
    .map((g) => g.trim())
    .filter((g) => g.length > 0);
}

async function seedCategories(): Promise<void> {
  console.log("\n Seed categories — démarrage\n");
  console.log("━".repeat(50));

  // Récupérer tous les films avec leur champ genre
  const allFilms = await db
    .select({ film_id: films.film_id, genre: films.genre, title: films.title })
    .from(films);

  console.log(` ${allFilms.length} films trouvés en base\n`);

  // Extraire tous les genres uniques
  const genreSet = new Set<string>();
  for (const film of allFilms) {
    const genres = parseGenres(film.genre);
    for (const genre of genres) {
      genreSet.add(genre);
    }
  }

  const uniqueGenres = Array.from(genreSet).sort();
  console.log(`${uniqueGenres.length} genres uniques détectés :`);
  console.log(`${uniqueGenres.join(", ")}\n`);

  // Insérer les catégories manquantes
  console.log("Insertion des catégories...");
  let categoriesInserted = 0;
  let categoriesSkipped = 0;

  for (const genre of uniqueGenres) {
    const existing = await db
      .select()
      .from(categories)
      .where(eq(categories.name, genre))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(categories).values({ name: genre });
      console.log(`Catégorie créée : "${genre}"`);
      categoriesInserted++;
    } else {
      console.log(`Catégorie existante : "${genre}"`);
      categoriesSkipped++;
    }
  }

  // Récupérer le mapping complet nom → category_id
  const allCategories = await db
    .select({ category_id: categories.category_id, name: categories.name })
    .from(categories);

  const categoryMap = new Map<string, number>();
  for (const cat of allCategories) {
    categoryMap.set(cat.name, cat.category_id);
  }

  // Peupler la table de liaison films_categories
  console.log("\n Liaison films ↔ catégories...");
  let linksInserted = 0;
  let linksSkipped = 0;
  let linksErrored = 0;

  for (const film of allFilms) {
    const genres = parseGenres(film.genre);

    for (const genre of genres) {
      const categoryId = categoryMap.get(genre);
      if (!categoryId) {
        console.warn(`Catégorie introuvable pour le genre "${genre}" (film: ${film.title})`);
        continue;
      }

      try {
        // Vérifier si le lien existe déjà
        const existingLink = await db
          .select()
          .from(filmsCategories)
          .where(eq(filmsCategories.film_id, film.film_id))
          .limit(50);

        const alreadyLinked = existingLink.some(
          (link) => link.category_id === categoryId,
        );

        if (!alreadyLinked) {
          await db
            .insert(filmsCategories)
            .values({ film_id: film.film_id, category_id: categoryId });
          linksInserted++;
        } else {
          linksSkipped++;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(
          ` Erreur liaison film "${film.title}" → "${genre}" : ${message}`,
        );
        linksErrored++;
      }
    }
  }

  // Résumé
  console.log("\n" + "━".repeat(50));
  console.log("\n Seed categories terminé !\n");
  console.log(" Résumé :");
  console.log(`   Catégories créées    : ${categoriesInserted}`);
  console.log(`   Catégories ignorées  : ${categoriesSkipped}`);
  console.log(`   Liens créés          : ${linksInserted}`);
  console.log(`   Liens ignorés        : ${linksSkipped}`);
  if (linksErrored > 0) {
    console.log(`    Liens en erreur  : ${linksErrored}`);
  }
  console.log();

  process.exit(linksErrored > 0 ? 1 : 0);
}

seedCategories().catch((err) => {
  console.error("\n Erreur fatale :", err);
  process.exit(1);
});
