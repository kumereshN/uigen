# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UIGen is an AI-powered React component generator with live preview. Users describe components in a chat interface, and the AI generates React code that renders in real-time in a virtual file system (no files written to disk).

## Commands

```bash
# Initial setup (install deps, generate Prisma client, run migrations)
npm run setup

# Development
npm run dev

# Run tests
npm test

# Run a single test file
npx vitest path/to/test.ts

# Lint
npm run lint

# Reset database
npm run db:reset
```

## Architecture

### Virtual File System

The core abstraction is `VirtualFileSystem` (`src/lib/file-system.ts`) - an in-memory file system that stores generated React components. It supports file/directory CRUD operations, serialization for persistence, and text editor commands (view, create, str_replace, insert).

### AI Integration

- Chat API route at `src/app/api/chat/route.ts` uses Vercel AI SDK with Claude
- Two AI tools are exposed to the model:
  - `str_replace_editor` (`src/lib/tools/str-replace.ts`): File creation and text manipulation
  - `file_manager` (`src/lib/tools/file-manager.ts`): Rename and delete operations
- Mock provider in `src/lib/provider.ts` works when no API key is set
- System prompt in `src/lib/prompts/generation.tsx` instructs the AI to create React components with Tailwind CSS

### Preview System

The JSX transformer (`src/lib/transform/jsx-transformer.ts`) handles:
- Babel transformation of JSX/TSX to browser-compatible JS
- Creating blob URLs for dynamic imports
- Generating import maps that resolve local files and third-party packages via esm.sh
- Building the preview HTML document with error boundary

### React Contexts

- `FileSystemProvider` (`src/lib/contexts/file-system-context.tsx`): Manages virtual file system state, handles tool calls from AI
- `ChatProvider` (`src/lib/contexts/chat-context.tsx`): Manages chat messages and AI interactions

### Authentication

- JWT-based sessions using jose library (`src/lib/auth.ts`)
- Optional - app works for anonymous users
- Authenticated users can persist projects to SQLite via Prisma

### Database

The database schema is defined in `prisma/schema.prisma`. Reference it anytime you need to understand the structure of data stored in the database.

### Key Conventions

- Generated components must have `/App.jsx` as the entry point
- All local imports use `@/` alias (e.g., `@/components/Button`)
- Styling uses Tailwind CSS, not inline styles
- Files are stored in a virtual root `/` directory
- Use comments sparingly; only comment complex code
