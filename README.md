# CocoHub

Coconut and Coconut-Based Products Management System, built as a university MERN project. CocoHub connects customers and the business through accounts, product feedback, ratings, and customer management.

The existing React frontend, Express API, MongoDB/Mongoose models, route URLs, and product values are retained. The UI uses Bootstrap 5, custom CSS, and the project's existing React Icons, Chart.js, and jsPDF dependencies.

## Run locally

Install dependencies in both `BACKEND` and `frontend` with `npm install`. On Windows PowerShell, use `npm.cmd` if script execution policy blocks `npm`.

Configure `BACKEND/.env` with your own values:

```dotenv
PORT=8000
MONGODB_URL=your_mongodb_connection_string
JWTPRIVATEKEY=your_jwt_signing_secret
# Optional thank-you emails
EMAIL_USER=your_email_address
EMAIL_PASS=your_mail_app_password
# Existing optional Cloudinary integration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start Express:

```sh
cd BACKEND
npm run dev
```

In another terminal, start React:

```sh
cd frontend
npm start
```

Open **http://localhost:3000**. The frontend defaults to **http://localhost:8000** for API calls. Override it with `REACT_APP_API_URL` in `frontend/.env` when needed, then restart React. Express currently permits the local frontend origin on port 3000.

## Application routes

| Route                             | Purpose                                                                      |
| --------------------------------- | ---------------------------------------------------------------------------- |
| `/`                               | Landing page, product range preview, mission, and community feedback preview |
| `/signup`                         | Register using the original user fields and roles                            |
| `/login`                          | Sign in, then navigate to the profile                                        |
| `/profile`                        | Account details, field editing, photo upload, sign out, and account deletion |
| `/forgot-password`                | Existing password reset flow                                                 |
| `/add`                            | Publish feedback with product, rating, and consent                           |
| `/feedback`                       | Searchable feedback cards/table, inline update/delete, and reports           |
| `/feedback?product=Coconut%20Oil` | Filter the same feedback list by a product                                   |
| `/manage-users`                   | Existing user administration, role updates, removal, and PDF export          |
| `/feedback-analytics`             | Product review distribution, rating summary, and accessible data table       |

Product previews link to related feedback; this checkout has no product purchasing or checkout module.

## UI and API changes

- Shared forest-green and cream tokens in `frontend/src/App.css`, with the existing dark theme preserved.
- React-controlled mobile navigation, active links, account-aware actions, shared footer, and skip link.
- Shared form labels, password toggles, notices, rating controls, page headers, and loading states in `components/UI.js`.
- Registration continues to login; login continues to profile; feedback creation continues to the feedback list.
- Profile edits use explicit save/cancel actions. Signing out clears only account session keys and keeps the theme preference.
- Feedback search filters one list. Card and table modes share the same data and selected action state.
- Feedback update/delete requires the original email. The selected panel confirms the email before revealing the editor or deletion confirmation. Express also checks the supplied email before either mutation.
- `DELETE /feedback/delete/:id` now expects `{ "email": "original@example.com" }` in the JSON body. The application sends this automatically. Endpoint URLs are unchanged.
- Partial feedback updates retain the original name, product, and email. Ratings are validated on updates.
- Feedback dates are returned as standard JSON ISO timestamps rather than locale-formatted strings, so sorting and display are reliable.
- Failed feedback reads return an HTTP error and show a retry state. Optional email delivery does not block feedback submission.
- User list and profile responses exclude password hashes. Feedback emails are masked in public UI and PDF feedback reports.

The original email-matching confirmation mechanism remains; it does not prove inbox ownership. Existing account authorization/password-recovery design is outside this UI modernization and has not been replaced.

## Verification

Run the isolated API regression suite:

```sh
cd BACKEND
npm test
```

It exercises the real Express handlers, Mongoose validation, bcrypt, JWT generation, photo upload, password updates, and feedback CRUD with in-memory persistence. It checks that incorrect/missing emails cannot mutate feedback, partial edits preserve fields, hashes are not returned, and failed reads return errors. It does **not** connect to your MongoDB, send mail, or modify existing accounts. Test-uploaded files are removed afterward.

Build the frontend:

```sh
cd frontend
npm run build
```

For browser verification, use the existing Python Playwright environment. Keep React running, then start the isolated API in a separate terminal:

```sh
node BACKEND/tests/browser-server.js
```

From the project root:

```sh
python scripts/verify-ui.py
```

Browser API requests are redirected to the isolated server on port 8011. The script checks registration/login, profile save/cancel, avatar preview, feedback create/update/delete, email rejection, search, card/table mode, PDF downloads, role updates, analytics, mobile navigation, theme persistence, and empty/error states. It checks nine routes at widths 320, 390, 768, 1024, and 1440 in both themes, and saves screenshots under ignored `tmp/`.

The local MongoDB-backed feedback endpoint was also checked read-only. Full live-database mutations, SMTP delivery, and Cloudinary delivery were not exercised.

This project is for academic and learning purposes.
