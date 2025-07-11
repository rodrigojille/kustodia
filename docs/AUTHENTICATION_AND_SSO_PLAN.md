# Authentication System & Google SSO Integration Plan

This document outlines the current state of the Kustodia authentication system and the proposed plan for integrating Google SSO for enhanced security and user experience.

## 1. Current Authentication Flow Analysis

Our analysis confirms a standard JSON Web Token (JWT) based authentication system.

### Frontend (`/frontend`)

-   **Login Page (`src/app/login/page.tsx`):** Captures user email and password.
-   **API Call:** Submits credentials to the backend endpoint `/api/users/login`.
-   **Token Storage:** Upon successful login, the received JWT is stored in the browser's `localStorage`.
-   **Route Protection (`src/components/ClientAuthGuard.tsx`):** A client-side guard checks for the presence and validity of the JWT to protect authenticated routes.

### Backend (`/backend`)

-   **Routes (`src/routes/user.ts`):** Defines all user-related endpoints, including `/api/users/login`.
-   **Controller (`src/controllers/userController.ts`):** The `login` function handles the core logic:
    -   Validates the user's email and password.
    -   Compares the provided password against the stored hash using `bcrypt`.
    -   Generates a signed JWT upon successful validation.
-   **Middleware (`src/authenticateJWT.ts`):** Protects secure endpoints by verifying the JWT from the `Authorization: Bearer` header on incoming requests.

## 2. Google SSO Integration Plan

We will implement "Sign in with Google" using the OAuth 2.0 protocol, facilitated by the `Passport.js` library.

### Phase 1: Google Cloud Configuration (User Action Required)

**This step must be completed by the project owner.**

1.  **Navigate to Google Cloud Console:** Go to [APIs & Services > Credentials](https://console.cloud.google.com/).
2.  **Create OAuth Client ID:**
    -   Application Type: **Web application**.
    -   Authorized Redirect URIs: Add `http://localhost:4000/api/auth/google/callback`.
3.  **Obtain Credentials:** After creation, copy the **Client ID** and **Client Secret**.
4.  **Update Environment:** Add the credentials to the backend's `.env` file:
    ```
    GOOGLE_CLIENT_ID=your-client-id-here
    GOOGLE_CLIENT_SECRET=your-client-secret-here
    ```

### Phase 2: Backend Integration (Passport.js)

1.  **Install Dependencies:** Add `passport`, `passport-google-oauth20`, and their corresponding type definitions (`@types/passport`, `@types/passport-google-oauth20`) to the backend.
2.  **Update User Entity:** Add a nullable `googleId` string field to the `User` entity in `backend/src/entity/User.ts` to associate Google accounts.
3.  **Configure Passport:** Create a new configuration file (`backend/src/config/passport.ts`) to set up the Google OAuth20 strategy.
4.  **Create SSO Routes:** Add two new routes in `backend/src/routes/auth.ts`:
    -   `GET /api/auth/google`: Initiates the Google login flow.
    -   `GET /api/auth/google/callback`: Handles the callback from Google after authentication. It will find or create a user, generate a JWT, and redirect back to the frontend.

### Phase 3: Frontend Integration

1.  **Add 'Sign in with Google' Button:** Add a new button to the login page (`frontend/src/app/login/page.tsx`).
2.  **Link to Backend:** The button will be a simple link (`<a>` tag) pointing to the backend initiation route: `http://localhost:4000/api/auth/google`.
3.  **Handle Callback:** Create a new frontend page (e.g., `frontend/src/app/auth/callback/page.tsx`). The backend will redirect to this page with the JWT in the URL parameters. This page will:
    -   Extract the token from the URL.
    -   Save the token to `localStorage`.
    -   Redirect the user to the `/dashboard`.
