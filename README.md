# 1. Project Name
**Testimonial & Social Proof Collector (TestimonialHub)**

# 2. Project Description
TestimonialHub is a full-stack platform that empowers business owners to effortlessly collect, moderate, and display customer reviews. Users can launch branded "Spaces" to gather feedback through public forms without requiring clients to log in. Business owners can then moderate submissions in an inbox, filter by ratings, and instantly generate beautiful, embeddable "Wall of Love" widgets to showcase their best social proof on any website.

# 3. Technology Stack Used
- **Frontend**: React 19, Vite, Tailwind CSS, shadcn/ui components (Coss UI).
- **Backend**: Node.js, Express 5, RESTful APIs.
- **Database**: MongoDB with Mongoose ODM.
- **Image Storage**: Cloudinary (for avatars and company logos).
- **Security & Auth**: JSON Web Tokens (JWT), HTTP-only cookies, bcrypt for password hashing, Helmet for security headers.

# 4. How to Install Dependencies
This project uses a monorepo structure (npm workspaces) containing both the client and server.

You can install all dependencies for both the frontend and backend from the root directory with a single command:
```bash
git clone https://github.com/Git-Hub-prog/com_bot_project.git
cd com_bot_project
npm install
```

*(Alternatively, you can navigate into the `client` and `server` folders and run `npm install` individually).*

# 5. How to Configure Environment Variables
You need to set up environment variables for the backend to run properly. 

1. Navigate to the `server` directory.
2. Copy the example configuration file:
   ```bash
   cd server
   cp .env.example .env
   ```
3. Open the newly created `server/.env` file and fill in the required keys. Your file should look something like this:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/testimonialhub
   JWT_ACCESS_SECRET=your_super_secret_access_key
   JWT_REFRESH_SECRET=your_super_secret_refresh_key
   CLIENT_URL=http://localhost:5173
   
   # Cloudinary Setup for Image Uploads
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

*(Note: The `client` directory does not require an `.env` file unless you change the backend URL. By default, it proxies API requests to `localhost:5000` via Vite configuration).*

# 6. How to Run the Project Locally
Once dependencies are installed and your `.env` is configured, you can start the development servers.

From the **root directory**, you can run the client and server concurrently using the built-in npm workspace scripts:

**Terminal 1 (Backend API):**
```bash
npm run dev:server
```
*The API will start at `http://localhost:5000`.*

**Terminal 2 (Frontend React App):**
```bash
npm run dev:client
```
*The frontend will start at `http://localhost:5173`.*

*(To start the unified production build locally, you can run `npm run build` followed by `npm start` from the root directory).*

# 7. Database Setup
This project requires **MongoDB**. The easiest way to set this up is using a free cloud database via MongoDB Atlas.

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new Cluster and a database user with a password.
3. Allow your IP address in the Network Access settings (or use `0.0.0.0/0` to allow all connections).
4. Click "Connect" -> "Connect your application" and copy the connection string.
5. Replace `<password>` with your database user's password, and paste the string into your `server/.env` file as the `MONGO_URI`.

*(Optional: To quickly test the app, you can seed dummy data by running `npm run seed` inside the `server/` directory).*

# 8. Assumptions or Limitations
- **Unified Deployment Architecture**: The server is explicitly configured to serve the compiled Vite frontend from `client/dist` when `NODE_ENV=production`. This assumes you will deploy the app as a single web service (e.g., on Render or Heroku) rather than deploying the frontend separately to Vercel/Netlify.
- **Cloudinary Integration**: It is assumed you have created a folder named `testimonialhub` inside your Cloudinary account. All images uploaded by users will be streamed directly into this folder.
- **Email Verification**: Currently, email verification and password resets simulate sending emails (logging to the console) unless valid SMTP server credentials are provided in the `.env` file.
- **Embed Generator**: The Wall of Love embed widget relies on users pasting an `<iframe>` snippet into their target website. Certain strict website platforms (like some WordPress setups) may block or restrict iframe usage.

Deployment-Render(frontend+backend):
Link:- https://com-bot-project-1.onrender.com/
