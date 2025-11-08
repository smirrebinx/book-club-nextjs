# Barnfria Bokklubben

A full-stack book club application built with Next.js 15, featuring user authentication, role-based access control, book suggestions with voting, and an admin dashboard.

## Features

### User Management
- **Google OAuth Authentication** via NextAuth v5
- **Role-Based Access Control**: Three roles (pending, user, admin)
- **Approval System**: New users require admin approval before accessing the site
- **Auto-Admin Assignment**: First user with configured email becomes admin automatically
- **Database Sessions**: Immediate access revocation when users are rejected

### Book Suggestions
- **Collaborative Suggestions**: Approved users can suggest books
- **Voting System**: One vote per user per suggestion
- **Optimistic UI**: Instant feedback when voting
- **Status Management**: Track suggestions as pending, approved, currently reading, or rejected
- **Ownership Controls**: Users can edit/delete their own suggestions, admins have full control

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
- **Language**: TypeScript
- **Database**: MongoDB Atlas with Mongoose ODM
- **Authentication**: NextAuth v5 (beta.30) with MongoDBAdapter
- **Validation**: Zod (API) + Mongoose (Database)
- **Security**: isomorphic-dompurify
- **Styling**: Tailwind CSS v4
- **Fonts**: Playfair Display, Merriweather, custom NewYorker

## Project Structure

```
book-club-nextjs/
└── frontend/                    # Main Next.js application
    ├── src/
    │   ├── app/                 # Next.js App Router
    │   │   ├── admin/          # Admin dashboard
    │   │   │   ├── users/      # User management
    │   │   │   ├── suggestions/# Suggestion management
    │   │   │   ├── meetings/   # Meeting management
    │   │   │   └── actions.ts  # Admin Server Actions
    │   │   ├── suggestions/    # User-facing suggestions page
    │   │   │   └── actions.ts  # Suggestion Server Actions
    │   │   ├── meetings/       # Meeting Server Actions
    │   │   ├── auth/           # Auth pages (signin, pending)
    │   │   └── api/            # API routes (GET only)
    │   ├── components/         # React components
    │   │   ├── AdminOnly.tsx   # Admin-only wrapper
    │   │   ├── ApprovedOnly.tsx# Approved user wrapper
    │   │   ├── Toast.tsx       # Notification system
    │   │   └── Navbar.tsx      # Role-based navigation
    │   ├── lib/                # Utilities
    │   │   ├── auth.ts         # NextAuth configuration
    │   │   ├── auth-helpers.ts # Auth helper functions
    │   │   ├── mongodb.ts      # Mongoose connection
    │   │   └── validations/    # Zod schemas
    │   ├── models/             # Mongoose models
    │   │   ├── User.ts         # User with roles
    │   │   ├── BookSuggestion.ts# Suggestions with voting
    │   │   └── Meeting.ts      # Meeting model
    │   └── types/              # TypeScript types
    ├── .env.local              # Environment variables
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

Create `frontend/.env.local`:

```bash
# MongoDB Atlas Connection
MONGODB_URI=your-mongodb-atlas-connection-string

# NextAuth Configuration
AUTH_SECRET=your-random-secret-key  # Generate with: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Admin Configuration
ADMIN_EMAIL=your-email@gmail.com  # This user becomes admin automatically
```

### 4. Set Up MongoDB Atlas

1. Create a free MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Create a database user with read/write permissions
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get the connection string and add it to `MONGODB_URI`

### 5. Set Up Google OAuth

1. Go to https://console.cloud.google.com/apis/credentials
2. Create a new OAuth 2.0 Client ID
3. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Copy Client ID and Secret to `.env.local`

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
Only used for GET requests:
- `/api/admin/users` - User list with search/filter/pagination
- `/api/suggestions` - Suggestions with vote counts
- `/api/meetings/*` - Meeting data

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
- Server-side input sanitization
- Separate validation layers (Zod + Mongoose)
- Database sessions prevent JWT attacks
- Authorization checks in all protected routes
- XSS prevention via DOMPurify

### Accessibility
- WCAG 2.1 Level AA compliance
- Semantic HTML throughout
- Keyboard navigation support
- ARIA labels for screen readers

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js v5 Documentation](https://authjs.dev/getting-started)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Zod Documentation](https://zod.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)

## Deployment

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
   - Node version: 18 or higher (set in `netlify.toml` or environment variable `NODE_VERSION`)

4. **Set Environment Variables** (in Netlify dashboard under Site settings → Environment variables)
   ```bash
   MONGODB_URI=your-mongodb-atlas-connection-string
   AUTH_SECRET=your-random-secret-key
   AUTH_URL=https://your-app.netlify.app
   NEXTAUTH_URL=https://your-app.netlify.app
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ADMIN_EMAIL=your-email@gmail.com
   ```

5. **Deploy!**

**Important**: Update `NEXTAUTH_URL` and `AUTH_URL` to your production Netlify URL in environment variables.

### Google OAuth Configuration for Production

After deployment, update your Google OAuth settings:
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Edit your OAuth 2.0 Client ID
3. Add authorized redirect URI: `https://your-app.netlify.app/api/auth/callback/google`

### MongoDB Atlas Configuration

Whitelist Netlify's IP addresses in MongoDB Atlas:
1. Go to MongoDB Atlas → Network Access
2. Either add `0.0.0.0/0` (allow all - easier but less secure)
3. Or add Netlify's IP ranges (more secure - check Netlify documentation)

## License

This project is private and for personal use.

## Contributing

This is a personal project for a book club. Contact the administrator for access.