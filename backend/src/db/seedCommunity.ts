import { and, asc, eq, isNull, or, sql } from "drizzle-orm";
import { db } from "./index.js";
import { films, friends, messages, reviews, user } from "./schema.js";

const FRIENDS_PER_USER = 2;
const MESSAGES_PER_FRIENDSHIP = 10;
const COMMENTED_FILMS_COUNT = 10;

const MESSAGE_TEMPLATES = [
  "Salut ! Tu as vu ce film ?",
  "Oui, je l'ai regardé hier soir.",
  "La mise en scène est vraiment solide.",
  "Je suis d'accord, et la BO est incroyable.",
  "Tu l'as mis dans ta watchlist ?",
  "Oui, je pense même le revoir ce week-end.",
  "On pourrait faire une reco commune sur CineConnect.",
  "Bonne idée, je prépare un commentaire.",
  "Parfait, je t'envoie mon avis détaillé.",
  "Top, on en reparle ce soir !",
] as const;

const COMMENT_TEMPLATES = [
  "Très bon rythme, je ne me suis pas ennuyé une seconde.",
  "Le casting fonctionne parfaitement et les dialogues sont justes.",
  "Belle surprise, la réalisation est vraiment soignée.",
  "Film solide avec une très bonne ambiance générale.",
  "Histoire prenante, surtout dans la deuxième partie.",
] as const;

type UserRow = {
  id: number;
  name: string | null;
};

type FilmRow = {
  film_id: number;
  title: string;
};

function buildFriendPairs(userIds: number[]): Array<[number, number]> {
  if (userIds.length < 3) return [];

  const uniquePairs = new Set<string>();
  const pairs: Array<[number, number]> = [];

  for (let i = 0; i < userIds.length; i++) {
    for (let step = 1; step <= FRIENDS_PER_USER / 2; step++) {
      const a = userIds[i];
      const b = userIds[(i + step) % userIds.length];
      const left = Math.min(a, b);
      const right = Math.max(a, b);
      const key = `${left}-${right}`;

      if (!uniquePairs.has(key)) {
        uniquePairs.add(key);
        pairs.push([left, right]);
      }
    }
  }

  return pairs;
}

async function seedFriendships(userIds: number[]) {
  const pairs = buildFriendPairs(userIds);
  let created = 0;
  let updated = 0;

  for (const [left, right] of pairs) {
    const existing = await db
      .select({
        friend_id: friends.friend_id,
        status: friends.status,
      })
      .from(friends)
      .where(
        or(
          and(eq(friends.user_id, left), eq(friends.friend_user_id, right)),
          and(eq(friends.user_id, right), eq(friends.friend_user_id, left)),
        ),
      )
      .limit(1);

    if (existing.length === 0) {
      await db.insert(friends).values({
        user_id: left,
        friend_user_id: right,
        status: "accepted",
      });
      created++;
      continue;
    }

    if (existing[0].status !== "accepted") {
      await db
        .update(friends)
        .set({ status: "accepted" })
        .where(
          or(
            and(eq(friends.user_id, left), eq(friends.friend_user_id, right)),
            and(eq(friends.user_id, right), eq(friends.friend_user_id, left)),
          ),
        );
      updated++;
    }
  }

  return { pairs, created, updated };
}

