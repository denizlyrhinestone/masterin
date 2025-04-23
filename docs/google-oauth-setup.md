# Setting Up Google OAuth with Supabase

This guide will walk you through the process of setting up Google OAuth for your Masterin application using Supabase.

## 1. Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" and select "OAuth client ID"
5. Select "Web application" as the application type
6. Add a name for your OAuth client
7. Add authorized JavaScript origins:
   - For development: `http://localhost:3000`
   - For production: `https://yourdomain.com`
8. Add authorized redirect URIs:
   - For development: `http://localhost:3000/auth/callback`
   - For production: `https://yourdomain.com/auth/callback`
9. Click "Create"
10. Note down the Client ID and Client Secret

## 2. Configure Supabase Auth

1. Go to your Supabase project dashboard
2. Navigate to "Authentication" > "Providers"
3. Find "Google" in the list of providers and click "Edit"
4. Toggle the "Enabled" switch to on
5. Enter the Client ID and Client Secret from Google Cloud Console
6. Set the Redirect URL to match what you configured in Google Cloud Console
7. Save the changes

## 3. Update Environment Variables

Add the following environment variables to your project:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

## 4. Test the Integration

1. Run your application
2. Navigate to the sign-in page
3. Click the "Continue with Google" button
4. You should be redirected to Google's authentication page
5. After authenticating, you should be redirected back to your application and signed in

## Troubleshooting

### Common Issues:

1. **Redirect URI Mismatch**: Ensure the redirect URI in Google Cloud Console exactly matches the one in Supabase and your application.

2. **CORS Issues**: Make sure your authorized JavaScript origins are correctly set in Google Cloud Console.

3. **Callback Not Working**: Verify that your callback route is correctly implemented and handling the authentication response.

4. **Invalid Client ID or Secret**: Double-check that you've copied the correct values from Google Cloud Console to Supabase.

5. **Gmail Registration Issues**: If users with Gmail accounts are having trouble registering:
   - Ensure your Google OAuth configuration is correctly set up
   - Check that your application is properly handling the OAuth flow
   - Verify that your database is correctly storing user information from Google authentication

If you continue to experience issues, check the browser console and server logs for specific error messages that can help identify the problem.
\`\`\`

Finally, let's create a troubleshooting component to help diagnose authentication issues:
