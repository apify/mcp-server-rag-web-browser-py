# Model Context Protocol (MCP) Server for the RAG Web Browser Actor 🌐

Implementation of an MCP server for the [RAG Web Browser Actor](https://apify.com/apify/rag-web-browser).
This Actor serves as a web browser for large language models (LLMs) and RAG pipelines, similar to a web search in ChatGPT. 

## 🔄 What is model context protocol?

The Model Context Protocol (MCP) enables AI applications (and AI agents), such as Claude Desktop, to connect to external tools and data sources.
MCP is an open protocol that enables secure, controlled interactions between AI applications and local or remote resources.

## 🎯 What does this MCP server do?

The RAG Web Browser Actor allows an AI assistant to:
- Perform web search, scrape the top N URLs from the results, and return their cleaned content as Markdown
- Fetch single URL and return content as Markdown

## 🧱 Components

### Tools

The server implements web a browser tool:
- `web-browser`: query Google Search, scrape the top N URLs from the results, and returns their cleaned content as Markdown.
  - Parameters: 
    - `query`: Search term or URL
    - `max_results`: Maximum number of search results to scrape

### Resources and Prompts

The server does not provide any resources and prompts.

## 🛠️ Configuration

### Prerequisites

- MacOS or Windows
- The latest version of the Claude Desktop installed
- **uvx** 2.0.0 or higher (`uvx --version` to check)
- [Apify API Token](https://docs.apify.com/platform/integrations/api#api-token) (`APIFY_API_TOKEN`) 

### Install

#### Claude Desktop

Configure Claude Desktop to recognize the MCP server.

1. Open your Claude Desktop configuration and edit the following file:

   - On MacOS: `~/Library/Application\ Support/Claude/claude_desktop_config.json`
   - On Windows: `%APPDATA%/Claude/claude_desktop_config.json`

```text
"mcpServers": {
  "mcp-server-rag-web-browser": {
    "command": "uvx",
    "args": [
      "mcp-server-rag-web-browser"
    ]
  }
}
```

2. Restart Claude Desktop  
- Fully quit Claude Desktop (ensure it’s not just minimized or closed).  
- Restart Claude Desktop.  
- Look for the 🔌 icon to confirm that the Exa server is connected.  

3. Examples  

You can ask Claude to perform web searches, such as:  
```text
What is an MPC server and how can it be used?  
What is an LLM, and what are the recent news updates?  
Find and analyze recent research papers about LLMs.  
```  

## Development

### Local Development

If you're working on an unpublished server, you can access the local server via the `uv` command:
```text
"mcpServers": {
    "mcp-server-rag-web-browser": {
      "command": "uv",
      "args": [
        "--directory",
        "~/apify/mcp-server-rag-web-browser-py",
        "run",
        "mcp-server-rag-web-browser"
      ]
    }
}
```

### Local client

To test the server locally, you can use `example_client.py`:

```bash
python example_client.py
```

The script will start the MCP server, fetch available tools, and then call the web-browser tool with a query.

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

Since MCP servers operate over standard input/output (stdio), debugging can be challenging. 
For the best debugging experience, it is recommended to use the [MCP Inspector](https://github.com/modelcontextprotocol/inspector).

You can launch the MCP Inspector via [`npm`](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) with this command:

```bash
npx @modelcontextprotocol/inspector uv --directory ~/apify/mcp-server-rag-web-browser-py run mcp-server-rag-web-browser
```

Upon launching, the Inspector will display a URL that you can access in your browser to begin debugging.