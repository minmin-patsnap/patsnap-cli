# @patsnap-ai/cli

Patsnap CLI — manage authentication, API keys, and MCP server configuration for AI clients.

## Installation

```bash
npm install -g @patsnap-ai/cli
```

Requires Node.js 20+.

## Commands

### Auth

```bash
patsnap login       # Log in to Patsnap
patsnap logout      # Log out
patsnap whoami      # Show current logged-in user
```

### API Keys

```bash
patsnap apikey list    # List your API keys
patsnap apikey create  # Create a new API key
```

### MCP Servers

```bash
patsnap mcp search [term]        # Search available Patsnap MCP servers
patsnap mcp add                  # Add Patsnap MCP servers to an AI client
patsnap mcp remove               # Remove Patsnap MCP servers from an AI client
patsnap mcp list [-c <client>]   # List installed Patsnap MCP servers
patsnap mcp get <name>           # Show details for a Patsnap MCP server
patsnap mcp update               # Update API key for installed servers
```

## Global Options

```bash
--verbose   Show verbose logs
--debug     Show debug logs
--json      Output as JSON
--table     Output as table
```
