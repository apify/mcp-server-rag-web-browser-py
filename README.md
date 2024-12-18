# Model Context Protocol (MCP) Server for the RAG Web Browser Actor 🌐

Implementation of an MCP server for the [RAG Web Browser Actor](https://apify.com/apify/rag-web-browser).
This Actor serves as a web browser for large language models (LLMs) and RAG pipelines, similar to a web search in ChatGPT.

## 🔄 What is model context protocol?

The Model Context Protocol (MCP) enables AI applications (and AI agents), such as Claude Desktop, to connect to external tools and data sources.
MCP is an open protocol that enables secure, controlled interactions between AI applications, AI Agents, and local or remote resources.

## 🎯 What does this MCP server do?

The RAG Web Browser Actor allows an AI assistant to:
- Perform web search, scrape the top N URLs from the results, and return their cleaned content as Markdown
- Fetch a single URL and return its content as Markdown

## 🧱 Components

### Tools

- **search**: Query Google Search, scrape the top N URLs from the results, and returns their cleaned content as Markdown.
  - Arguments:
    - `query` (string, required): Search term or URL
    - `max_results` (number, optional): Maximum number of search results to scrape (default: 1)

### Prompts

- **search**: Search phrase or a URL at Google and return crawled web pages as text or Markdown
  - Arguments:
    - `query` (string, required): Search term or URL
    - `max_results` (number, optional): Maximum number of search results to scrape (default: 1)

### Resources

The server does not provide any resources and prompts.

## 🛠️ Configuration

### Prerequisites

- MacOS or Windows
- The latest version of Claude Desktop must be installed (or another MCP client)
- [Node.js](https://nodejs.org/en) (v18 or higher)
- [Apify API Token](https://docs.apify.com/platform/integrations/api#api-token) (`APIFY_API_TOKEN`)

### Install

Follow the steps below to set up and run the server on your local machine:
First, clone the repository using the following command:

```bash
git clone git@github.com:apify/mcp-server-rag-web-browser.git
```

Navigate to the project directory and install the required dependencies:

```bash
cd mcp-server-rag-web-browser
npm install
```

Before running the server, you need to build the project:

```bash
npm run build
```

#### Claude Desktop

Configure Claude Desktop to recognize the MCP server.

1. Open your Claude Desktop configuration and edit the following file:

   - On macOS: `~/Library/Application\ Support/Claude/claude_desktop_config.json`
   - On Windows: `%APPDATA%/Claude/claude_desktop_config.json`

    ```text
    "mcpServers": {
      "mcp-server-rag-web-browser": {
        "command": "npx",
        "args": [
          "/path/to/mcp-server-rag-web-browser/build/index.js",
        ]
        "env": {
           "APIFY-API-TOKEN": "your-apify-api-token"
        }
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
    What is an MCP server and how can it be used?
    What is an LLM, and what are the recent news updates?
    Find and analyze recent research papers about LLMs.
    ```

## 👷🏼 Development

### Simple local client (stdio)

To test the server locally, you can use `example_client_stdio.ts`:

```bash
node build/example_client_stdio.js
```

The script will start the MCP server, fetch available tools, and then call the `search` tool with a query.

### Chat local client (stdio)

To run simple chat client, you can use `example_chat_stdio.ts`:

```bash
node build/example_chat_stdio.js
```
Here you can interact with the server using the chat interface.

### Test Server-Sent Events (SSE) Transport

The SSE transport enables **server-to-client streaming** while using **HTTP POST requests** for client-to-server communication.

#### Step 1: Start the Server

Start the server with the following command:

```bash
node build/sse.js
```

The server will start and listen on `http://localhost:3001`.

#### Step 2: Connect to the SSE Server (Client)

To connect to the SSE server, use the following command (acting as the client):

```bash
curl -X GET http://localhost:3001/sse
```

Upon connection, you will receive a message containing the `sessionId`, for example:

```text
event: endpoint
data: /message?sessionId=7bd075c8-bbd1-4854-884c-e6c837148b7b
```

#### Step 3: Send a Message to the Server

You can send a message to the server by making a POST request with the `sessionId` and your query:

```bash
curl -X POST "http://localhost:3001/message?session_id=181c7a3d-01a9-498e-8e16-5d5878832cd7" -H "Content-Type: application/json" -d '{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "arguments": { "query": "recent news about LLMs" },
    "name": "search"
  }
}'
```

#### Step 4: Receive the Response

For the POST request, the server will respond with:

```text
Accepted
```

The server will then invoke the `search` tool using the provided query and stream the response back to the client via SSE:

```text
event: message
data: {"result":{"content":[{"type":"text","text":"[{\"searchResult\":{\"title\":\"Language models recent news\",\"description\":\"Amazon Launches New Generation of LLM Foundation Model...\"}}
```

### Debugging

Call the RAG Web Browser Actor to test it:

```bash
APIFY_API_TOKEN=your-apify-api-token node build/example_call_web_browser.js
````

Since MCP servers operate over standard input/output (stdio), debugging can be challenging.
For the best debugging experience, use the [MCP Inspector](https://github.com/modelcontextprotocol/inspector).

Build the mcp-server-rag-web-browser package:

```bash
npm run build
```

You can launch the MCP Inspector via [`npm`](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) with this command:

```bash
npx @modelcontextprotocol/inspector node ~/apify/mcp-server-rag-web-browser/build/index.js APIFY_API_TOKEN=your-apify-api-token
```

Upon launching, the Inspector will display a URL that you can access in your browser to begin debugging.
