# ChitChat

A real-time chat application with group chat, file sharing, and guest mode. Built with React, Node.js/Express, Socket.io, and MongoDB.

## Prerequisites

- Node.js 20.x
- MongoDB instance
- Cloudinary account (for file/image uploads)

## Environment Setup

Create a `.env` file in the `backend/` directory with the following variables:

```env
MONGO_URI=
PORT=3000
JWT_SECRET=
JWT_EXPIRY=
CLOUDINARY_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLIENT_URL=http://localhost:3000
NODE_ENV=production
STORAGE_TYPE=        # "local", "s3", or "azure"
```

## Running Locally (Development)

```bash
# Install dependencies and build frontend
npm run build

# Start backend (serves built frontend at localhost:3000)
npm start
```

For frontend hot-reload during development:

```bash
cd frontend && npm run dev
cd backend && npm run dev
```

## Running as a Linux Service (systemd)

The repo includes a systemd service file so ChitChat can run as a background service and start automatically on boot.

### Install

```bash
./service-setup.sh install
```

This will:
1. Build the frontend
2. Copy `chitchat.service` to `/etc/systemd/system/`
3. Enable and start the service immediately

### Managing the Service

```bash
sudo systemctl start chitchat      # start
sudo systemctl stop chitchat       # stop
sudo systemctl restart chitchat    # restart after config/code changes
sudo systemctl status chitchat     # check running status
```

### Viewing Logs

```bash
journalctl -u chitchat -f          # live log tail
journalctl -u chitchat --since today
```

### Uninstall

```bash
./service-setup.sh uninstall
```

## Project Structure

```
ChitChat/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── middlewares/
│   │   ├── lib/
│   │   └── index.js
│   └── .env
├── frontend/
│   └── src/
├── chitchat.service       # systemd service unit file
├── service-setup.sh       # install/uninstall helper script
└── package.json
```
