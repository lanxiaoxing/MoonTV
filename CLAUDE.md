# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Core Development:**
- `pnpm dev` - Start development server (includes config generation and runs on 0.0.0.0)
- `pnpm build` - Build for production (includes config generation)
- `pnpm start` - Start production server
- `pnpm pages:build` - Build for Cloudflare Pages deployment

**Code Quality:**
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint issues and format code
- `pnpm lint:strict` - Strict linting with zero warnings
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting

**Testing:**
- `pnpm test` - Run Jest tests
- `pnpm test:watch` - Run tests in watch mode

**Config Generation:**
- `pnpm gen:runtime` - Generate runtime config from config.json
- `pnpm gen:manifest` - Generate PWA manifest

## Architecture Overview

**MoonTV** is a Next.js 14-based video streaming aggregator that searches multiple video sources and provides a unified viewing experience.

### Core Architecture Patterns

**Configuration System:**
- `config.json` - Main configuration file defining video sources (API sites)
- Runtime config generation via `scripts/convert-config.js` and `scripts/generate-manifest.js`
- Dynamic config loading in `src/lib/config.ts` with support for both file-based and database-based configurations
- Environment-based overrides for deployment flexibility

**Multi-Storage Backend:**
- `localstorage` - Browser-based storage (default)
- `redis` - Redis backend for multi-user support with user accounts
- `d1` - Cloudflare D1 database support
- Storage abstraction via `IStorage` interface in `src/lib/types.ts`

**Authentication & Middleware:**
- Password-based authentication with optional user registration
- JWT-style signature verification for non-localStorage modes
- Request middleware in `src/middleware.ts` handles auth logic
- Auth utilities in `src/lib/auth.ts`

**API Integration:**
- Apple CMS V10 API format support for video sources
- Douban integration for movie metadata
- Search aggregation across multiple sources with configurable page limits
- API configuration in `src/lib/config.ts` with caching support

### Key Components Structure

**Pages & Routing (App Router):**
- `/` - Home page with search and continue watching
- `/search` - Search results page
- `/play` - Video player page  
- `/douban` - Douban movie catalog
- `/admin` - Admin configuration panel (Redis/D1 deployments only)
- `/login` - Authentication page

**Core Components:**
- `VideoCard` - Video thumbnail and metadata display
- `EpisodeSelector` - Episode selection interface
- `ContinueWatching` - Recently watched content carousel
- `MobileBottomNav` & `Sidebar` - Responsive navigation
- Video player integration with ArtPlayer and HLS.js

**Database Schema (D1/Redis):**
- `users` - User accounts and passwords
- `play_records` - Viewing progress and history
- `favorites` - User favorites
- `search_history` - Search query history
- `admin_config` - Dynamic configuration storage

### Environment Variables

**Required for Redis/D1 deployments:**
- `USERNAME` - Admin account username
- `PASSWORD` - Admin password (or site password for localStorage)
- `REDIS_URL` - Redis connection string (Redis mode)
- `NEXT_PUBLIC_STORAGE_TYPE` - Storage backend ('localstorage'|'redis'|'d1')

**Optional Configuration:**
- `SITE_NAME` - Site name (default: 'MoonTV')
- `ANNOUNCEMENT` - Site announcement text
- `NEXT_PUBLIC_ENABLE_REGISTER` - Allow user registration ('true'|'false')
- `NEXT_PUBLIC_SEARCH_MAX_PAGE` - Max search pages (1-50, default: 5)
- `NEXT_PUBLIC_IMAGE_PROXY` - Image proxy URL prefix

### Development Notes

**Source Management:**
- Video sources are defined in `config.json` following Apple CMS V10 API format
- Each source requires `api` URL and `name`, optional `detail` URL for episode scraping
- Sources can be dynamically managed via admin panel in database deployments

**PWA Features:**
- Progressive Web App support with next-pwa
- Service worker for offline functionality
- App manifest generation for installable experience

**Styling:**
- Tailwind CSS with custom theme extensions
- Dark mode support via next-themes
- Responsive design with mobile-first approach
- Custom animations and transitions defined in tailwind.config.ts

**Security Considerations:**
- Authentication middleware protects all routes except public assets
- HMAC signature verification for API requests
- Environment variable-based secrets management
- No sensitive data in client-side code