# Barnfria bokklubben

A full-stack book club application built with Next.js 15, featuring user authentication, role-based access control, book suggestions with voting, and an admin dashboard.

## Live
https://book-club-nextjs-mocha.vercel.app

### Home
<img width="377" height="837" alt="image" src="https://github.com/user-attachments/assets/ab980bee-a598-4f4f-9964-90254dfe15ab" />

### Menu
<img width="380" height="405" alt="image" src="https://github.com/user-attachments/assets/98836087-f350-4b61-86e8-a4966ddd7d37" />

### Bokträffar
<img width="386" height="831" alt="image" src="https://github.com/user-attachments/assets/847d8bc3-f9a7-4740-94ac-7d1c7a45d2c5" />

### Lästa böcker
<img width="382" height="827" alt="image" src="https://github.com/user-attachments/assets/7772e319-e4e0-4426-9405-4ce4711e36f7" />

<img width="319" height="664" alt="image" src="https://github.com/user-attachments/assets/aded0c5b-bc9b-4f24-ba24-6ba1351978f8" />

### Bokförslag
<img width="383" height="770" alt="image" src="https://github.com/user-attachments/assets/25e3178d-49ee-47ff-ad8c-43bfd124104b" />

<img width="383" height="726" alt="image" src="https://github.com/user-attachments/assets/b9cf885b-0216-464b-a154-2b629f075a24" />

<img width="381" height="831" alt="image" src="https://github.com/user-attachments/assets/b170e033-ed32-4c6c-9178-22914ad150a9" />

### Rösta
<img width="305" height="663" alt="image" src="https://github.com/user-attachments/assets/b128ad3b-fa41-40c3-91da-9a9a647ea2bf" />

<img width="380" height="828" alt="image" src="https://github.com/user-attachments/assets/1ec41cac-ba64-45d7-abe3-dc2a01bc6327" />

### Admin
Admin - Meny
<img width="382" height="353" alt="image" src="https://github.com/user-attachments/assets/ac189300-33e2-4f57-a26f-d329ae5d895f" />

Admin - Användarhantering
<img width="294" height="664" alt="image" src="https://github.com/user-attachments/assets/567bd156-3328-4cd5-b29c-4c72362b19d1" />

Admin - Bokförslag
<img width="380" height="840" alt="image" src="https://github.com/user-attachments/assets/cc261f95-47cf-4c14-9264-fd742ae5d928" />

Admin - Möten
<img width="382" height="691" alt="image" src="https://github.com/user-attachments/assets/e65e2bf6-3360-4dcd-a024-467cb2f5d119" />

<img width="387" height="833" alt="image" src="https://github.com/user-attachments/assets/92e08aaa-fd01-4840-843a-62223877c9ea" />

## Features

### User Management
- **Google OAuth Authentication** via NextAuth v5
- **Role-Based Access Control**: Three roles (pending, user, admin)
- **Approval System**: New users require admin approval before accessing the site
- **Auto-Admin Assignment**: First user with configured email becomes admin automatically
- **Database Sessions**: Immediate access revocation when users are rejected

### Book Suggestions
- **Google Books Integration**: Search and add books with auto-populated metadata
- **Duplicate Detection**: Prevents suggesting books already in the system (checks ISBN, Google Books ID, + and title + author)
- **Fuzzy Search**: Client-side typo-tolerant search for read books using fuse.js (threshold: 0.4)
  - Searches across title, author, and description fields
  - Handles typos and partial matches (e.g., "Hary Poter" finds "Harry Potter")
  - Secure input validation (max 100 chars, trimmed, sanitized)
  - Search triggered on form submit (not real-time)
- **Expandable Descriptions**: "Läs mer" (Read more) buttons for long book descriptions
- **Collaborative Suggestions**: Approved users can suggest books
- **Voting System**: One vote per user per suggestion with reset functionality
- **Optimistic UI**: Instant feedback when voting
- **Status Management**: Track suggestions as pending, approved, currently reading, or rejected
- **Ownership Controls**: Users can edit/delete their own suggestions, admins have full control
- **Auto-refresh**: Real-time updates of voting and suggestion lists

