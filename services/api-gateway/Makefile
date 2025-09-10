.PHONY: run dev test lint format clean build docker-build docker-run openapi install

# Development commands
install:
	pip install -e ".[dev,test]"

run:
	uvicorn app.main:app --reload --port 8080

dev: install run

test:
	pytest -v

lint:
	ruff check app tests
	mypy app

format:
	black app tests
	ruff --fix app tests

clean:
	rm -rf __pycache__ .pytest_cache .coverage htmlcov dist build *.egg-info
	find . -type d -name "__pycache__" -delete
	find . -type f -name "*.pyc" -delete

# Docker commands  
docker-build:
	docker build -t homni-api-gateway .

docker-run:
	docker-compose up -d

docker-stop:
	docker-compose down

# API documentation
openapi:
	python ../../scripts/export_openapi.py

# CI commands
ci-test: install test lint

build: clean
	python -m build