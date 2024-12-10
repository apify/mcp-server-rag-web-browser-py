"""This is an example of calling the RAG Web Browser actor."""

import json
import os
import urllib.parse
import urllib.request

from dotenv import load_dotenv

load_dotenv()

QUERY = "MCP Server for Anthropic"
MAX_RESULTS = 1  # Limit the number of results to decrease response size, limit 25KB
OUTPUT_FORMATS = "markdown"  # Default output format

ACTOR_BASE_URL = "https://rag-web-browser.apify.actor/search"  # Base URL from OpenAPI schema

# Lambda function environment variable
APIFY_API_TOKEN = os.getenv("APIFY_API_TOKEN")


query_params = {"query": QUERY, "maxResults": MAX_RESULTS}
headers = {"Authorization": f"Bearer {APIFY_API_TOKEN}"}

try:
    url = f"{ACTOR_BASE_URL}?{urllib.parse.urlencode(query_params)}"
    print(f"GET request to {url}")  # noqa:T201

    req = urllib.request.Request(url, headers=headers, method="GET")  # noqa: S310
    with urllib.request.urlopen(req) as response:  # noqa: S310
        response_body = response.read().decode("utf-8")
        print("Received response from RAG Web Browser", response_body)  # noqa:T201
except Exception as e:
    print("Error occurred", e)  # noqa:T201

response = json.loads(response_body)
print("Response: ", response)  # noqa:T201
