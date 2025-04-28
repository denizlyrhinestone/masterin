// Static page with no client component imports
export const dynamic = "force-static"

export default function AIStatusPage() {
  return new Response(
    `<!DOCTYPE html>
    <html>
      <head>
        <title>AI Status - Redirecting</title>
        <meta http-equiv="refresh" content="0;url=/admin/groq-status" />
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.5;
            padding: 2rem;
            max-width: 800px;
            margin: 0 auto;
            color: #111827;
            background-color: #f9fafb;
          }
          .card {
            background-color: white;
            border: 1px solid #e5e7eb;
            border-radius: 0.5rem;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          .heading {
            font-size: 1.5rem;
            font-weight: bold;
            margin-bottom: 1rem;
            color: #111827;
          }
          .button {
            background-color: #7c3aed;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
            text-decoration: none;
            display: inline-block;
            font-weight: 500;
          }
          .button:hover {
            background-color: #6d28d9;
          }
          .message {
            margin-bottom: 1rem;
          }
        </style>
      </head>
      <body>
        <h1 class="heading">AI Status Page</h1>
        <div class="card">
          <p class="message">This page has been moved to improve stability.</p>
          <p class="message">You are being redirected to the Groq Status page...</p>
          <p class="message">If you are not redirected automatically, please click the link below:</p>
          <a href="/admin/groq-status" class="button">Go to Groq Status</a>
        </div>
      </body>
    </html>`,
    {
      headers: {
        "content-type": "text/html",
      },
    },
  )
}
