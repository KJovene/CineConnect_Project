# Temps reel (Socket.io)

## Principe

Le backend initialise Socket.io sur le meme serveur HTTP que l'API.
L'authentification socket reutilise la session Better Auth via cookie.

## Configuration frontend

Variables:

```env
VITE_SOCKET_URL=http://localhost:3000
```

Client initialise dans `frontend/src/lib/socket.ts` avec:

- `withCredentials: true`
- `autoConnect: false`

## Evenements utilises

Emission client -> serveur:

- `dm:send` payload `{ toUserId, content }`
- `dm:seen` payload `{ fromUserId }`

Emission serveur -> client:

- `dm:new` payload `{ message }`
- `dm:error` payload `{ error }`
- `presence:online` payload `{ userId }`
- `presence:offline` payload `{ userId }`

## Rooms

Chaque utilisateur rejoint une room dediee:

- `user:<userId>`

Le backend envoie les DM vers la room du destinataire.

## Bonnes pratiques

- Connecter la socket uniquement quand la session existe.
- Nettoyer les listeners React dans les `useEffect`.
- Garder un fallback REST en cas de perte de connexion socket.