async function seedMessages(friendPairs: Array<[number, number]>) {
  let inserted = 0;

  for (const [left, right] of friendPairs) {
    const [countRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(messages)
      .where(
        or(
          and(eq(messages.sender_id, left), eq(messages.receiver_id, right)),
          and(eq(messages.sender_id, right), eq(messages.receiver_id, left)),
        ),
      );

    const existingCount = Number(countRow?.count ?? 0);
    if (existingCount >= MESSAGES_PER_FRIENDSHIP) {
      continue;
    }

    const toInsert: Array<{
      sender_id: number;
      receiver_id: number;
      content: string;
      sent_at: Date;
    }> = [];

    const baseDate = Date.now();
    for (let i = existingCount; i < MESSAGES_PER_FRIENDSHIP; i++) {
      const senderId = i % 2 === 0 ? left : right;
      const receiverId = senderId === left ? right : left;

      toInsert.push({
        sender_id: senderId,
        receiver_id: receiverId,
        content: MESSAGE_TEMPLATES[i % MESSAGE_TEMPLATES.length],
        sent_at: new Date(baseDate - (MESSAGES_PER_FRIENDSHIP - i) * 60_000),
      });
    }

    if (toInsert.length > 0) {
      await db.insert(messages).values(toInsert);
      inserted += toInsert.length;
    }
  }

  return { inserted };
}

async function upsertParentReview(params: {
  userId: number;
  filmId: number;
  comment: string;
  rating: number;
}) {
  const [existing] = await db
    .select({ review_id: reviews.review_id })
    .from(reviews)
    .where(
      and(
        eq(reviews.user_id, params.userId),
        eq(reviews.film_id, params.filmId),
        isNull(reviews.parent_review_id),
      ),
    )
    .limit(1);

  if (existing) {
    await db
      .update(reviews)
      .set({
        comment: params.comment,
        rating: params.rating,
        updated_at: new Date(),
      })
      .where(eq(reviews.review_id, existing.review_id));

    return { created: 0, updated: 1 };
  }

  await db.insert(reviews).values({
    user_id: params.userId,
    film_id: params.filmId,
    parent_review_id: null,
    comment: params.comment,
    rating: params.rating,
  });

  return { created: 1, updated: 0 };
}

async function seedFilmReviews(users: UserRow[], selectedFilms: FilmRow[]) {
  let created = 0;
  let updated = 0;

  for (let i = 0; i < selectedFilms.length; i++) {
    const film = selectedFilms[i];
    const firstUser = users[i % users.length];
    const secondUser = users[(i + 3) % users.length];

    const reviewers = [firstUser, secondUser].filter(
      (reviewer, index, list) =>
        list.findIndex((candidate) => candidate.id === reviewer.id) === index,
    );

    for (let j = 0; j < reviewers.length; j++) {
      const reviewer = reviewers[j];
      const rating = ((i + j) % 5) + 1;
      const tone = COMMENT_TEMPLATES[(i + j) % COMMENT_TEMPLATES.length];
      const name = reviewer.name ?? `Utilisateur ${reviewer.id}`;
      const comment = `${tone} (${name} sur ${film.title})`;

      const result = await upsertParentReview({
        userId: reviewer.id,
        filmId: film.film_id,
        comment,
        rating,
      });

      created += result.created;
      updated += result.updated;
    }
  }

  return { created, updated };
}

async function seedCommunity() {
  try {
    console.log("💬 Seed communauté — démarrage...\n");

    const users = await db
      .select({ id: user.id, name: user.name })
      .from(user)
      .orderBy(asc(user.id));

    if (users.length < 3) {
      throw new Error(
        "Au moins 3 utilisateurs sont nécessaires. Lance d'abord le seed utilisateurs.",
      );
    }

    const selectedFilms = await db
      .select({ film_id: films.film_id, title: films.title })
      .from(films)
      .orderBy(asc(films.film_id))
      .limit(COMMENTED_FILMS_COUNT);

    if (selectedFilms.length < COMMENTED_FILMS_COUNT) {
      throw new Error(
        `Au moins ${COMMENTED_FILMS_COUNT} films sont nécessaires. Lance d'abord le seed films.`,
      );
    }

    const { pairs, created, updated } = await seedFriendships(
      users.map((currentUser) => currentUser.id),
    );
    const messageStats = await seedMessages(pairs);
    const reviewStats = await seedFilmReviews(users, selectedFilms);

    console.log("━".repeat(60));
    console.log("✅ Seed communauté terminé");
    console.log(`   • Relations d'amitié créées: ${created}`);
    console.log(`   • Relations d'amitié mises à jour: ${updated}`);
    console.log(`   • Conversations ciblées: ${pairs.length}`);
    console.log(
      `   • Messages ajoutés: ${messageStats.inserted} (${MESSAGES_PER_FRIENDSHIP} max par binôme)`,
    );
    console.log(
      `   • Reviews créées: ${reviewStats.created} (commentaires + notes)`,
    );
    console.log(
      `   • Reviews mises à jour: ${reviewStats.updated} (commentaires + notes)`,
    );
    console.log(`   • Films commentés/notés: ${COMMENTED_FILMS_COUNT}`);
    console.log("━".repeat(60));

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Erreur durant le seed communauté:", error);
    process.exit(1);
  }
}

seedCommunity();