### Admin Dashboard
- **User Management**: Approve/reject users, change roles, search and filter
- **Suggestion Management**: Approve/reject suggestions, change status, delete any suggestion
- **Meeting Management**: Full CRUD operations for book club meetings
- **Swedish Language UI**: All interface text in Swedish

### Security & Error Handling
- **Layered Validation**: Zod for API request validation, and Mongoose for strict schema enforcement
- **XSS Protection**: Server-side sanitization of incoming HTML content
- **Secure JWT Sessions**: Session tokens validated against the database on each request
- **Authorization Enforcement**: Server-side permission checks across all mutations and API routes
- **Rate Limiting**: Endpoint protection against request flooding and abuse
- **Custom Error Handling**: User-friendly 404 pages and error boundaries
- **WCAG Compliant**: Accessibility features throughout

## Technology Stack
- **Framework**: Next.js 15.5.6 (App Router)
- **Language**: TypeScript 5
- **Runtime**: Node.js 22
- **Database**: MongoDB Atlas with Mongoose 8.19 ODM + native MongoDB driver 6.20
- **Authentication**: NextAuth v5 (beta.30) with MongoDBAdapter and JWT strategy
- **Validation**: Zod 4.1 (API) + Mongoose (Database)
- **Security**: Server-side input sanitization (HTML/XSS prevention)
- **Search**: Fuse.js 7.1 for client-side fuzzy search
- **Styling**: Tailwind CSS v4.1 with CSS Variables
- **UI Components**: React 19 with custom components
- **Email**: Nodemailer for magic link authentication (optional)
- **Animation**: Lottie animations via @lottiefiles/dotlottie-react
- **Fonts**: Playfair Display, Merriweather, custom NewYorker

## Project Structure

