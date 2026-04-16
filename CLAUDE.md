# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run setup          # Install deps, generate Prisma client, run migrations (first time)
npm run dev            # Start Next.js dev server with Turbopack
npm run build          # Production build
npm run lint           # ESLint via Next.js
npm run test           # Vitest test suite
npm run db:reset       # Reset SQLite database
```

Set `ANTHROPIC_API_KEY` in `.env` to enable real AI generation. Without it, the app falls back to a `MockLanguageModel` that returns static components.

## Architecture

UIGen is a Next.js 15 App Router application that lets users describe React components in natural language, with Claude AI generating the code and an in-browser preview rendering it live.

### Key Data Flow

1. User sends a message in the chat UI
2. `POST /api/chat` streams a response using Vercel AI SDK (`streamText`) with Claude Haiku
3. Claude uses two tools during generation:
   - `str_replace_editor` — create/view/modify files (view, create, str_replace, insert operations)
   - `file_manager` — rename/delete files and directories
4. Tool calls mutate a `VirtualFileSystem` (in-memory, no disk I/O)
5. The updated file system is serialized and sent back to the client
6. The preview iframe runs Babel Standalone to compile JSX client-side and renders the component
7. If the user is authenticated, the project state (messages + files) is persisted to SQLite via Prisma

### Core Abstractions

**VirtualFileSystem** (`/lib/file-system.ts`) — In-memory file tree shared between the AI tools on the server and the preview/editor on the client. Fully serializable for transport and persistence.

**JSX Transformer** (`/lib/transform/jsx-transformer.ts`) — Runs entirely in the browser using `@babel/standalone`. Compiles JSX, creates dynamic import maps, handles CSS/Tailwind imports, and produces an HTML blob injected into a sandboxed iframe.

**AI Provider** (`/lib/provider.ts`) — Wraps `@ai-sdk/anthropic`. Returns a `MockLanguageModel` when `ANTHROPIC_API_KEY` is absent so the app stays functional without credentials.

**Contexts** — Two React contexts wire the UI together:
- `chat-context.tsx` — Manages messages and drives the Vercel AI SDK `useChat` hook
- `file-system-context.tsx` — Holds the `VirtualFileSystem` instance; updated from streaming tool-call results

### Directory Layout

```
src/
  app/           # Next.js App Router pages and API routes
    api/chat/    # Streaming chat endpoint (AI + tools)
  actions/       # Server actions: auth (signUp/signIn/signOut/getUser) and projects CRUD
  components/
    chat/        # Chat UI (message list, input, markdown rendering)
    editor/      # File tree + Monaco code editor
    preview/     # Sandboxed iframe preview
    auth/        # Sign-in / sign-up forms
    ui/          # shadcn/ui Radix primitives
  lib/
    auth.ts      # JWT session handling (jose, HTTPOnly cookies, 7-day expiry)
    file-system.ts
    provider.ts
    prompts/     # System prompt for component generation
    transform/   # Babel JSX compiler pipeline
prisma/
  schema.prisma  # SQLite schema: User, Project
```

### Stack

- **Framework:** Next.js 15 with App Router and React 19
- **AI:** Vercel AI SDK (`ai`) + `@ai-sdk/anthropic` (Claude Haiku)
- **Styling:** Tailwind CSS v4 + shadcn/ui (neutral/New York theme, Lucide icons)
- **Editor:** Monaco (`@monaco-editor/react`)
- **Database:** SQLite via Prisma ORM
- **Auth:** JWT (jose) + bcrypt, stored in HTTPOnly cookies
- **Testing:** Vitest + jsdom + React Testing Library
