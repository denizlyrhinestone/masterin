// Using .js extension and no imports at all
export default function Loading() {
  return new Response(
    `<!DOCTYPE html>
    <html>
      <head>
        <title>Loading...</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.5;
            padding: 2rem;
            max-width: 800px;
            margin: 0 auto;
          }
          .loading {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }
          .skeleton {
            background-color: #e5e7eb;
            border-radius: 0.25rem;
            animation: pulse 1.5s infinite;
          }
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }
        </style>
      </head>
      <body>
        <div class="loading">
          <div class="skeleton" style="height: 2rem; width: 33%;"></div>
          <div class="skeleton" style="height: 10rem; width: 100%;"></div>
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
