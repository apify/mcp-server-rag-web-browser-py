/* eslint-disable no-console */
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config({ path: '../.env' });

const QUERY = 'MCP Server for Anthropic';
const MAX_RESULTS = 1; // Limit the number of results to decrease response size
const ACTOR_BASE_URL = 'https://rag-web-browser.apify.actor/search'; // Base URL from OpenAPI schema

const { APIFY_API_TOKEN } = process.env;

if (!APIFY_API_TOKEN) {
    throw new Error('APIFY_API_TOKEN environment variable is not set.');
}

const queryParams = new URLSearchParams({
    query: QUERY,
    maxResults: MAX_RESULTS.toString(),
});

const headers = {
    Authorization: `Bearer ${APIFY_API_TOKEN}`,
};

// eslint-disable-next-line no-void
void (async () => {
    const url = `${ACTOR_BASE_URL}?${queryParams.toString()}`;
    console.info(`GET request to ${url}`);

    try {
        const response = await fetch(url, { method: 'GET', headers });

        if (!response.ok) {
            console.log(`Error: Failed to fetch data: ${response.statusText}`);
        }

        const responseBody = await response.json();
        console.info('Received response from RAG Web Browser:', responseBody);

        // Optional: Further process or display the response
        console.log('Response:', responseBody);
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        console.error('Error occurred:', error.message);
    }
})();
