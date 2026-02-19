# CineConnect 

## 🚀 Installation

### 1. Installer les dépendances
\```bash
pnpm install
\```

# CineConnect Backend 

### 2. Configuration de l'environnement

#### Copier le fichier de configuration
\```bash
cp .env.example .env
\```

#### Configurer MySQL (Important!)

Par défaut, XAMPP n'a pas de mot de passe MySQL, mais Drizzle en exige un.

1. Ouvrir phpMyAdmin : http://localhost:8080/phpmyadmin/
2. Onglet "SQL" → Exécuter :
\```sql
ALTER USER 'root'@'localhost' IDENTIFIED BY 'root';
FLUSH PRIVILEGES;
\```
3. Modifier `C:\xampp\phpMyAdmin\config.inc.php` :
   - Chercher : `$cfg['Servers'][$i]['password'] = '';`
   - Remplacer par : `$cfg['Servers'][$i]['password'] = 'root';`
4. Redémarrer MySQL dans XAMPP

### 3. Créer la base de données

1. Démarrer XAMPP (Apache + MySQL)
2. Ouvrir phpMyAdmin
3. Créer une nouvelle base :
   - Nom : `cineconnect`
   - Interclassement : `utf8mb4_unicode_ci`

### 4. Créer les tables (à partir du schéma)
\```bash
pnpm db:push 
\```

### 5. Démarrer le serveur
\```bash
pnpm dev
\```

Le serveur démarre sur http://localhost:3000

## 📦 Scripts disponibles

- `pnpm dev` - Démarre le serveur en mode développement
- `pnpm build` - Compile le TypeScript
- `pnpm start` - Démarre le serveur compilé
- `pnpm db:push` - Synchronise le schéma avec la BDD
- `pnpm db:studio` - Ouvre Drizzle Studio (interface visuelle)
- `pnpm db:generate` - Génère les migrations SQL
- `pnpm test` - Lance les tests

## 🗄️ Structure de la base de données

Tables disponibles :
- `users` - Utilisateurs
- `films` - Films
- `categories` - Catégories de films
- `films_categories` - Liaison films/catégories
- `reviews` - Critiques de films
- `friends` - Relations d'amitié
- `messages` - Messagerie

Voir `src/db/schema.ts` pour les détails.

## ⚠️ Important

- Ne jamais commit le fichier `.env`
- Toujours partir de `.env.example`
- Démarrer XAMPP avant de lancer l'app
\```
