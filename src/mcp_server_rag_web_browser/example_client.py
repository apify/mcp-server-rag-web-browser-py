from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

# Create server parameters for stdio connection
server_params = StdioServerParameters(
    command="python",  # Executable
    args=["server.py"],  # Optional command line arguments
    env=None,  # Optional environment variables
)


async def run() -> None:
    """Run the example client."""
    async with stdio_client(server_params) as (read, write), ClientSession(read, write) as session:
        # Initialize the connection
        assert isinstance(session, ClientSession)  # noqa:S101
        await session.initialize()

        # List available tools
        tools = await session.list_tools()
        print("Available tools:", tools)  # noqa:T201

        # Call a tool
        print("Calling tool...")  # noqa:T201
        result = await session.call_tool("web-browser", arguments={"query": "web browser for Anthropic"})
        print("Tool result:", result)  # noqa:T201


if __name__ == "__main__":
    import asyncio

    asyncio.run(run())
