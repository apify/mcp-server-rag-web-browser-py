.PHONY: clean install-dev build publish-to-pypi lint type-check format check-version-conflict check-changelog-entry check-code

DIRS_WITH_CODE = src

clean:
	rm -rf .mypy_cache .pytest_cache .ruff_cache build dist htmlcov .coverage

install-dev:
	curl -LsSf https://astral.sh/uv/install.sh | sh
	uv sync --dev --all-extras
	uv pip install pre-commit

build:
	uv build

# APIFY_PYPI_TOKEN_APIFY_HAYSTACK is expected to be set in the environment
#publish-to-pypi:
	#poetry config pypi-token.pypi "${APIFY_PYPI_TOKEN_MCP_SERVER_RAG_WEB_BROWSER}"
	#poetry publish --no-interaction -vv

lint:
	uv run ruff check $(DIRS_WITH_CODE)

type-check:
	uv run mypy $(DIRS_WITH_CODE)

format:
	uv run ruff check --fix $(DIRS_WITH_CODE)
	uv run ruff format $(DIRS_WITH_CODE)

# The check-code target runs a series of checks equivalent to those performed by pre-commit hooks
# and the run_checks.yaml GitHub Actions workflow.
check-code: lint type-check
