FROM node:22-alpine

# Installer pnpm
RUN npm install -g pnpm

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de configuration du workspace (depuis la racine)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copier les packages
COPY shared/ ./shared/
COPY frontend/ ./frontend/

# Installer les dépendances
RUN pnpm install --frozen-lockfile

# Se déplacer dans le dossier frontend
WORKDIR /app/frontend

# Exposer le port de développement
EXPOSE 5173

# Commande de développement avec hot reload
CMD ["pnpm", "dev", "--host", "0.0.0.0"]