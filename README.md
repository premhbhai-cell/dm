

## DM Studio Admin Dashboard

1. Install Node.js if it is not already installed.
2. Open this folder in Terminal / PowerShell.
3. Run `node server.js`.
4. Open `http://localhost:3000/admin.html` (if the port changes, use the port printed in Terminal).
5. Sign in using the administrator email and password provided by the site owner.
6. Use **Photos & Slider** to upload or delete images in each category. Use **Website Content** to update the contact name, phone, logo path, delivery copy, gallery copy, outdoor copy, hero copy and package prices. Use **Reviews** for genuine customer reviews only.
7. Keep the server running while using the dashboard. Uploaded images and settings are saved in this website folder.

**Important:** This is a lightweight Node.js admin for a self-hosted / Node-enabled environment. A static-only host such as GitHub Pages cannot run these upload APIs. The login is validated by the local Node server and does not use a third-party verification service. Use HTTPS and server-side protection before exposing the admin publicly; do not rely on a browser-only password check for a public production site. The dashboard does not provide a full drag-and-drop page builder or edit every arbitrary paragraph/section in the HTML.
