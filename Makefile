# +------------------------------------------------+
# |               REDTETRIS MAKEFILE               |
# +------------------------------------------------+

# +------------------ VARIABLES -------------------+

DOCKER_COMPOSE := docker-compose
DOCKER := docker
FRONTEND_DIR := ./app/frontend
BACKEND_DIR := ./app/backend

RESET := \033[0m
BOLD := \033[1m
GREEN := \033[32m
YELLOW := \033[33m
BLUE := \033[34m
CYAN := \033[36m

.DEFAULT_GOAL := help

# +------------------- TARGETS --------------------+

start:
	@echo "${GREEN}Building and starting the docker containers..."
	@echo "-----------------------------------------------${RESET}"
	$(DOCKER_COMPOSE) up -d --build

stop:
	@echo "${GREEN}Stopping the docker containers..."
	@echo "---------------------------------${RESET}"
	$(DOCKER_COMPOSE) down

restart: stop start
	@echo "${GREEN}Restarting the docker containers..."
	@echo "-----------------------------------${RESET}"

logs: 
	@echo "${GREEN}Checking logs of the docker containers..."
	@echo "-----------------------------------------${RESET}"
	$(DOCKER_COMPOSE) logs -f

clean:
	@echo "${GREEN}Removing the docker containers..."
	@echo "---------------------------------${RESET}"
	$(DOCKER_COMPOSE) down -v || true
	docker system prune -f || true

fclean: clean
	@echo "${GREEN}Removing all elements relative to the docker containers..."
	@echo "----------------------------------------------------------${RESET}"
	$(DOCKER_COMPOSE) down --rmi all -v --remove-orphans || true
	$(DOCKER) volume prune -f || true
	$(DOCKER) network prune -f || true
	$(DOCKER) image prune -f || true
	$(DOCKER) image prune -a -f || true
	$(DOCKER) builder prune -f || true

test:
	@echo "${GREEN}Running the tests..."
	@echo "--------------------${RESET}"
	@echo "${GREEN}For the frontend...${RESET}"
	cd $(FRONTEND_DIR) && npm test
	@echo "${GREEN}For the backend...${RESET}"
	cd $(BACKEND_DIR) && npm test

test-coverage:
	@echo "${GREEN}Running the tests with coverage..."
	@echo "------------------------------------${RESET}"
	@echo "${GREEN}For the frontend...${RESET}"
	cd $(FRONTEND_DIR) && npm run coverage
	@echo "${GREEN}For the backend...${RESET}"
	cd $(BACKEND_DIR) && npm run coverage

all: start logs

re: fclean all

# +------------------- BASE ----------------------+

help:
	@echo "${CYAN}Usage: make [target]${RESET}"
	@echo "${CYAN}Targets:${RESET}"
	@echo "${CYAN}- start${RESET}		Build and start the docker containers"
	@echo "${CYAN}- stop${RESET}		Stop the docker containers"
	@echo "${CYAN}- restart${RESET}	Restart the docker containers"
	@echo "${CYAN}- logs${RESET}		Show the logs of the docker containers"
	@echo "${CYAN}- clean${RESET}		Remove the docker containers"
	@echo "${CYAN}- fclean${RESET}	Remove the docker containers and volumes"
	@echo "${CYAN}- all${RESET}		Build, start, and show the logs of the docker containers"
	@echo "${CYAN}- re${RESET}		Clean everything and start the docker containers"
	@echo "${CYAN}- test${RESET}		Run the tests"
	@echo "${CYAN}- test-coverage${RESET}	Run the tests with coverage"

.DEFAULT:
	@echo "$(ERROR)[ERROR] Unknown target '$@'. Use 'make help' to see available commands.$(NC)"
	@make help

.PHONY: help start stop restart logs clean fclean all re test test-coverage
