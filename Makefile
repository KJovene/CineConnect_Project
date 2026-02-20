# ========================================
# CineConnect - Makefile
# ========================================
# Commandes pour gérer le projet via Docker

.PHONY: help install build up down start stop restart ps logs logs-follow clean clean-volumes clean-all shell-backend shell-frontend shell-db db-migrate db-reset auth-pause auth-resume rebuild health

# Variables
DOCKER_COMPOSE = docker compose
PROJECT_NAME = cineconnect

# Couleurs pour l'affichage
GREEN = \033[0;32m
YELLOW = \033[0;33m
RED = \033[0;31m
NC = \033[0m # No Color

# ========================================
# AIDE
# ========================================
help: ## Affiche cette aide
	@echo "$(GREEN)CineConnect - Commandes disponibles$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""

# ========================================
# INSTALLATION & BUILD
# ========================================
install: ## Installer les dépendances (via pnpm)
	@echo "$(GREEN)Installation des dépendances...$(NC)"
	pnpm install

build: ## Builder toutes les images Docker
	@echo "$(GREEN)Building des images Docker...$(NC)"
	$(DOCKER_COMPOSE) build --no-cache

rebuild: ## Rebuild et redémarrer les services
	@echo "$(GREEN)Rebuild complet...$(NC)"
	$(DOCKER_COMPOSE) down
	$(DOCKER_COMPOSE) build --no-cache
	$(DOCKER_COMPOSE) up -d
	@echo "$(GREEN)✓ Services redémarrés$(NC)"

# ========================================
# GESTION DES SERVICES
# ========================================
up: ## Démarrer tous les services en arrière-plan
	@echo "$(GREEN)Démarrage des services...$(NC)"
	$(DOCKER_COMPOSE) up -d
	@echo "$(GREEN)✓ Services démarrés$(NC)"
	@echo "Frontend: http://localhost:5173"
	@echo "Backend:  http://localhost:3000"
	@echo "PostgreSQL: localhost:5432"
	@echo "Redis: localhost:6379"

start: up ## Alias pour 'up'

down: ## Arrêter et supprimer les conteneurs
	@echo "$(YELLOW)Arrêt des services...$(NC)"
	$(DOCKER_COMPOSE) down
	@echo "$(GREEN)✓ Services arrêtés$(NC)"

stop: ## Arrêter les conteneurs (sans les supprimer)
	@echo "$(YELLOW)Pause des services...$(NC)"
	$(DOCKER_COMPOSE) stop
	@echo "$(GREEN)✓ Services en pause$(NC)"

restart: ## Redémarrer tous les services
	@echo "$(YELLOW)Redémarrage des services...$(NC)"
	$(DOCKER_COMPOSE) restart
	@echo "$(GREEN)✓ Services redémarrés$(NC)"

# ========================================
# MONITORING
# ========================================
ps: ## Voir l'état des conteneurs
	@$(DOCKER_COMPOSE) ps

logs: ## Afficher les logs de tous les services
	@$(DOCKER_COMPOSE) logs

logs-follow: ## Suivre les logs en temps réel
	@$(DOCKER_COMPOSE) logs -f

logs-backend: ## Voir les logs du backend
	@$(DOCKER_COMPOSE) logs backend

logs-frontend: ## Voir les logs du frontend
	@$(DOCKER_COMPOSE) logs frontend

logs-db: ## Voir les logs de la base de données
	@$(DOCKER_COMPOSE) logs postgres

health: ## Vérifier la santé des services
	@echo "$(GREEN)État des services:$(NC)"
	@docker ps --filter "name=$(PROJECT_NAME)" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# ========================================
# NETTOYAGE
# ========================================
clean: ## Arrêter et supprimer conteneurs + réseaux
	@echo "$(RED)Nettoyage des conteneurs et réseaux...$(NC)"
	$(DOCKER_COMPOSE) down --remove-orphans
	@echo "$(GREEN)✓ Nettoyage terminé$(NC)"

clean-volumes: ## Supprimer les volumes (ATTENTION: perte de données!)
	@echo "$(RED)⚠️  ATTENTION: Cela supprimera toutes les données!$(NC)"
	@echo "$(RED)Appuyez sur Ctrl+C pour annuler, ou Entrée pour continuer...$(NC)"
	@read confirm
	$(DOCKER_COMPOSE) down -v
	@echo "$(GREEN)✓ Volumes supprimés$(NC)"

clean-all: ## Nettoyage complet (conteneurs + volumes + images)
	@echo "$(RED)⚠️  ATTENTION: Nettoyage complet - perte de toutes les données!$(NC)"
	@echo "$(RED)Appuyez sur Ctrl+C pour annuler, ou Entrée pour continuer...$(NC)"
	@read confirm
	$(DOCKER_COMPOSE) down -v --rmi all
	docker system prune -f
	@echo "$(GREEN)✓ Nettoyage complet terminé$(NC)"

# ========================================
# ACCÈS AUX SHELLS
# ========================================
shell-backend: ## Accéder au shell du conteneur backend
	@echo "$(GREEN)Connexion au backend...$(NC)"
	@$(DOCKER_COMPOSE) exec backend sh

shell-frontend: ## Accéder au shell du conteneur frontend
	@echo "$(GREEN)Connexion au frontend...$(NC)"
	@$(DOCKER_COMPOSE) exec frontend sh

shell-db: ## Accéder au shell PostgreSQL
	@echo "$(GREEN)Connexion à PostgreSQL...$(NC)"
	@$(DOCKER_COMPOSE) exec postgres psql -U postgres -d cineconnect

shell-redis: ## Accéder au shell Redis
	@echo "$(GREEN)Connexion à Redis...$(NC)"
	@$(DOCKER_COMPOSE) exec redis redis-cli

# ========================================
# BASE DE DONNÉES
# ========================================
db-migrate: ## Exécuter les migrations de la base de données
	@echo "$(GREEN)Exécution des migrations...$(NC)"
	pnpm db:migrate
	@echo "$(GREEN)✓ Migrations terminées$(NC)"

db-generate: ## Générer les migrations Drizzle
	@echo "$(GREEN)Génération des migrations...$(NC)"
	pnpm db:generate
	@echo "$(GREEN)✓ Migrations générées$(NC)"

db-reset: ## Réinitialiser la base de données (ATTENTION: perte de données!)
	@echo "$(RED)⚠️  ATTENTION: Réinitialisation de la base de données!$(NC)"
	@echo "$(RED)Appuyez sur Ctrl+C pour annuler, ou Entrée pour continuer...$(NC)"
	@read confirm
	$(DOCKER_COMPOSE) down postgres
	docker volume rm cineconnect-project_postgres_data 2>/dev/null || true
	$(DOCKER_COMPOSE) up -d postgres
	@echo "$(YELLOW)Attente de PostgreSQL...$(NC)"
	@sleep 5
	@$(MAKE) db-migrate
	@echo "$(GREEN)✓ Base de données réinitialisée$(NC)"

db-backup: ## Créer une sauvegarde de la base de données
	@echo "$(GREEN)Sauvegarde de la base de données...$(NC)"
	@mkdir -p backups
	@docker exec cineconnect-postgres pg_dump -U postgres cineconnect > backups/backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)✓ Sauvegarde créée dans backups/$(NC)"

db-restore: ## Restaurer la dernière sauvegarde (nécessite un fichier backups/restore.sql)
	@echo "$(YELLOW)Restauration de la base de données...$(NC)"
	@if [ ! -f backups/restore.sql ]; then \
		echo "$(RED)Erreur: backups/restore.sql introuvable!$(NC)"; \
		exit 1; \
	fi
	@cat backups/restore.sql | docker exec -i cineconnect-postgres psql -U postgres -d cineconnect
	@echo "$(GREEN)✓ Base de données restaurée$(NC)"

# ========================================
# SYSTÈME D'AUTHENTIFICATION
# ========================================
auth-pause: ## Mettre le système d'authentification en pause (arrête le backend)
	@echo "$(YELLOW)⏸️  Mise en pause du système d'authentification...$(NC)"
	@$(DOCKER_COMPOSE) stop backend
	@echo "$(GREEN)✓ Système d'authentification en pause$(NC)"
	@echo "$(YELLOW)Note: Le frontend reste actif mais les connexions sont impossibles$(NC)"

auth-resume: ## Reprendre le système d'authentification (redémarre le backend)
	@echo "$(GREEN)▶️  Reprise du système d'authentification...$(NC)"
	@$(DOCKER_COMPOSE) start backend
	@echo "$(GREEN)✓ Système d'authentification actif$(NC)"

auth-restart: ## Redémarrer le système d'authentification
	@echo "$(YELLOW)🔄 Redémarrage du système d'authentification...$(NC)"
	@$(DOCKER_COMPOSE) restart backend
	@echo "$(GREEN)✓ Système d'authentification redémarré$(NC)"

# ========================================
# DÉVELOPPEMENT
# ========================================
dev-local: ## Démarrer en mode développement local (sans Docker)
	@echo "$(GREEN)Démarrage en mode développement local...$(NC)"
	pnpm dev

dev-docker: up ## Alias pour démarrer avec Docker

dev-logs: ## Suivre les logs de dev en temps réel
	@$(DOCKER_COMPOSE) logs -f backend frontend

# ========================================
# VOLUMES
# ========================================
volumes-list: ## Lister tous les volumes Docker
	@echo "$(GREEN)Volumes Docker:$(NC)"
	@docker volume ls --filter "name=$(PROJECT_NAME)"

volumes-inspect: ## Inspecter le volume PostgreSQL
	@docker volume inspect cineconnect-project_postgres_data 2>/dev/null || echo "$(RED)Volume non trouvé$(NC)"

volumes-prune: ## Supprimer les volumes non utilisés
	@echo "$(YELLOW)Suppression des volumes non utilisés...$(NC)"
	@docker volume prune -f
	@echo "$(GREEN)✓ Volumes nettoyés$(NC)"

# ========================================
# TESTS & QUALITÉ
# ========================================
test: ## Lancer tous les tests
	@echo "$(GREEN)Lancement des tests...$(NC)"
	pnpm test:front
	pnpm test:back

lint: ## Vérifier le code (linting)
	@echo "$(GREEN)Vérification du code...$(NC)"
	@$(DOCKER_COMPOSE) exec backend npm run lint || true
	@$(DOCKER_COMPOSE) exec frontend npm run lint || true

# ========================================
# PRODUCTION
# ========================================
build-prod: ## Builder pour la production
	@echo "$(GREEN)Build de production...$(NC)"
	pnpm build:shared
	pnpm build:back
	pnpm build:front
	@echo "$(GREEN)✓ Build terminé$(NC)"

# ========================================
# COMMANDES PRATIQUES
# ========================================
status: ## Afficher un résumé complet du statut
	@echo "$(GREEN)═══════════════════════════════════════$(NC)"
	@echo "$(GREEN)    CineConnect - Statut du Projet$(NC)"
	@echo "$(GREEN)═══════════════════════════════════════$(NC)"
	@echo ""
	@echo "$(YELLOW)Conteneurs:$(NC)"
	@$(DOCKER_COMPOSE) ps
	@echo ""
	@echo "$(YELLOW)Volumes:$(NC)"
	@docker volume ls --filter "name=$(PROJECT_NAME)" --format "table {{.Name}}\t{{.Driver}}"
	@echo ""
	@echo "$(YELLOW)Réseau:$(NC)"
	@docker network ls --filter "name=$(PROJECT_NAME)" --format "table {{.Name}}\t{{Driver}}\t{{Scope}}"

quick-start: install build up ## Installation et démarrage rapide du projet
	@echo ""
	@echo "$(GREEN)╔════════════════════════════════════════╗$(NC)"
	@echo "$(GREEN)║  ✓ CineConnect est prêt!             ║$(NC)"
	@echo "$(GREEN)╚════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(YELLOW)Accès:$(NC)"
	@echo "  Frontend: http://localhost:5173"
	@echo "  Backend:  http://localhost:3000"
	@echo ""
	@echo "$(YELLOW)Commandes utiles:$(NC)"
	@echo "  make logs-follow  - Voir les logs en temps réel"
	@echo "  make ps           - Voir l'état des services"
	@echo "  make help         - Voir toutes les commandes"

# Par défaut, afficher l'aide
.DEFAULT_GOAL := help