```
book-club-nextjs/
├── netlify.toml                # Netlify deployment configuration
└── frontend/                   # Main Next.js application
    ├── src/
    │   ├── app/                # Next.js App Router
    │   │   ├── admin/          # Admin dashboard
    │   │   │   ├── users/      # User management page
    │   │   │   │   ├── page.tsx
    │   │   │   │   ├── UserManagementTable.tsx
    │   │   │   │   ├── UserTableRow.tsx
    │   │   │   │   └── UserMobileCard.tsx
    │   │   │   ├── suggestions/# Suggestion management page
    │   │   │   │   ├── page.tsx
    │   │   │   │   ├── AdminSuggestionsTable.tsx
    │   │   │   │   ├── SuggestionTableRow.tsx
    │   │   │   │   ├── SuggestionMobileCard.tsx
    │   │   │   │   └── ResetVotingButton.tsx
    │   │   │   ├── meetings/   # Meeting management page
    │   │   │   │   ├── page.tsx
    │   │   │   │   ├── AdminMeetingsTable.tsx
    │   │   │   │   ├── MeetingForm.tsx
    │   │   │   │   ├── MeetingTableRow.tsx
    │   │   │   │   └── MeetingMobileCard.tsx
    │   │   │   ├── layout.tsx  # Admin layout with navigation
    │   │   │   ├── AdminMobileNav.tsx
    │   │   │   └── actions.ts  # Admin Server Actions
    │   │   ├── suggestions/    # User-facing suggestions page
    │   │   │   ├── page.tsx
    │   │   │   ├── SuggestionsList.tsx
    │   │   │   ├── AddSuggestionForm.tsx
    │   │   │   └── actions.ts  # Suggestion Server Actions
    │   │   ├── meetings/       # Meeting data actions
    │   │   │   └── actions.ts
    │   │   ├── Vote/           # Voting page
    │   │   │   ├── page.tsx
    │   │   │   └── VotingList.tsx
    │   │   ├── NextMeeting/    # Next meeting page
    │   │   │   ├── page.tsx
    │   │   │   └── StaticCalendar.tsx
    │   │   ├── BooksRead/      # Books read page
    │   │   │   ├── page.tsx
    │   │   │   └── ReadBooksList.tsx
    │   │   ├── auth/           # Auth pages
    │   │   │   ├── signin/page.tsx
    │   │   │   └── pending/    # Pending approval page
    │   │   │       ├── page.tsx
    │   │   │       └── PendingContent.tsx
    │   │   ├── api/            # API routes (REST endpoints)
    │   │   │   ├── auth/[...nextauth]/route.ts  # NextAuth handler
    │   │   │   ├── admin/
    │   │   │   │   ├── users/route.ts           # User list with filters
    │   │   │   │   └── pending-count/route.ts   # Pending user count
    │   │   │   ├── suggestions/route.ts         # GET suggestions
    │   │   │   ├── meetings/
    │   │   │   │   ├── route.ts                 # GET all, POST new
    │   │   │   │   ├── [id]/route.ts            # GET, PUT, DELETE by ID
    │   │   │   │   ├── next/route.ts            # GET next meeting
    │   │   │   │   └── test-db/route.ts         # Database connectivity test
    │   │   │   └── books/route.ts               # Google Books API proxy
    │   │   ├── page.tsx        # Home page
    │   │   ├── error.tsx       # Global error boundary
    │   │   ├── not-found.tsx   # 404 page
    │   │   └── layout.tsx      # Root layout
    │   ├── components/         # React components
    │   │   ├── navbar/         # Navigation components
    │   │   │   ├── Navbar.tsx
    │   │   │   ├── DesktopNav.tsx
    │   │   │   ├── MobileNav.tsx
    │   │   │   ├── Logo.tsx
    │   │   │   ├── MobileMenuButton.tsx
    │   │   │   └── MobileUserAvatar.tsx
    │   │   ├── AdminOnly.tsx   # Admin-only wrapper
    │   │   ├── ApprovedOnly.tsx# Approved user wrapper
    │   │   ├── Toast.tsx       # Notification system
    │   │   ├── ConfirmModal.tsx# Confirmation dialog
    │   │   ├── BookSearchInput.tsx  # Google Books search
    │   │   ├── BookPlaceholder.tsx  # Book cover fallback
    │   │   ├── MeetingCard.tsx # Meeting display card
    │   │   ├── NextMeetingCard.tsx # Next meeting card
    │   │   ├── StatCard.tsx    # Statistics card
    │   │   ├── StatusBadge.tsx # Status indicator
    │   │   ├── Button.tsx      # Button component
    │   │   ├── ActionButton.tsx# Action button with loading
    │   │   ├── LoadingSkeleton.tsx  # Loading state
    │   │   ├── LottieAnimation.tsx  # Lottie player
    │   │   ├── AutoRefresh.tsx # Auto-refresh component
    │   │   ├── GdprInfoModal.tsx    # GDPR info modal
    │   │   └── SessionProviderWrapper.tsx
    │   ├── lib/                # Utilities & core logic
    │   │   ├── auth.ts         # NextAuth configuration
    │   │   ├── auth.config.ts  # NextAuth config (edge-compatible)
    │   │   ├── auth-helpers.ts # Auth helper functions
    │   │   ├── mongodb.ts      # Mongoose connection (serverless optimized)
    │   │   ├── mongodb-client.ts # MongoDB native client (serverless optimized)
    │   │   ├── logger.ts       # Server-side logging utility
    │   │   ├── rateLimit.ts    # Rate limiting middleware
    │   │   └── validations/    # Zod schemas
    │   │       ├── admin.ts
    │   │       ├── suggestions.ts
    │   │       └── meetings.ts
    │   ├── models/             # Mongoose models
    │   │   ├── User.ts         # User with roles & approval
    │   │   ├── BookSuggestion.ts # Suggestions with voting
    │   │   └── Meeting.ts      # Meeting model
    │   ├── types/              # TypeScript type definitions
    │   │   ├── auth.ts
    │   │   ├── admin.ts
    │   │   ├── meeting.ts
    │   │   ├── suggestion.ts
    │   │   └── next-auth.d.ts  # NextAuth type extensions
    │   ├── hooks/              # Custom React hooks
    │   │   ├── usePendingCount.ts # Hook for pending user count
    │   │   ├── useFuzzySearch.ts  # Fuzzy search hook with validation
    │   │   └── __tests__/
    │   │       └── useFuzzySearch.test.ts # Fuzzy search tests
    │   ├── data/               # Static data files
    │   ├── scripts/            # Utility scripts
    │   │   └── seedMeetings.ts # Database seeding script
    │   ├── middleware.ts       # Next.js middleware (auth, redirects)
    │   └── constants.ts        # Application constants
    ├── public/                 # Static assets
    │   └── animations/         # Lottie animation files
    │       ├── animationBooks.lottie
    │       ├── booksStack.lottie
    │       └── Error.lottie    # Error page animation
    ├── .env.local              # Environment variables (not in git)
    ├── .env.example            # Environment variables template
    ├── next.config.ts          # Next.js configuration
    ├── tailwind.config.js      # Tailwind CSS configuration
    ├── tsconfig.json           # TypeScript configuration
    ├── eslint.config.mjs       # ESLint configuration
    ├── ACCESSIBILITY.md        # Accessibility documentation
    └── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account (free tier works)
- Google OAuth credentials (from Google Cloud Console)

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd book-club-nextjs/frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create `frontend/.env.local` (see `frontend/.env.example` for reference):

```bash
# MongoDB Atlas Connection
MONGODB_URI=your-mongodb-atlas-connection-string

