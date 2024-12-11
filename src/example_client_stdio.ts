/* eslint-disable no-console */
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { ListToolsResultSchema, CallToolResultSchema } from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

// Create server parameters for stdio connection
const transport = new StdioClientTransport({
    command: 'node', // Executable
    args: [
        '~/apify/mcp-server-rag-web-browser/build/index.js',
        `APIFY_API_TOKEN=${process.env.APIFY_API_TOKEN}`,
    ],
});

// Create a new client instance
const client = new Client(
    {
        name: 'example-client',
        version: '1.0.0',
    },
    {
        capabilities: {}, // Optional capabilities
    },
);

// Main function to run the example client
async function run() {
    try {
        // Connect to the MCP server
        await client.connect(transport);

        // List available tools
        const tools = await client.request(
            { method: 'tools/list' },
            ListToolsResultSchema,
        );
        console.log('Available tools:', tools);

        // Call a tool
        console.log('Calling rag web browser ...');
        const result = await client.request(
            {
                method: 'tools/call',
                params: {
                    name: 'search',
                    arguments: { query: 'web browser for Anthropic' },
                },
            },
            CallToolResultSchema,
        );
        console.log('Tool result:', JSON.stringify(result));
    } catch (error) {
        console.error('Error:', error);
    }
}

// Execute the main function
await run();

// 10000  curl -X POST "http://localhost:3001/message?session_id=24676de7-e486-4777-a85c-cf8095c8780b" -H
// "Content-Type: application/json" -d '
// {\n    "jsonrpc": "2.0",\n    "id": 1,\n    "method": "tools/call",\n
// "params": {\n      "arguments": {\n        "url": "https://apify.com"\n      },\n
// "name": "fetch_url_content"\n    }\n  }'
