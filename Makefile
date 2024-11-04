# +------------------------------------------------+
# |               REDTETRIS MAKEFILE               |
# +------------------------------------------------+

# +------------------ VARIABLES -------------------+

DOCKER_COMPOSE := docker-compose
DOCKER := docker
FRONTEND_DIR := ./app/frontend
BACKEND_DIR := ./app/backend
TEST_LOG_FILE := $(BACKEND_DIR)/__tests__/logs.txt
TEST_REPORT_FILE := $(BACKEND_DIR)/__tests__/report
ENV_FILE := .env

RESET := \033[0m
BOLD := \033[1m
GREEN := \033[32m
YELLOW := \033[33m
BLUE := \033[34m
CYAN := \033[36m
RED := \033[31m

.DEFAULT_GOAL := help

check-env:
	@if [ ! -f $(ENV_FILE) ]; then \
		echo "$(YELLOW)[WARNING]$(RESET) No .env file found! Please provide an .env file in the current directory to proceed."; \
		exit 1; \
	fi

# +------------------- TARGETS --------------------+

start: check-env
	@echo "$(GREEN)Building and starting the docker containers...$(RESET)"
	@echo "-----------------------------------------------$(RESET)"
	$(DOCKER_COMPOSE) up -d --build

stop: check-env
	@echo "$(GREEN)Stopping the docker containers...$(RESET)"
	@echo "---------------------------------$(RESET)"
	$(DOCKER_COMPOSE) down

restart: check-env
	@echo "$(GREEN)Restarting the docker containers...$(RESET)"
	@echo "-----------------------------------$(RESET)"
	$(DOCKER_COMPOSE) restart
	@make logs

logs: check-env
	@echo "$(GREEN)Checking logs of the docker containers...$(RESET)"
	@echo "-----------------------------------------$(RESET)"
	$(DOCKER_COMPOSE) logs -f

clean: check-env
	@echo "$(GREEN)Removing the docker containers...$(RESET)"
	@echo "---------------------------------$(RESET)"
	$(DOCKER_COMPOSE) down -v --remove-orphans

fclean: clean test-clean
	@echo "$(GREEN)Removing all elements relative to the docker containers...$(RESET)"
	@echo "----------------------------------------------------------$(RESET)"
	$(DOCKER_COMPOSE) down --rmi all -v --remove-orphans
	@if [ "$$( $(DOCKER) ps -aq )" ]; then \
			$(DOCKER) rm $$( $(DOCKER) ps -aq ) || true; \
	fi
	$(DOCKER) volume prune -f
	$(DOCKER) network prune -f
	$(DOCKER) image prune -f
	$(DOCKER) image prune -a -f
	$(DOCKER) builder prune -f
	rm -rf $(FRONTEND_DIR)/node_modules
	rm -rf $(BACKEND_DIR)/node_modules
	rm -rf $(BACKEND_DIR)/redtetris.db

test: check-env start
	@echo "$(GREEN)Running the tests in the backend container...$(RESET)"
	@echo "--------------------$(RESET)"
	$(DOCKER_COMPOSE) exec backend npm run test

test-clean:
	@echo "$(GREEN)Removing all files relative to the tests...$(RESET)"
	@echo "-------------------------------------------$(RESET)"
	rm -rf $(TEST_LOG_FILE) $(TEST_REPORT_FILE) $(BACKEND_DIR)/node_modules

test-re: test-clean test

db: check-env
	docker exec -it redtetris-backend sqlite3 /usr/src/app/backend/redtetris.db

all: check-env fclean start logs

re: fclean all

# +------------------- BASE ----------------------+

help:
	@echo "$(CYAN)Usage: make [target]$(RESET)"
	@echo "$(CYAN)Targets:$(RESET)"
	@echo "$(CYAN)- start$(RESET)		Build and start the docker containers"
	@echo "$(CYAN)- stop$(RESET)		Stop the docker containers"
	@echo "$(CYAN)- restart$(RESET)	Restart the docker containers"
	@echo "$(CYAN)- logs$(RESET)		Show the logs of the docker containers"
	@echo "$(CYAN)- clean$(RESET)		Remove the docker containers"
	@echo "$(CYAN)- fclean$(RESET)	Remove the docker containers and volumes"
	@echo "$(CYAN)- all$(RESET)		Build, start, and show the logs of the docker containers"
	@echo "$(CYAN)- re$(RESET)		Clean everything and start the docker containers"
	@echo "$(CYAN)- test$(RESET)		Run the tests"
	@echo "$(CYAN)- test-clean$(RESET)	Remove all files relative to the tests"
	@echo "$(CYAN)- test-re$(RESET)	Remove all files relative to the tests and run the tests"
	@echo "$(CYAN)- db$(RESET)		Access the database"

.DEFAULT:
	@echo "$(RED)[ERROR]$(RESET) Unknown target '$@'. Use 'make help' to see available commands."
	@make help

.PHONY: help start stop restart logs clean fclean all re test test-clean check-env
