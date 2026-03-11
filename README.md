# Gimsoi Project Tracker
Internal delivery and client transparency system for Gimsoi (Pty) Ltd

---

## Project Tracker Setup

Guide on how to set up the app

> **Mac user?** The download links below are for Windows - paste them into ChatGPT and ask for the Mac equivalents.

## Step 1 - Install the Required Tools

Download and install each of these (skip any you already have):

| Tool | What it does | Download |
|------|-------------|----------|
| Node.js | Runs the app | [Download Node](https://nodejs.org) |
| Git | Copies the code to your computer | [Download Git](https://git-scm.com) |
| VS Code | Code editor (where you'll work) | [Download VS Code](https://code.visualstudio.com) |


## Step 2 - Copy the Repo to Your Computer

1. Go to the company repo on GitHub
2. Click the green `< Code >` button and copy the link shown
3. Open a terminal in VS Code and run these commands one by one:

```bash
git clone https://github.com/Gimsoi-pty-ltd/gimsoi-project-tracker.git
cd gimsoi-project-tracker
```

> 💡 **Need a specific branch?**
> ```bash
> # Pull the latest changes
> git fetch origin main
> 
> # Switch to a specific branch (replace <branch> with the branch name)
> git checkout <branch>
> ```


## Step 3 - Run the Frontend

Open a terminal and run:

```bash
cd apps/frontend
npm install       # installs dependencies
npm run dev       # starts the app
```

Then click the localhost link that appears in the terminal.

---

## Step 4 - Run the Backend

Open a **second terminal** (keep the frontend one running) and run:

```bash
cd apps/backend
npm install       # installs dependencies
```

###  First time only - Set up your `.env` file

The backend needs a config file with your credentials. Create it by running:

```bash
touch .env
```

Then open the new `.env` file and add each of the following values:


### `.env` Field Reference

#### `PORT`
The port the backend API runs on. Leave this as-is unless something else on your machine is already using port 5001.
```
PORT=5001
```


#### `NODE_ENV`
Tells the app which mode it's running in. Leave this as `development` on your local machine.
```
NODE_ENV=development
```


#### `JWT_SECRET`
A secret key used to sign login tokens. This must be a long, random string — **never share it or commit it to Git.**

Generate one by running this command in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Copy the output and paste it as the value:
```
JWT_SECRET="paste-your-generated-string-here"
```


#### `DATABASE_URL`
The connection string for your Prisma database.

To get it:
1. Go to [console.prisma.io](https://console.prisma.io)
2. Open your project
3. Click **Connect**
4. Copy the connection string and paste it in:

```
DATABASE_URL=your-connection-string-here
```


#### `GMAIL_USER`
The Gmail address the app uses to send emails (e.g. for password resets or notifications).
```
GMAIL_USER=youremail@gmail.com
```


#### `GMAIL_APP_PASSWORD`
A special password that lets the app send emails via Gmail. **This is NOT your regular Gmail password.**

To generate one:
1. Go to [myaccount.google.com](https://myaccount.google.com/apppasswords)
2. Navigate to **Security → 2-Step Verification → App passwords**
3. Create a new app password and paste it in:

```
GMAIL_APP_PASSWORD=your-16-character-app-password
```

> 2-Step Verification must be enabled on your Google account before App Passwords will appear.


#### `CLIENT_URL`
The address of the frontend app. Leave this as-is for local development — it matches the default Vite dev server port.
```
CLIENT_URL=http://localhost:5173
```


### Your completed `.env` should look like this:

```
PORT=5001
NODE_ENV=development
JWT_SECRET="your-generated-secret"
DATABASE_URL=your-prisma-connection-string
GMAIL_USER=youremail@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password
CLIENT_URL=http://localhost:5173
```

> **Still stuck?** Copy the contents of `.env.example` into ChatGPT and ask it to walk you through each field.


### Start the backend

```bash
npm start          # runs the API
# or
npm run test:api   # tests the API
```


## You're Done!

With both terminals running, open the frontend link in your browser. You can now create an account and log in.

> **Something not working?** Copy the error message into ChatGPT - it'll help you fix it fast.