# NextAuth Configuration
AUTH_SECRET=your-random-secret-key  # Generate with: openssl rand -base64 32
AUTH_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (for Sign in with Google)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email Provider (optional - for magic link authentication)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourdomain.com

# Google Books API (for book search functionality)
GOOGLE_BOOKS_API_KEY=your-google-books-api-key

# Admin Configuration
ADMIN_EMAIL=your-email@gmail.com  # This user becomes admin automatically

# Environment
NODE_ENV=development
```

### 4. Set Up MongoDB Atlas

1. Create a free MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Create a database user with read/write permissions
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get the connection string and add it to `MONGODB_URI`

### 5. Set Up Google OAuth & APIs

#### Google OAuth (for authentication)
1. Go to https://console.cloud.google.com/apis/credentials
2. Create a new OAuth 2.0 Client ID
3. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Copy Client ID and Secret to `.env.local`

#### Google Books API (for book search)
1. In the same Google Cloud Console project
2. Enable the Google Books API
3. Create an API key (restrict it to Google Books API)
4. Add the API key to `.env.local` as `GOOGLE_BOOKS_API_KEY`

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. First-Time Admin Setup

**IMPORTANT - Security Note**: The `ADMIN_EMAIL` environment variable is only used for initial setup when NO admins exist in the database. After the first admin is created, this environment variable is ignored for security reasons.

#### Initial Setup (First Admin):

1. Set `ADMIN_EMAIL` in your `.env.local` to your Google account email
2. Sign in with the Google account matching `ADMIN_EMAIL`
3. **You'll be automatically promoted to admin** (first-time setup only)
4. Other users will be pending and require your approval

#### After Initial Setup:

- **ADMIN_EMAIL is ignored** once an admin exists in the database
- New admins must be promoted through the admin panel by existing admins
- To add more admins: Admin Panel → Users → Change Role to "admin"
- Even if someone gets access to your `.env` file, they cannot auto-promote to admin

#### Promoting Additional Admins:

1. Log in as an existing admin
2. Go to Admin Panel → Users
3. Find the user you want to promote
4. Click "Change Role" → Select "admin"
5. Confirm the change

#### Security Best Practices:

- Remove `ADMIN_EMAIL` from `.env.local` after initial setup (optional but recommended)
- Use strong passwords and 2FA on your Google account
- Only promote trusted users to admin
- Regularly review admin users in the admin panel

## Available Scripts

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
npm run seed     # Seed database with sample meetings (uses tsx)
```

## User Roles

| Role | Permissions |
|------|------------|
| **Pending** | Default for new users. Cannot access the site. See approval pending page. |
| **User** | Can view meetings, suggest books, vote on suggestions, edit/delete own suggestions. |
| **Admin** | Full access. Can approve/reject users, manage all suggestions, manage meetings. |

