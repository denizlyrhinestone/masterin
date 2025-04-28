export default function NotFound() {
  return (
    <html>
      <head>
        <title>Page Not Found - Masterin</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style
          dangerouslySetInnerHTML={{
            __html: `
          body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background-color: #f9fafb;
          }
          .container {
            text-align: center;
            padding: 2rem;
            max-width: 600px;
          }
          h1 {
            font-size: 2.5rem;
            color: #111827;
            margin-bottom: 1rem;
          }
          p {
            font-size: 1.125rem;
            color: #4b5563;
            margin-bottom: 2rem;
          }
          a {
            display: inline-block;
            background-color: #6366f1;
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 0.375rem;
            text-decoration: none;
            font-weight: 500;
            transition: background-color 0.2s;
          }
          a:hover {
            background-color: #4f46e5;
          }
        `,
          }}
        />
      </head>
      <body>
        <div className="container">
          <h1>404 - Page Not Found</h1>
          <p>Sorry, the page you are looking for does not exist or has been moved.</p>
          <a href="/">Return to Home</a>
        </div>
      </body>
    </html>
  )
}
