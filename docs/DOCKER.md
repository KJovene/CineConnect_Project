# Docker Setup pour CineConnect

Configuration Docker simple pour le développement. Tout est containerisé avec hot reload.

## Architecture

- **Frontend React**: Container avec Vite + hot reload
- **Backend Express**: Container avec tsx watch + hot reload
- **PostgreSQL**: Base de données
- **Redis**: Cache et sessions

## Démarrage ultra-simple

```bash
# Démarrer tout en mode interactif
docker-compose up --build

# OU en arrière-plan
docker-compose up -d --build

# Arrêter
docker-compose down

# Voir les logs
docker-compose logs -f
```

**Résultat :**

- ✅ Frontend: http://localhost:5173
- ✅ Backend: http://localhost:3000
- ✅ PostgreSQL: localhost:5432
- ✅ Redis: localhost:6379

## Commandes principales

| Commande                       | Description                            |
| ------------------------------ | -------------------------------------- |
| `docker-compose up --build`    | Démarre tout (mode interactif)         |
| `docker-compose up -d --build` | Démarre en arrière-plan                |
| `docker-compose down`          | Arrête tous les services               |
| `docker-compose logs -f`       | Voir les logs en temps réel            |
| `docker-compose down -v`       | Arrête et supprime les données (reset) |

## Hot Reload

- **Frontend** : Modification d'un fichier `.tsx` → Rechargement instantané
- **Backend** : Modification d'un fichier `.ts` → Redémarrage automatique
- **Types partagés** : Changements dans `shared/` → Rechargement des deux

## Dépannage

**Reset complet :**

```bash
docker-compose down -v
docker-compose up --build
```

**Logs pour débugger :**

```bash
docker-compose logs -f
```

**Voir les containers :**

```bash
docker-compose ps
```

C'est tout ! Utilisez directement docker-compose, c'est plus simple et transparent.
