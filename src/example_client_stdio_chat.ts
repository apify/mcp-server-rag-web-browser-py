/* eslint-disable no-console */

import { Anthropic } from '@anthropic-ai/sdk';
import { Message, TextBlock } from '@anthropic-ai/sdk/resources/messages';
import { countTokens } from '@anthropic-ai/tokenizer';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { CallToolResultSchema } from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import * as readline from 'readline';

dotenv.config({ path: '../.env' });

const CLAUDE_MODEL = 'claude-3-5-sonnet-20241022';
const LIMIT_TOOL_RESPONSE_TOKENS = 150_000;
const DEBUG = true;

dotenv.config(); // Load environment variables from .env

export type Tool = {
    name: string;
    description: string | undefined;
    input_schema: any;
}

class MCPClient {
    private anthropic: Anthropic;
    private client = new Client(
        {
            name: 'example-client',
            version: '1.0.0',
        },
        {
            capabilities: {}, // Optional capabilities
        },
    );

    private tools: Tool[] = [];

    constructor() {
        this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    }

    async connectToServer(serverScriptPath: string) {
        const transport = new StdioClientTransport({
            command: 'node', // Executable
            args: [
                serverScriptPath,
                `APIFY_API_TOKEN=${process.env.APIFY_API_TOKEN}`,
            ],
        });

        await this.client.connect(transport);
        const response = await this.client.listTools();

        this.tools = response.tools.map((x) => ({
            name: x.name,
            description: x.description,
            input_schema: x.inputSchema,
        }));
        console.log('Connected to server with tools:', this.tools);
    }

    async processMsg(response: any) {
        const finalText: string[] = [];
        const messages: any[] = [];

        for (const content of response.content) {
            if (content.type === 'text') {
                finalText.push(content.text);
            } else if (content.type === 'tool_use') {
                const params = { name: content.name, arguments: content.input };
                console.log(`Calling tool: ${JSON.stringify(params)}`);
                const results = await this.client.callTool(params, CallToolResultSchema);
                finalText.push(`[Calling tool: ${params.name} with arguments ${params.arguments}`);
                console.log('Received tool results');

                if (content.text) {
                    messages.push({ role: 'assistant', content: content.text });
                }

                const r = results.content as [];
                let txt = r.join('\n');
                const tokens = countTokens(txt);
                if (tokens > LIMIT_TOOL_RESPONSE_TOKENS) {
                    txt = txt.substring(0, LIMIT_TOOL_RESPONSE_TOKENS);
                }
                messages.push({ role: 'user', content: results.content });

                console.log('Message for Claude', messages);

                // Get next response from Claude
                const nextResponse: Message = await this.anthropic.messages.create({
                    model: CLAUDE_MODEL,
                    max_tokens: 1000,
                    messages,
                    tools: this.tools,
                });
                const textBlock = nextResponse.content[0] as TextBlock;
                finalText.push(textBlock.text);
            }
        }

        return finalText.join('\n');
    }

    async processQuery(query: string): Promise<string> {
        const msg: Message = await this.anthropic.messages.create({
            model: CLAUDE_MODEL,
            max_tokens: 1024,
            messages: [{ role: 'user', content: query }],
            tools: this.tools,
        });
        console.log('Received response from Claude:', msg);

        return await this.processMsg(msg);
    }

    /**
     * Create a chat loop that reads user input from the console and sends it to the server for processing.
     */
    async chatLoop() {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: 'You: ',
        });

        console.log("MCP Client Started!\nType your queries or 'quit|q|exit' to exit.");
        rl.prompt();

        rl.on('line', async (input) => {
            const v = input.trim().toLowerCase();
            if (v === 'quit' || v === 'q' || v === 'exit') {
                rl.close();
                return;
            }
            try {
                const response = await this.processQuery(input);
                console.log('Claude:', response);
            } catch (error) {
                console.error('Error processing query:', error);
            }
            rl.prompt();
        });
    }
}

async function main() {
    const client = new MCPClient();

    if (process.argv.length < 3) {
        if (DEBUG) {
            process.argv.push('../mcp-server-rag-web-browser/build/index.js');
        } else {
            console.error('Usage: node <path_to_server_script>');
            process.exit(1);
        }
    }

    console.log('Starting MCP Client...', process.argv);
    try {
        await client.connectToServer(process.argv[2]);
        await client.chatLoop();
    } catch (error) {
        console.error('Error:', error);
    }
}

main().catch(console.error);
