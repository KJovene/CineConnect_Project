import type { Express } from "express";
import swaggerJSDoc, { type Options } from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const swaggerOptions: Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "CineConnect API",
      version: "1.0.0",
      description:
        "Documentation de l'API CineConnect (routes films, categories, reviews, amis, messages, utilisateurs).",
    },
    servers: [
      {
        url: process.env.API_BASE_URL ?? "http://localhost:3000",
        description: "Serveur local",
      },
    ],
    tags: [
      { name: "Health", description: "Etat de l'API" },
      { name: "Auth", description: "Authentification Better Auth" },
      { name: "Films", description: "Recherche et details de films" },
      {
        name: "Reviews",
        description: "Notes, commentaires et reponses sur les films",
      },
      { name: "Categories", description: "Categories de films" },
      { name: "Friends", description: "Relations et demandes d'amis" },
      { name: "Messages", description: "Messagerie entre utilisateurs" },
      { name: "Users", description: "Donnees utilisateur connecte" },
    ],
    components: {
      securitySchemes: {
        SessionCookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "better-auth.session_token",
          description:
            "Cookie de session Better Auth. Les routes protegees exigent une session valide.",
        },
      },
      schemas: {
        ErrorResponse: {
          type: "object",
          properties: {
            error: { type: "string" },
            message: { type: "string" },
            detail: { type: "string" },
          },
          required: ["error"],
        },
        HealthResponse: {
          type: "object",
          properties: {
            message: { type: "string", example: "CineConnect API is running!" },
          },
          required: ["message"],
        },
        AuthUser: {
          type: "object",
          properties: {
            id: { type: "string", example: "1" },
            name: { type: "string", example: "Kevin Jovene" },
            email: {
              type: "string",
              format: "email",
              example: "kevin@cineconnect.app",
            },
            image: {
              type: "string",
              nullable: true,
              example: "https://cdn.cineconnect.app/avatar.jpg",
            },
            emailVerified: { type: "boolean", example: false },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2026-03-26T14:10:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2026-03-26T14:10:00.000Z",
            },
          },
          required: ["id", "name", "email"],
        },
        AuthSession: {
          type: "object",
          properties: {
            id: { type: "string", example: "sess_01JQ5P2FXA8Q5" },
            token: { type: "string", example: "sess_token_redacted" },
            userId: { type: "string", example: "1" },
            expiresAt: {
              type: "string",
              format: "date-time",
              example: "2026-04-26T14:10:00.000Z",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2026-03-26T14:10:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2026-03-26T14:10:00.000Z",
            },
          },
          required: ["id", "userId", "expiresAt"],
        },
        AuthSessionResponse: {
          type: "object",
          properties: {
            user: { $ref: "#/components/schemas/AuthUser" },
            session: { $ref: "#/components/schemas/AuthSession" },
          },
          required: ["user", "session"],
        },
        AuthSignInEmailBody: {
          type: "object",
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "kevin@cineconnect.app",
            },
            password: {
              type: "string",
              format: "password",
              example: "MyStrongPassword123!",
            },
            callbackURL: { type: "string", example: "/" },
          },
          required: ["email", "password"],
        },
        AuthSignUpEmailBody: {
          type: "object",
          properties: {
            name: { type: "string", example: "Kevin" },
            email: {
              type: "string",
              format: "email",
              example: "kevin@cineconnect.app",
            },
            password: {
              type: "string",
              format: "password",
              example: "MyStrongPassword123!",
            },
            callbackURL: { type: "string", example: "/" },
          },
          required: ["name", "email", "password"],
        },
        AuthUpdateUserBody: {
          type: "object",
          properties: {
            name: { type: "string", example: "Kevin J." },
            image: {
              type: "string",
              nullable: true,
              example: "data:image/png;base64,iVBORw0KGgo...",
            },
          },
        },
        AuthChangePasswordBody: {
          type: "object",
          properties: {
            currentPassword: {
              type: "string",
              format: "password",
              example: "OldPassword123!",
            },
            newPassword: {
              type: "string",
              format: "password",
              example: "NewPassword456!",
            },
          },
          required: ["currentPassword", "newPassword"],
        },
        AuthDeleteUserBody: {
          type: "object",
          properties: {
            callbackURL: { type: "string", example: "/" },
            password: {
              type: "string",
              format: "password",
              example: "NewPassword456!",
            },
            token: { type: "string", example: "optional-token" },
          },
        },
        FriendActionBody: {
          type: "object",
          properties: {
            friendUserId: { type: "integer", example: 2 },
          },
          required: ["friendUserId"],
        },
        SendMessageBody: {
          type: "object",
          properties: {
            receiverId: { type: "integer", example: 2 },
            content: { type: "string", example: "Salut, quoi de neuf ?" },
          },
          required: ["receiverId", "content"],
        },
        RatingBody: {
          type: "object",
          properties: {
            rating: {
              type: "number",
              format: "float",
              minimum: 0,
              maximum: 5,
              example: 4.5,
            },
          },
          required: ["rating"],
        },
        CommentBody: {
          type: "object",
          properties: {
            comment: { type: "string", example: "Excellent film" },
            rating: {
              type: "number",
              format: "float",
              minimum: 0,
              maximum: 5,
              example: 4,
            },
          },
          required: ["comment"],
        },
        ReplyBody: {
          type: "object",
          properties: {
            comment: { type: "string", example: "Je suis d'accord" },
          },
          required: ["comment"],
        },
      },
    },
    paths: {
      "/": {
        get: {
          tags: ["Health"],
          summary: "Etat de sante de l'API",
          responses: {
            "200": {
              description: "API operationnelle",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/HealthResponse" },
                  example: { message: "CineConnect API is running!" },
                },
              },
            },
          },
        },
      },
      "/api/auth/sign-up/email": {
        post: {
          tags: ["Auth"],
          summary: "Inscription email/mot de passe",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthSignUpEmailBody" },
              },
            },
          },
          responses: {
            "200": {
              description: "Compte cree et session ouverte",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AuthSessionResponse" },
                },
              },
            },
            "400": {
              description: "Parametres invalides",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: {
                    error: "Bad Request",
                    message: "Invalid email or password",
                  },
                },
              },
            },
          },
        },
      },
      "/api/auth/sign-in/email": {
        post: {
          tags: ["Auth"],
          summary: "Connexion email/mot de passe",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthSignInEmailBody" },
              },
            },
          },
          responses: {
            "200": {
              description: "Session ouverte",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AuthSessionResponse" },
                  example: {
                    user: {
                      id: "1",
                      name: "Kevin Jovene",
                      email: "kevin@cineconnect.app",
                      image: null,
                      emailVerified: false,
                    },
                    session: {
                      id: "sess_01JQ5P2FXA8Q5",
                      userId: "1",
                      expiresAt: "2026-04-26T14:10:00.000Z",
                    },
                  },
                },
              },
            },
            "401": {
              description: "Identifiants invalides",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: {
                    error: "Unauthorized",
                    message: "Invalid credentials",
                  },
                },
              },
            },
          },
        },
      },
      "/api/auth/get-session": {
        get: {
          tags: ["Auth"],
          summary: "Recuperer la session courante",
          security: [{ SessionCookieAuth: [] }],
          responses: {
            "200": {
              description: "Session courante",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AuthSessionResponse" },
                },
              },
            },
            "401": {
              description: "Aucune session active",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: {
                    error: "Unauthorized",
                    message: "Session not found",
                  },
                },
              },
            },
          },
        },
      },
      "/api/auth/sign-out": {
        post: {
          tags: ["Auth"],
          summary: "Deconnecter l'utilisateur courant",
          security: [{ SessionCookieAuth: [] }],
          responses: {
            "200": {
              description: "Deconnexion effectuee",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                    },
                  },
                  example: { success: true },
                },
              },
            },
          },
        },
      },
      "/api/auth/update-user": {
        post: {
          tags: ["Auth"],
          summary: "Mettre a jour le profil de l'utilisateur courant",
          security: [{ SessionCookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthUpdateUserBody" },
              },
            },
          },
          responses: {
            "200": {
              description: "Profil mis a jour",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      user: { $ref: "#/components/schemas/AuthUser" },
                    },
                    required: ["user"],
                  },
                },
              },
            },
            "401": { description: "Non authentifie" },
          },
        },
      },
      "/api/auth/change-password": {
        post: {
          tags: ["Auth"],
          summary: "Changer le mot de passe de l'utilisateur courant",
          security: [{ SessionCookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthChangePasswordBody" },
              },
            },
          },
          responses: {
            "200": {
              description: "Mot de passe mis a jour",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                    },
                  },
                  example: { success: true },
                },
              },
            },
            "400": {
              description: "Mot de passe invalide",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: {
                    error: "Bad Request",
                    message: "Invalid current password",
                  },
                },
              },
            },
          },
        },
      },
      "/api/auth/delete-user": {
        post: {
          tags: ["Auth"],
          summary: "Supprimer le compte utilisateur courant",
          security: [{ SessionCookieAuth: [] }],
          requestBody: {
            required: false,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthDeleteUserBody" },
              },
            },
          },
          responses: {
            "200": {
              description: "Compte supprime",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                    },
                  },
                  example: { success: true },
                },
              },
            },
            "401": { description: "Non authentifie" },
          },
        },
      },
      "/api/films/search": {
        get: {
          tags: ["Films"],
          summary: "Rechercher des films",
          parameters: [
            {
              name: "q",
              in: "query",
              required: true,
              schema: { type: "string", minLength: 3 },
              description: "Texte de recherche",
            },
            {
              name: "page",
              in: "query",
              required: false,
              schema: { type: "integer", minimum: 1, default: 1 },
            },
          ],
          responses: {
            "200": {
              description: "Resultats de recherche",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      results: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            omdb_id: { type: "string", example: "tt1375666" },
                            title: { type: "string", example: "Inception" },
                            year: { type: "string", example: "2010" },
                            poster_url: {
                              type: "string",
                              example: "https://...jpg",
                            },
                          },
                        },
                      },
                      page: { type: "integer", example: 1 },
                    },
                  },
                },
              },
            },
            "400": { description: "Parametres invalides" },
            "500": { description: "Erreur serveur" },
          },
        },
      },
      "/api/films/by-genre": {
        get: {
          tags: ["Films"],
          summary: "Lister les films groupes par genre",
          parameters: [
            {
              name: "limit",
              in: "query",
              required: false,
              schema: { type: "integer", minimum: 1, default: 24 },
            },
          ],
          responses: {
            "200": { description: "Films par genre" },
            "500": { description: "Erreur serveur" },
          },
        },
      },
      "/api/films/top-rated": {
        get: {
          tags: ["Films"],
          summary: "Lister les films les mieux notes",
          parameters: [
            {
              name: "limit",
              in: "query",
              required: false,
              schema: { type: "integer", minimum: 1, default: 10 },
            },
          ],
          responses: {
            "200": { description: "Top films" },
            "500": { description: "Erreur serveur" },
          },
        },
      },
      "/api/films/community-reviews": {
        get: {
          tags: ["Films"],
          summary: "Recuperer les derniers avis de la communaute",
          parameters: [
            {
              name: "limit",
              in: "query",
              required: false,
              schema: { type: "integer", minimum: 1, default: 4 },
            },
          ],
          responses: {
            "200": { description: "Avis communautaires" },
            "500": { description: "Erreur serveur" },
          },
        },
      },
      "/api/films/{omdbId}": {
        get: {
          tags: ["Films"],
          summary: "Recuperer le detail d'un film",
          parameters: [
            {
              name: "omdbId",
              in: "path",
              required: true,
              schema: { type: "string", example: "tt1375666" },
            },
          ],
          responses: {
            "200": { description: "Detail du film" },
            "404": { description: "Film introuvable" },
            "500": { description: "Erreur serveur" },
          },
        },
      },
      "/api/films/{omdbId}/reviews": {
        get: {
          tags: ["Reviews"],
          summary: "Lister les commentaires d'un film",
          parameters: [
            {
              name: "omdbId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": { description: "Commentaires du film" },
            "404": { description: "Film introuvable" },
            "500": { description: "Erreur serveur" },
          },
        },
        post: {
          tags: ["Reviews"],
          summary: "Ajouter un commentaire sur un film",
          security: [{ SessionCookieAuth: [] }],
          parameters: [
            {
              name: "omdbId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CommentBody" },
              },
            },
          },
          responses: {
            "201": { description: "Commentaire cree" },
            "400": { description: "Requete invalide" },
            "401": { description: "Non authentifie" },
            "404": { description: "Film introuvable" },
            "500": { description: "Erreur serveur" },
          },
        },
      },
      "/api/films/{omdbId}/reviews/rating-summary": {
        get: {
          tags: ["Reviews"],
          summary: "Recuperer le resume des notes d'un film",
          parameters: [
            {
              name: "omdbId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": { description: "Resume des notes" },
            "404": { description: "Film introuvable" },
            "500": { description: "Erreur serveur" },
          },
        },
      },
      "/api/films/{omdbId}/reviews/rating": {
        post: {
          tags: ["Reviews"],
          summary: "Creer ou mettre a jour sa note sur un film",
          security: [{ SessionCookieAuth: [] }],
          parameters: [
            {
              name: "omdbId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RatingBody" },
              },
            },
          },
          responses: {
            "200": { description: "Resume des notes apres mise a jour" },
            "400": { description: "Requete invalide" },
            "401": { description: "Non authentifie" },
            "404": { description: "Film introuvable" },
            "500": { description: "Erreur serveur" },
          },
        },
      },
      "/api/films/{omdbId}/reviews/{reviewId}/replies": {
        post: {
          tags: ["Reviews"],
          summary: "Ajouter une reponse a un commentaire",
          security: [{ SessionCookieAuth: [] }],
          parameters: [
            {
              name: "omdbId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
            {
              name: "reviewId",
              in: "path",
              required: true,
              schema: { type: "integer" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ReplyBody" },
              },
            },
          },
          responses: {
            "201": { description: "Reponse creee" },
            "400": { description: "Requete invalide" },
            "401": { description: "Non authentifie" },
            "404": { description: "Film ou commentaire introuvable" },
            "500": { description: "Erreur serveur" },
          },
        },
      },
      "/api/films/{omdbId}/reviews/{reviewId}": {
        patch: {
          tags: ["Reviews"],
          summary: "Modifier son commentaire",
          security: [{ SessionCookieAuth: [] }],
          parameters: [
            {
              name: "omdbId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
            {
              name: "reviewId",
              in: "path",
              required: true,
              schema: { type: "integer" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ReplyBody" },
              },
            },
          },
          responses: {
            "204": { description: "Commentaire mis a jour" },
            "400": { description: "Requete invalide" },
            "401": { description: "Non authentifie" },
            "403": { description: "Action interdite" },
            "404": { description: "Film ou commentaire introuvable" },
            "500": { description: "Erreur serveur" },
          },
        },
        delete: {
          tags: ["Reviews"],
          summary: "Supprimer son commentaire",
          security: [{ SessionCookieAuth: [] }],
          parameters: [
            {
              name: "omdbId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
            {
              name: "reviewId",
              in: "path",
              required: true,
              schema: { type: "integer" },
            },
          ],
          responses: {
            "204": { description: "Commentaire supprime" },
            "401": { description: "Non authentifie" },
            "403": { description: "Action interdite" },
            "404": { description: "Film ou commentaire introuvable" },
            "500": { description: "Erreur serveur" },
          },
        },
      },
      "/api/categories": {
        get: {
          tags: ["Categories"],
          summary: "Lister les categories disponibles",
          responses: {
            "200": { description: "Liste des categories" },
            "500": { description: "Erreur serveur" },
          },
        },
      },
      "/api/categories/films": {
        get: {
          tags: ["Categories"],
          summary: "Lister les films groupes par categories",
          parameters: [
            {
              name: "limit",
              in: "query",
              required: false,
              schema: { type: "integer", minimum: 1, default: 24 },
            },
          ],
          responses: {
            "200": { description: "Films par categories" },
            "500": { description: "Erreur serveur" },
          },
        },
      },
      "/api/categories/{id}/films": {
        get: {
          tags: ["Categories"],
          summary: "Lister les films d'une categorie",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
            },
            {
              name: "limit",
              in: "query",
              required: false,
              schema: { type: "integer", minimum: 1, default: 24 },
            },
          ],
          responses: {
            "200": { description: "Films de la categorie" },
            "400": { description: "Parametres invalides" },
            "500": { description: "Erreur serveur" },
          },
        },
      },
      "/api/friends": {
        get: {
          tags: ["Friends"],
          summary: "Lister mes amis",
          security: [{ SessionCookieAuth: [] }],
          responses: {
            "200": {
              description: "Liste des amis",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        user_id: { type: "integer", example: 1 },
                        friend_user_id: { type: "integer", example: 2 },
                        status: { type: "string", example: "accepted" },
                        friend: {
                          type: "object",
                          properties: {
                            id: { type: "integer", example: 2 },
                            name: { type: "string", example: "Alice" },
                            email: {
                              type: "string",
                              format: "email",
                              example: "alice@cineconnect.app",
                            },
                            image: {
                              type: "string",
                              nullable: true,
                              example: null,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            "401": { description: "Non authentifie" },
            "500": { description: "Erreur serveur" },
          },
        },
      },
      "/api/friends/pending": {
        get: {
          tags: ["Friends"],
          summary: "Lister mes demandes en attente",
          security: [{ SessionCookieAuth: [] }],
          responses: {
            "200": { description: "Demandes en attente" },
            "401": { description: "Non authentifie" },
            "500": { description: "Erreur serveur" },
          },
        },
      },
      "/api/friends/request": {
        post: {
          tags: ["Friends"],
          summary: "Envoyer une demande d'ami",
          security: [{ SessionCookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/FriendActionBody" },
              },
            },
          },
          responses: {
            "201": { description: "Demande envoyee" },
            "400": { description: "Requete invalide" },
            "401": { description: "Non authentifie" },
          },
        },
      },
      "/api/friends/accept": {
        post: {
          tags: ["Friends"],
          summary: "Accepter une demande d'ami",
          security: [{ SessionCookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/FriendActionBody" },
              },
            },
          },
          responses: {
            "200": { description: "Demande acceptee" },
            "400": { description: "Requete invalide" },
            "401": { description: "Non authentifie" },
          },
        },
      },
      "/api/friends/reject": {
        post: {
          tags: ["Friends"],
          summary: "Rejeter une demande d'ami",
          security: [{ SessionCookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/FriendActionBody" },
              },
            },
          },
          responses: {
            "200": { description: "Demande rejetee" },
            "400": { description: "Requete invalide" },
            "401": { description: "Non authentifie" },
          },
        },
      },
      "/api/friends/{friendUserId}": {
        delete: {
          tags: ["Friends"],
          summary: "Supprimer un ami",
          security: [{ SessionCookieAuth: [] }],
          parameters: [
            {
              name: "friendUserId",
              in: "path",
              required: true,
              schema: { type: "integer" },
            },
          ],
          responses: {
            "204": { description: "Ami supprime" },
            "401": { description: "Non authentifie" },
            "500": { description: "Erreur serveur" },
          },
        },
      },
      "/api/messages/with/{userId}": {
        get: {
          tags: ["Messages"],
          summary: "Recuperer une conversation",
          security: [{ SessionCookieAuth: [] }],
          parameters: [
            {
              name: "userId",
              in: "path",
              required: true,
              schema: { type: "integer" },
            },
            {
              name: "page",
              in: "query",
              required: false,
              schema: { type: "integer", minimum: 1, default: 1 },
            },
            {
              name: "limit",
              in: "query",
              required: false,
              schema: { type: "integer", minimum: 1, default: 50 },
            },
          ],
          responses: {
            "200": { description: "Messages de la conversation" },
            "401": { description: "Non authentifie" },
            "500": { description: "Erreur serveur" },
          },
        },
      },
      "/api/messages/conversations": {
        get: {
          tags: ["Messages"],
          summary: "Lister les conversations recentes",
          security: [{ SessionCookieAuth: [] }],
          responses: {
            "200": { description: "Conversations recentes" },
            "401": { description: "Non authentifie" },
            "500": { description: "Erreur serveur" },
          },
        },
      },
      "/api/messages/incoming": {
        get: {
          tags: ["Messages"],
          summary: "Lister les derniers messages recus",
          security: [{ SessionCookieAuth: [] }],
          parameters: [
            {
              name: "limit",
              in: "query",
              required: false,
              schema: { type: "integer", minimum: 1, default: 20 },
            },
          ],
          responses: {
            "200": { description: "Messages recus" },
            "401": { description: "Non authentifie" },
            "500": { description: "Erreur serveur" },
          },
        },
      },
      "/api/messages": {
        post: {
          tags: ["Messages"],
          summary: "Envoyer un message",
          security: [{ SessionCookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SendMessageBody" },
              },
            },
          },
          responses: {
            "201": {
              description: "Message envoye",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message_id: { type: "integer", example: 123 },
                      sender_id: { type: "integer", example: 1 },
                      receiver_id: { type: "integer", example: 2 },
                      content: {
                        type: "string",
                        example: "Salut, tu as vu Dune 2 ?",
                      },
                      created_at: {
                        type: "string",
                        format: "date-time",
                        example: "2026-03-26T14:31:00.000Z",
                      },
                    },
                  },
                },
              },
            },
            "400": { description: "Requete invalide" },
            "401": { description: "Non authentifie" },
            "500": { description: "Erreur serveur" },
          },
        },
      },
      "/api/users/me/latest-ratings": {
        get: {
          tags: ["Users"],
          summary: "Recuperer les dernieres notes de l'utilisateur connecte",
          security: [{ SessionCookieAuth: [] }],
          parameters: [
            {
              name: "limit",
              in: "query",
              required: false,
              schema: {
                type: "integer",
                minimum: 1,
                maximum: 200,
                default: 100,
              },
            },
          ],
          responses: {
            "200": { description: "Dernieres notes" },
            "401": { description: "Non authentifie" },
            "500": { description: "Erreur serveur" },
          },
        },
      },
      "/api/users/me/latest-comments": {
        get: {
          tags: ["Users"],
          summary:
            "Recuperer les derniers commentaires de l'utilisateur connecte",
          security: [{ SessionCookieAuth: [] }],
          parameters: [
            {
              name: "limit",
              in: "query",
              required: false,
              schema: {
                type: "integer",
                minimum: 1,
                maximum: 200,
                default: 100,
              },
            },
          ],
          responses: {
            "200": { description: "Derniers commentaires" },
            "401": { description: "Non authentifie" },
            "500": { description: "Erreur serveur" },
          },
        },
      },
      "/api/users/me/comment-replies": {
        get: {
          tags: ["Users"],
          summary: "Recuperer les reponses recues sur mes commentaires",
          security: [{ SessionCookieAuth: [] }],
          parameters: [
            {
              name: "limit",
              in: "query",
              required: false,
              schema: { type: "integer", minimum: 1, default: 20 },
            },
          ],
          responses: {
            "200": { description: "Reponses sur commentaires" },
            "401": { description: "Non authentifie" },
            "500": { description: "Erreur serveur" },
          },
        },
      },
      "/api/users": {
        get: {
          tags: ["Users"],
          summary: "Rechercher des utilisateurs",
          security: [{ SessionCookieAuth: [] }],
          parameters: [
            {
              name: "search",
              in: "query",
              required: true,
              schema: { type: "string", minLength: 2 },
              description: "Nom ou email a rechercher",
            },
          ],
          responses: {
            "200": {
              description: "Resultats de recherche",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "integer", example: 7 },
                        name: { type: "string", example: "Nora" },
                        email: {
                          type: "string",
                          format: "email",
                          example: "nora@cineconnect.app",
                        },
                        image: {
                          type: "string",
                          nullable: true,
                          example: null,
                        },
                        relationStatus: {
                          type: "string",
                          nullable: true,
                          example: "pending",
                        },
                      },
                    },
                  },
                },
              },
            },
            "401": { description: "Non authentifie" },
            "500": { description: "Erreur serveur" },
          },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export function setupSwagger(app: Express): void {
  app.get("/swagger", (_req, res) => {
    res.redirect("/api/docs");
  });

  app.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customSiteTitle: "CineConnect API Docs",
    }),
  );

  app.get("/api/docs.json", (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
}