## Key Features Explained

### Fuzzy Search
The application uses **Fuse.js** for client-side fuzzy search on the Books Read page:

**How It Works:**
- Users type their search query in the input field
- Click "Sök" (Search) button or press Enter to trigger the search
- Fuzzy matching finds books even with typos (threshold: 0.4 for better tolerance)
- Searches across **title**, **author**, and **description** fields simultaneously

**Example Searches:**
- `Hary Poter` → finds "Harry Potter"
- `Stieg Larrson` → finds "Stieg Larsson"
- `tolkin` → finds "Tolkien" books
- `Män som hatar` → finds "Män som hatar kvinnor"

**Security Features:**
- Input validation: max 100 characters, trimmed
- Client-side only (no database injection risk)
- XSS-safe through React's automatic escaping
- No regex injection vulnerabilities

**Implementation:**
- Custom React hook: `useFuzzySearch` (`frontend/src/hooks/useFuzzySearch.ts`)
- Memoized for performance (doesn't re-run on every render)
- TypeScript typed for type safety
- Configurable threshold and search keys

**User Experience:**
- Search only triggers on form submit (not real-time while typing)
- Shows result count when filtering (e.g., "Visar 5 av 12 böcker")
- Clear button resets both input and results
- Maintains input field value until cleared or resubmitted

### Database Sessions
Unlike JWT tokens, database sessions allow immediate access revocation. When an admin rejects a user, they lose access instantly without waiting for token expiration.

### Server Actions
All mutations (create, update, delete) use Next.js Server Actions with:
- Zod validation for user-friendly error messages
- Server-side HTML sanitization to prevent XSS attacks
- Authorization checks (requireAuth, requireAdmin, requireApproved)
- `revalidatePath()` for cache updates
- Error handling with detailed logging

### API Routes
The application uses a hybrid approach with both API Routes and Server Actions:

**API Routes (REST endpoints):**
- `GET /api/admin/users` - User list with search, filter, and pagination
- `GET /api/admin/pending-count` - Count of pending users (for notifications)
- `GET /api/suggestions` - Suggestions with vote counts and sorting
- `GET /api/meetings` - All meetings list
- `POST /api/meetings` - Create new meeting (admin only)
- `GET /api/meetings/[id]` - Get specific meeting
- `PUT /api/meetings/[id]` - Update meeting (admin only)
- `DELETE /api/meetings/[id]` - Delete meeting (admin only)
- `GET /api/meetings/next` - Get next upcoming meeting
- `GET /api/books?q=query` - Search Google Books API (proxied)

**Server Actions (for mutations):**
- All user approval/rejection operations
- Suggestion creation, voting, editing, deletion
- Meeting data mutations (create, update, delete)

### Optimistic UI
Voting on suggestions shows instant feedback while the server request completes in the background, providing a smooth user experience.

## Localization

All UI text is in Swedish:
- "Ditt konto väntar på godkännande" (Your account is pending approval)
- "Bokförslag" (Book suggestions)
- "Rösta" (Vote)
- Error messages and validation feedback

## Development Notes

### TypeScript
- Strict mode enabled
- Types generated from Zod schemas using `z.infer<>`
- Extended NextAuth types for custom session fields

### Security Best Practices
- **Input Sanitization**: Server-side HTML tag removal and character escaping
- **Multi-layer Validation**: Zod schemas for API validation + Mongoose schemas for database
- **Session Security**: JWT sessions with database user verification on every request
- **Authorization**: Comprehensive checks in all protected routes, API endpoints, and Server Actions
- **XSS Prevention**: Server-side sanitization removes HTML tags and dangerous characters
- **CSRF Protection**: Built-in via NextAuth
- **Rate Limiting**: API endpoint protection against abuse
- **Environment Validation**: Required environment variables checked on startup

### Serverless Optimization
The application is optimized for serverless deployment (Netlify/Vercel):
- **Connection Pooling**: Optimized MongoDB connection settings (maxPoolSize: 10, minPoolSize: 1)
- **Connection Caching**: Global variable caching prevents connection exhaustion
- **Cold Start Handling**: Extended timeouts (10s) for serverless cold starts
- **Buffer Commands Disabled**: Critical for serverless (`bufferCommands: false`)
- **Model Registration**: Proper Mongoose model imports ensure schema availability in serverless functions
- **Write Operation Safety**: Connection 'open' event verification before writes
- **External Dependencies**: Mongoose, MongoDB, and BSON marked as external in Netlify config
- **Detailed Logging**: Comprehensive logging for debugging in serverless environments
- **Error Boundaries**: Custom error pages (404 and general errors) with user-friendly messages

### Accessibility
- WCAG 2.1 Level AA compliance
- Semantic HTML throughout
- Keyboard navigation support
- ARIA labels for screen readers
- See `ACCESSIBILITY.md` for detailed documentation

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js v5 Documentation](https://authjs.dev/getting-started)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Zod Documentation](https://zod.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)

## Deployment

The application includes a `netlify.toml` configuration file optimized for serverless deployment.

### Deploy to Netlify

1. **Push your code to GitHub**

2. **Connect to Netlify**
   - Go to [Netlify](https://netlify.com) and sign in
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository

3. **Configure Build Settings**
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/.next`
   - Node version: 22 (configured in `netlify.toml`)

4. **Set Environment Variables** (in Netlify dashboard under Site settings → Environment variables)
   ```bash
   # Database
   MONGODB_URI=your-mongodb-atlas-connection-string

   # NextAuth
   AUTH_SECRET=your-random-secret-key
   AUTH_URL=https://your-app.netlify.app
   NEXTAUTH_URL=https://your-app.netlify.app

   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   # Google Books API
   GOOGLE_BOOKS_API_KEY=your-google-books-api-key

   # Email (optional)
   EMAIL_SERVER_HOST=smtp.gmail.com
   EMAIL_SERVER_PORT=587
   EMAIL_SERVER_USER=your-email@gmail.com
   EMAIL_SERVER_PASSWORD=your-app-password
   EMAIL_FROM=noreply@yourdomain.com

   # Admin
   ADMIN_EMAIL=your-email@gmail.com

   # Environment
   NODE_ENV=production
   ```

5. **Deploy**

**Important Notes:**
- The `netlify.toml` marks `mongoose`, `mongodb`, and `bson` as external dependencies for proper serverless function bundling
- Update `NEXTAUTH_URL` and `AUTH_URL` to your production Netlify URL
- Enhanced MongoDB connection logic handles serverless cold starts automatically

### Deploy to Vercel

1. **Push your code to GitHub**

2. **Import to Vercel**
   - Go to [Vercel](https://vercel.com) and sign in
   - Click "Add New Project"
   - Import your GitHub repository

3. **Configure Settings**
   - Root Directory: `frontend`
   - Framework Preset: Next.js (auto-detected)
   - Node.js Version: 22

4. **Add the same environment variables as Netlify** (update URLs to your Vercel domain)

### Post-Deployment Configuration

#### Google OAuth
After deployment, update your Google OAuth settings:
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Edit your OAuth 2.0 Client ID
3. Add authorized redirect URIs for both platforms:
   - `https://your-app.netlify.app/api/auth/callback/google`
   - `https://your-app.vercel.app/api/auth/callback/google`

#### MongoDB Atlas
Whitelist deployment platform IP addresses:
1. Go to MongoDB Atlas → Network Access
2. Add `0.0.0.0/0` (allow all connections) for simplicity
3. Or add specific IP ranges for better security:
   - Netlify: Check [Netlify's IP ranges documentation](https://docs.netlify.com/)
   - Vercel: Vercel uses dynamic IPs, so `0.0.0.0/0` is typically required

#### Monitoring
Check your deployment logs for `[MongoDB]` and `[API]` prefixed messages to verify:
- Database connections are establishing correctly
- Write operations are working
- Authentication flow is functioning

## License

This project is private and for personal use.

## Contributing

This is a personal project for a book club. Contact the administrator for access.
