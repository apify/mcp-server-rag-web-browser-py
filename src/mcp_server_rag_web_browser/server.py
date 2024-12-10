from __future__ import annotations

import asyncio
import json
import logging
import os
from urllib import parse

import httpx
from dotenv import load_dotenv
from mcp.server import Server
from mcp.types import TextContent, Tool

load_dotenv()

fmt = "%(asctime)sZ %(levelname)s  %(name)s: %(message)s"
logging.basicConfig(level=logging.INFO, format=fmt, datefmt="%Y-%m-%dT%H:%M:%S")
logger = logging.getLogger("apify")

ACTOR_BASE_URL = "https://rag-web-browser.apify.actor/search"  # Base URL from OpenAPI schema

TOOL_SEARCH = "search"
MAX_RESULTS = 1
TIMEOUT = 45

# Prepare the API key
if not (APIFY_API_TOKEN := os.getenv("APIFY_API_TOKEN")):
    logger.error("APIFY_API_TOKEN environment variable not found")
    raise ValueError("APIFY_API_TOKEN environment variable required. Please set it in the .env file.")

# Prepare the server
server = Server("server-rag-web-browser")


@server.list_tools()
async def list_tools() -> list[Tool]:
    """Return a list of available tools."""
    logger.info("List available tools")
    tools = [
        Tool(
            name=TOOL_SEARCH,
            description="Search phrase or a URL at google and return crawled web pages as text or Markdown",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Google Search keywords or a URL of a specific web page",
                    },
                    "maxResults": {
                        "type": "number",
                        "description": "The maximum number of top organic Google Search results whose web pages"
                        " will be extracted",
                        "default": MAX_RESULTS,
                    },
                },
                "required": ["query"],
            },
        )
    ]
    logger.debug(f"Returning tools: {tools}")
    return tools


def handle_input_arguments(name: str, arguments: dict | None) -> tuple[str, int]:
    """Extract and validate input arguments."""
    if name != TOOL_SEARCH:
        raise ValueError(f"Error: Unsupported tool requested: '{name}'. Only {TOOL_SEARCH} is supported.")

    if not arguments:
        raise ValueError("Error: No arguments provided. Expected 'query' argument.")

    if not isinstance(arguments, dict):
        raise TypeError("Error: Invalid arguments. Expected a dictionary.")

    if not (query := arguments.get("query")):
        raise ValueError("Error: Missing 'query' argument.")

    return query, arguments.get("maxResults", MAX_RESULTS)


async def call_rag_web_browser(query: str, max_results: int) -> str:
    """Call the RAG Web Browser actor and return the results."""
    query_params = {"query": query, "maxResults": max_results}
    headers = {"Authorization": f"Bearer {APIFY_API_TOKEN}"}

    try:
        url = f"{ACTOR_BASE_URL}?{parse.urlencode(query_params)}"
        logger.info(f"Calling RAG Web Browser: {url}")

        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            response = await client.get(url, headers=headers)
            response_body = json.dumps(response.json())
            logger.info("Received response from RAG Web Browser: %s", response_body)
            return response_body
    except httpx.TimeoutException as e:
        raise TimeoutError(f"RAG Web Browser request timed out: {e}") from None
    except Exception as e:
        raise ValueError(f"Failed to call RAG Web Browser: {e}") from None


@server.call_tool()
async def handle_call_tool(name: str, arguments: dict | None) -> list[TextContent]:
    """Handle tool execution requests.

    Tools can modify server state and notify clients of changes.
    """
    try:
        query, max_results = handle_input_arguments(name, arguments)
    except Exception as e:
        logger.exception("Tool call failed")
        return [TextContent(type="text", text=f"Error: {e!s}")]

    try:
        response = await call_rag_web_browser(query, max_results)
        return [TextContent(type="text", text=response)]
    except Exception as e:
        logger.exception(e)
        return [TextContent(type="text", text=f"Error: {e!s}")]


async def main() -> None:
    """Start server."""
    logger.info("Starting RAG Web Browser server")
    try:
        from mcp.server.stdio import stdio_server

        async with stdio_server() as (read_stream, write_stream):
            logger.info("Server started")
            await server.run(read_stream, write_stream, server.create_initialization_options())

    except Exception:
        logger.exception("Server failed to start")
        raise


if __name__ == "__main__":
    try:
        asyncio.run(main())
        # asyncio.run(call_rag_web_browser("web browser for Anthropic", 1))  # noqa:ERA001
    except KeyboardInterrupt:
        logger.info("Server shutdown requested")
    except Exception:
        logger.exception("Server error")
        raise
