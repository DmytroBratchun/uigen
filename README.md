# UIGen

AI-powered React component generator with live preview. Describe a component in plain English, and Claude generates the code — rendered instantly in a sandboxed iframe, no files written to disk.

## Prerequisites

- Node.js 18+
- npm
- Anthropic API key (optional — falls back to static mock output without one)

## Setup

1. Copy the environment file and add your API key:

```bash
cp .env.example .env
```

Then edit `.env`:

```
ANTHROPIC_API_KEY=your-api-key-here
```

Without an API key the app still runs, returning static components instead of AI-generated ones.

2. Install dependencies and initialize the database:

```bash
npm run setup
```

This installs all dependencies, generates the Prisma client, and runs SQLite migrations.

## Running the Application

```bash
npm run dev        # Start dev server (http://localhost:3000)
npm run build      # Production build
npm run test       # Run Vitest test suite
npm run lint       # ESLint
npm run db:reset   # Reset the SQLite database
```

## Usage

1. Sign up or continue as an anonymous user
2. Describe the React component you want in the chat
3. Watch the component render live in the preview pane
4. Switch to Code view to inspect or edit the generated files
5. Keep chatting to iterate and refine

## How It Works

1. Your message is sent to `POST /api/chat`, which streams a response via Vercel AI SDK
2. Claude (Haiku) calls two tools during generation: `str_replace_editor` (create/modify files) and `file_manager` (rename/delete)
3. Tool calls mutate an in-memory `VirtualFileSystem` — nothing is written to disk
4. The updated file system is streamed back to the client
5. An in-browser Babel pipeline compiles the JSX and injects it into a sandboxed iframe
6. Authenticated users get their project state (messages + files) persisted to SQLite

## Features

- AI-powered component generation using Claude Haiku
- Live preview with sandboxed iframe rendering
- Virtual file system — no disk I/O
- Client-side JSX compilation via Babel Standalone
- Monaco-based code editor with syntax highlighting
- Project persistence for registered users
- Export generated code

## Tech Stack

- **Framework:** Next.js 15 (App Router) + React 19
- **Language:** TypeScript
- **AI:** Anthropic Claude Haiku via Vercel AI SDK
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Editor:** Monaco (`@monaco-editor/react`)
- **Database:** SQLite via Prisma ORM
- **Auth:** JWT (jose) + bcrypt, HTTPOnly cookies
- **Testing:** Vitest + React Testing Library
