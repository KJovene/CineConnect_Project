FROM node:22-alpine

# Installer pnpm
RUN npm install -g pnpm

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de configuration du workspace (depuis la racine)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copier les packages
COPY shared/ ./shared/
COPY backend/ ./backend/

# Installer les dépendances
RUN pnpm install --frozen-lockfile

# Se déplacer dans le dossier backend
WORKDIR /app/backend

# Exposer le port
EXPOSE 3000

# Commande de développement avec hot reload
CMD ["pnpm", "dev"]