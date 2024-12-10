# Model Context Protocol (MCP) Server for the RAG Web Browser Actor 🌐

Implementation of an MCP server for the [RAG Web Browser Actor](https://apify.com/apify/rag-web-browser).
This Actor serves as a web browser for large language models (LLMs) and RAG pipelines, similar to a web search in ChatGPT. 

## 🔄 What is model context protocol?

The Model Context Protocol (MCP) allows AI applications (and AI agents), such as Claude Desktop, to connect to external tools and data sources.
MCP is an open protocol that enables secure, controlled interactions between AI applications and local or remote resources

## 🎯 What does this MCP server do?

The RAG Web Browser Actor allows AI assistant:
- Perform web search, scrape the top N URLs from the results, and return their cleaned content as Markdown
- Return the cleaned content of a URL as Markdown

## 🧱 Components

### Tools

The server implements web browser tool:
- `web-browser`: query Google Search, scrape the top N URLs from the results, and returns their cleaned content as Markdown.
  - Parameters: 
    - `query`: Search term or URL
    - `max_results`: Maximum number of search results to scrape

### Resources and Prompts

The server does not provide any resources and prompts.

## 🛠️ Configuration

## Prerequisites

- macOS or Windows
- The latest version of Claude Desktop installed
- **uvx** 2.0.0 or higher (`uvx --version` to check)
- [Apify API Token](https://docs.apify.com/platform/integrations/api#api-token) (`APIFY_API_TOKEN`) 

## Quickstart

### Install

#### Claude Desktop

On MacOS: `~/Library/Application\ Support/Claude/claude_desktop_config.json`
On Windows: `%APPDATA%/Claude/claude_desktop_config.json`

<details>
  <summary>Published Servers Configuration</summary>
  ```
  "mcpServers": {
    "mcp-server-rag-web-browser": {
      "command": "uvx",
      "args": [
        "mcp-server-rag-web-browser"
      ]
    }
  }
  ```
</details>

## Development

### Local Development

If you're working on the yet unpublished server, you can access the local server via the `uv` command:
"mcp-server-rag-web-browser": {
"command": "uv",
"args": [
"--directory",
"~/apify/mcp-server-rag-web-browser",
"run",
"mcp-server-rag-web-browser"

<details>
  <summary>Published Servers Configuration</summary>
  ```
  "mcpServers": {
    "mcp-server-rag-web-browser": {
      "command": "uv",
      "args": [
        "--directory",
        "~/apify/mcp-server-rag-web-browser",
        "run",
        "mcp-server-rag-web-browser"
      ]
    }
  }
  ```
</details>

### Building and Publishing


To prepare the package for distribution:

1. Sync dependencies and update lockfile:
```bash
uv sync
```

2. Build package distributions:
```bash
uv build
```

This will create source and wheel distributions in the `dist/` directory.

3. Publish to PyPI:
```bash
uv publish
```

Note: You'll need to set PyPI credentials via environment variables or command flags:
- Token: `--token` or `UV_PUBLISH_TOKEN`
- Or username/password: `--username`/`UV_PUBLISH_USERNAME` and `--password`/`UV_PUBLISH_PASSWORD`

### Debugging

Since MCP servers run over stdio, debugging can be challenging. For the best debugging
experience it is recommend to use the [MCP Inspector](https://github.com/modelcontextprotocol/inspector).

You can launch the MCP Inspector via [`npm`](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) with this command:

```bash
npx @modelcontextprotocol/inspector uv --directory /home/jirka/apify/mcp-server-rag-web-browser run mcp-server-rag-web-browser
```

Upon launching, the Inspector will display a URL that you can access in your browser to begin debugging.