# AGENTS.md - Hote Exception V2

## Project Overview
- **Framework**: Angular 20 (standalone components)
- **Build Tool**: Angular CLI with @angular/build
- **Styling**: Tailwind CSS
- **Path Aliases**: `@/*` maps to project root

## Build / Run Commands

```bash
# Install dependencies
npm install

# Development server (default port 4200)
npm run dev
# or: ng serve --host 0.0.0.0

# Production build
npm run build

# Preview production build
npm run preview
```

**Environment Variables:**
- Create `.env.local` with `GEMINI_API_KEY` for AI features
- Supabase credentials: Set in `src/supabase.config.ts` or via localStorage

## Code Style Guidelines

### General Conventions
- Use **standalone components** (Angular 20 pattern)
- Use **signals** for reactive state (`input()`, `signal()`, `computed()`)
- Use `inject()` for dependency injection
- Apply `ChangeDetectionStrategy.OnPush` to all components

### Naming Conventions
- **Components**: `*.component.ts` suffix, kebab-case selectors
- **Services**: `*.service.ts` suffix, PascalCase class names
- **Files/Folders**: kebab-case (e.g., `my-file.component.ts`)

### Imports
Order imports by type with blank lines between groups:
```typescript
// Angular core
import { Component, signal, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

// External libraries
import { jsPDF } from 'jspdf';

// Internal services/components
import { SupabaseService } from '@services/supabase.service';

// Types
import type { User } from '@types/user';
```

### Formatting
- 2 spaces for indentation, max line length: 120
- Single quotes for strings, always use semicolons
- Trailing commas in multi-line objects/arrays

### TypeScript
- Use interfaces for data types, avoid `any`
- Use `readonly` for immutable arrays/objects

### Templates
- Inline templates for simple components, `templateUrl` for complex ones
- Prefer Tailwind utility classes over custom CSS

### Error Handling
- Use try/catch for async operations
- Return structured error objects: `{ error: { message: string, code?: string } }`
- Handle missing configuration gracefully (see `supabase.service.ts`)
- Display user-friendly error messages; avoid exposing internal details

### Component Structure
- Standalone components with explicit imports
- `signal()` for mutable state, `input()` for parent-bound inputs
- `computed()` for derived state, keep template logic minimal

### Service Structure
- Use `inject()` for dependency injection
- Mark services with `providedIn: 'root'` for singleton behavior
- Return typed Observables or Promises from async methods

## Project Structure

```
src/
├── app.component.ts          # Root component
├── main.ts                   # Bootstrap
├── supabase.config.ts        # Supabase credentials
├── services/                # Core services
├── saas/                    # Main SaaS application
│   ├── views/               # Page-level components
│   ├── features/            # Domain features (finance, legal, marketing, operations, experience)
│   └── components/          # Shared components
├── components/              # Landing/Evaluation components
├── state/                   # Global state (stores)
└── pipes/                   # Custom pipes
```

## Best Practices

1. Group features by domain under `src/saas/features/`
2. Use Angular's standalone component lazy loading for routes
3. Use `TranslationService` and `TranslatePipe` for i18n
4. Prefer signals over RxJS `Subject`/`BehaviorSubject` for component state

## External Dependencies
- **Supabase**: Authentication and database
- **FullCalendar**: Calendar components (`@fullcalendar/*`)
- **Chart.js**: Charts via `ng2-charts`
- **Marked**: Markdown parsing
- **jsPDF**: PDF generation
- **Tailwind CSS**: Styling framework

## Testing
No test framework is currently configured. To add testing:
```bash
npm install --save-dev jest @types/jest jest-preset-angular
```
