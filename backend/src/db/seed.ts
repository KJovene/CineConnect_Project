import { db } from "./index.js";
import { user } from "./schema.js";
import { eq } from "drizzle-orm";

/**
 * Script de fixtures pour initialiser la base de données avec des utilisateurs de test.
 * Crée les utilisateurs via l'API Better Auth pour assurer la compatibilité.
 * Mot de passe générique pour tous les utilisateurs : "Password123!"
 */

const GENERIC_PASSWORD = "Password123!";
const API_BASE_URL = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

/**
 * Utilisateurs de test avec nom, email et pseudo convaincants
 */
const testUsers = [
  {
    name: "Sophie Dubois",
    email: "sophie.dubois@cineconnect.fr",
    image: "https://i.pravatar.cc/150?img=1",
  },
  {
    name: "Thomas Martin",
    email: "thomas.martin@cineconnect.fr",
    image: "https://i.pravatar.cc/150?img=3",
  },
  {
    name: "Emma Laurent",
    email: "emma.laurent@cineconnect.fr",
    image: "https://i.pravatar.cc/150?img=5",
  },
  {
    name: "Lucas Bernard",
    email: "lucas.bernard@cineconnect.fr",
    image: "https://i.pravatar.cc/150?img=7",
  },
  {
    name: "Chloé Petit",
    email: "chloe.petit@cineconnect.fr",
    image: "https://i.pravatar.cc/150?img=9",
  },
  {
    name: "Alexandre Rousseau",
    email: "alexandre.rousseau@cineconnect.fr",
    image: "https://i.pravatar.cc/150?img=11",
  },
  {
    name: "Léa Moreau",
    email: "lea.moreau@cineconnect.fr",
    image: "https://i.pravatar.cc/150?img=10",
  },
  {
    name: "Hugo Simon",
    email: "hugo.simon@cineconnect.fr",
    image: "https://i.pravatar.cc/150?img=12",
  },
];

/**
 * Crée un utilisateur via l'API Better Auth ET l'ajoute à la DB
 */
async function createUserViaAPI(
  testUser: (typeof testUsers)[0],
): Promise<boolean> {
  try {
    // D'abord, vérifier si l'utilisateur existe déjà en DB
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.email, testUser.email))
      .limit(1);

    if (existingUser.length > 0) {
      return false; // Utilisateur existe déjà
    }

    // Créer via Better Auth API
    const response = await fetch(`${API_BASE_URL}/api/auth/sign-up/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: API_BASE_URL,
      },
      body: JSON.stringify({
        email: testUser.email,
        password: GENERIC_PASSWORD,
        name: testUser.name,
        image: testUser.image,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      // Ignorer les erreurs "user already exists"
      if (response.status === 400 && error.includes("already exists")) {
        // L'utilisateur existe dans Better Auth, le chercher et l'ajouter à notre DB
        console.log(`  └─ En train d'ajouter ${testUser.email} à la DB...`);
        await db.insert(user).values({
          name: testUser.name,
          email: testUser.email,
          image: testUser.image,
          emailVerified: true,
        });
        return true;
      }
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    // Succès: aussi ajouter à notre DB PostgreSQL
    console.log(`  └─ En train d'ajouter ${testUser.email} à la DB...`);
    await db.insert(user).values({
      name: testUser.name,
      email: testUser.email,
      image: testUser.image,
      emailVerified: true,
    });

    return true; // Créé avec succès
  } catch (error: any) {
    throw error;
  }
}

/**
 * Fonction principale de seed
 */
async function seed() {
  try {
    console.log("🌱 Démarrage du seed de la base de données...\n");

    // Vérification si des utilisateurs existent déjà
    const existingUsers = await db.select().from(user);
    if (existingUsers.length > 0) {
      console.log(
        `⚠️  ${existingUsers.length} utilisateur(s) déjà présent(s) dans la base.`,
      );
      console.log("💡 Si vous voulez réinitialiser, utilisez: make db-reset\n");

      // Demander confirmation
      console.log(
        "Voulez-vous ajouter les fixtures quand même ? (Les doublons d'email seront ignorés)",
      );
      console.log(
        "Appuyez sur Ctrl+C pour annuler, ou attendez 3 secondes pour continuer...\n",
      );
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    // Création des utilisateurs via l'API Better Auth
    console.log("👥 Création des utilisateurs de test...\n");
    let successCount = 0;
    let skipCount = 0;

    for (const testUser of testUsers) {
      try {
        const created = await createUserViaAPI(testUser);
        if (created) {
          console.log(`✓ Créé: ${testUser.name} (${testUser.email})`);
          successCount++;
        } else {
          console.log(`⏭️  Ignoré: ${testUser.email} (existe déjà)`);
          skipCount++;
        }
      } catch (error: any) {
        console.error(`❌ Erreur pour ${testUser.email}:`, error.message);
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ Seed terminé avec succès!");
    console.log("=".repeat(60));
    console.log(`📊 Résumé:`);
    console.log(`   • Utilisateurs créés: ${successCount}`);
    console.log(`   • Utilisateurs ignorés (déjà présents): ${skipCount}`);
    console.log(`   • Total: ${testUsers.length}`);
    console.log(`\n🔑 Mot de passe pour tous les comptes: ${GENERIC_PASSWORD}`);
    console.log("\n📝 Exemples de connexion:");
    console.log(`   Email: ${testUsers[0].email}`);
    console.log(`   Password: ${GENERIC_PASSWORD}`);
    console.log("=".repeat(60) + "\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Erreur lors du seed:", error);
    process.exit(1);
  }
}

// Exécution du seed
seed();
