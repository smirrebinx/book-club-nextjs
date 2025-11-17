# Barnfria Bokklubben

A full-stack book club application built with Next.js 15, featuring user authentication, role-based access control, book suggestions with voting, and an admin dashboard.

## Live
https://bbokklubb.netlify.app
https://book-club-nextjs-mocha.vercel.app

## Features

### User Management
- **Google OAuth Authentication** via NextAuth v5
- **Role-Based Access Control**: Three roles (pending, user, admin)
- **Approval System**: New users require admin approval before accessing the site
- **Auto-Admin Assignment**: First user with configured email becomes admin automatically
- **Database Sessions**: Immediate access revocation when users are rejected

### Book Suggestions
- **Google Books Integration**: Search and add books with auto-populated metadata
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

### Security
- **Multi-layered Validation**: Zod for API validation, Mongoose for database schemas
- **XSS Prevention**: Server-side DOMPurify sanitization
- **Database Sessions**: Prevents JWT tampering and allows immediate revocation
- **Authorization Checks**: Server-side validation in all mutations
- **WCAG Compliant**: Accessibility features throughout

## Technology Stack

- **Framework**: Next.js 15.0.0 (App Router)
- **Language**: TypeScript 5
- **Runtime**: Node.js 22
- **Database**: MongoDB Atlas with Mongoose 8.19 ODM + native MongoDB driver 6.20
- **Authentication**: NextAuth v5 (beta.30) with MongoDBAdapter and JWT strategy
- **Validation**: Zod 4.1 (API) + Mongoose (Database)
- **Security**: isomorphic-dompurify
- **Styling**: Tailwind CSS v4.1
- **UI Components**: React 19 with custom components
- **Email**: Nodemailer for magic link authentication (not set up yet)
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
    │   │   │   │   └── next/route.ts            # GET next meeting
    │   │   │   └── books/route.ts               # Google Books API proxy
    │   │   ├── page.tsx        # Home page
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
    │   │   ├── mongodb.ts      # Mongoose connection (with serverless fixes)
    │   │   ├── mongodb-client.ts # MongoDB native client
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
    │   ├── data/               # Static data files
    │   └── scripts/            # Utility scripts
    │       └── seedMeetings.ts # Database seeding script
    ├── public/                 # Static assets
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

1. Sign in with the Google account matching `ADMIN_EMAIL`
2. You'll be automatically approved and assigned the admin role
3. Other users will be pending and require your approval

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

### Database Sessions
Unlike JWT tokens, database sessions allow immediate access revocation. When an admin rejects a user, they lose access instantly without waiting for token expiration.

### Server Actions
All mutations (create, update, delete) use Next.js Server Actions with:
- Zod validation for user-friendly error messages
- DOMPurify sanitization to prevent XSS attacks
- Authorization checks (requireAuth, requireAdmin, requireApproved)
- `revalidatePath()` for cache updates

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
- Server-side input sanitization with DOMPurify
- Separate validation layers (Zod + Mongoose)
- JWT sessions with database user verification on every request
- Authorization checks in all protected routes and API endpoints
- XSS prevention via isomorphic-dompurify
- CSRF protection via NextAuth
- Environment variable validation

### Serverless Optimization
The application is optimized for serverless deployment (Netlify/Vercel):
- **Connection Pooling**: MongoDB connection caching with proper state management
- **Cold Start Handling**: Extended timeouts (10s) for serverless cold starts
- **Write Operation Safety**: Connection 'open' event verification before writes
- **External Dependencies**: Mongoose, MongoDB, and BSON marked as external in Netlify config
- **Detailed Logging**: Comprehensive logging for debugging in serverless environments

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

5. **Deploy!**

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