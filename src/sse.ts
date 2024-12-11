import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import express from 'express';

import { RagWebBrowserServer } from './server.js';

const server = new RagWebBrowserServer();

const app = express();

let transport: SSEServerTransport;

app.get('/sse', async (_req, res) => {
    console.log('Received connection'); // eslint-disable-line no-console
    transport = new SSEServerTransport('/message', res);
    await server.connect(transport);
});

app.post('/message', async (req, res) => {
    console.log('Received message'); // eslint-disable-line no-console
    await transport.handlePostMessage(req, res);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`); // eslint-disable-line no-console
});
