# Deploy to Vercel

## Option 1: Vercel Dashboard (Recommended)

1.  Push this project to a GitHub repository.
2.  Log in to [Vercel](https://vercel.com/).
3.  Click **"Add New..."** -> **"Project"**.
4.  Import your repository.
5.  In the **"Environment Variables"** section, expand it and add the following keys using the values from your `.env` file (you can copy-paste the file content):
    - `VITE_FIREBASE_API_KEY`
    - `VITE_FIREBASE_AUTH_DOMAIN`
    - `VITE_FIREBASE_PROJECT_ID`
    - `VITE_FIREBASE_STORAGE_BUCKET`
    - `VITE_FIREBASE_MESSAGING_SENDER_ID`
    - `VITE_FIREBASE_APP_ID`
    - `VITE_FIREBASE_DB_URL`
6.  Click **"Deploy"**.

## Option 2: Vercel CLI

If you have the Vercel CLI installed (`npm i -g vercel`), run:

```bash
vercel
```

Follow the prompts. When asked about settings, the defaults are usually correct for Vite.
**Important**: When asked if you want to modify settings, say **Yes** to add your Environment Variables if they aren't automatically detected or linked.

## Option 3: Manual Output

You can also drag and drop the `dist/` folder to some static hosts, but for client-side routing logic (`vercel.json`) to work best, use the methods above.
