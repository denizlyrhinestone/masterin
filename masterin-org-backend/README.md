# MasterIn.org Backend

This is the backend server for the MasterIn.org platform. It provides APIs for user authentication, course management, marketplace functionalities, AI tool integrations, and administrative tasks.

## Prerequisites

- Node.js (version specified in `.nvmrc` or latest LTS)
- PostgreSQL
- Access to AI service APIs (DeepSeek, Qwen, Grok) as needed for specific features.

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd masterin-org-backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    ```

3.  **Set up Environment Variables:**
    Copy the example environment file `.env.example` to a new file named `.env`:
    ```bash
    cp .env.example .env
    ```
    Open the `.env` file and update the variables with your actual configuration values. This includes:
    - `PORT` for the server.
    - PostgreSQL database connection details (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`, `DB_PORT`).
    - `JWT_SECRET` for signing authentication tokens (must be a strong, random string).
    - API keys for any AI services you plan to use (`DEEPSEEK_API_KEY`, `QWEN_API_KEY`, `GROK_API_KEY`).
    - Optional configurations for services like Grok API URL and model.

    Refer to `.env.example` for a full list and descriptions of required variables.

4.  **Database Setup:**
    Ensure your PostgreSQL server is running and accessible with the credentials provided in your `.env` file.
    The application includes a basic schema definition in `sql/schema.sql`. This schema is applied automatically when the `db/database.js` module initializes and calls `executeSchema()`, which attempts to create tables if they don't exist. For a fresh setup, ensure the target database exists. For more complex migrations or schema changes, consider using a dedicated migration tool.

5.  **Run the application (development mode):**
    ```bash
    npm run dev
    # or if you have a start script
    # npm start
    ```
    This will typically start the server using `nodemon` for automatic restarts on file changes.

6.  **Building for Production:**
    While this backend is plain JavaScript and doesn't have a transpilation build step, the `build` script is included for consistency:
    ```bash
    npm run build
    ```
    It will simply echo a message indicating no build is necessary.

7.  **Starting in Production Mode:**
    To run the server in a mode suitable for production (e.g., without `nodemon` and with `NODE_ENV=production`):
    ```bash
    npm start
    ```
    This script sets `NODE_ENV=production` and runs `node index.js`. Ensure your `.env` file has production-ready settings.

## API Endpoints

API documentation will be provided separately (e.g., via Postman collection or Swagger/OpenAPI specification). Key route groups include:
- `/auth`: User authentication (signup, login, password reset).
- `/api/users`: User profile management, badges, purchased products.
- `/api/courses`: Course creation, management, and consumption.
- `/api/marketplace`: Marketplace product listing, creation, acquisition, and downloads.
- `/api/ai`: AI-powered content generation tools.
- `/api/admin`: Administrative tasks (user management, content moderation).
- ... and others as defined in `index.js`.

## Project Structure (Simplified)

```
masterin-org-backend/
├── db/                 # Database connection and schema execution
│   └── database.js
├── middleware/         # Express middleware (e.g., auth)
│   └── authMiddleware.js
├── routes/             # API route definitions
│   ├── auth.js
│   ├── aiToolsRoutes.js
│   ├── adminRoutes.js
│   └── ... (other route files)
├── sql/                # SQL schema definitions
│   └── schema.sql
├── .env.example        # Example environment variables
├── .gitignore
├── index.js            # Main application entry point
├── package.json
└── README.md
```

## Contributing

Please refer to the main project's contributing guidelines.

## License

This project is licensed under the MIT License - see the main project's LICENSE file for details.
