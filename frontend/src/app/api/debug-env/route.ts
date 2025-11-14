import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasAuthSecret: !!process.env.AUTH_SECRET,
    hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
    hasAuthUrl: !!process.env.AUTH_URL,
    hasMongoUri: !!process.env.MONGODB_URI,
    hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    nodeEnv: process.env.NODE_ENV,
    authUrlValue: process.env.AUTH_URL,
    nextAuthUrlValue: process.env.NEXTAUTH_URL,
  });
}
