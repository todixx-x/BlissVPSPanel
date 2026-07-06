# BlissPanel

BlissPanel is a lightweight, self-hosted web panel for managing Ubuntu VPS and Docker containers.

## Features
- **Dashboard**: Real-time system metrics (CPU, RAM, Disk).
- **Docker Control**: Manage containers and view logs.
- **File Manager**: Web-based file browser and editor.
- **Terminal**: Secure embedded PTY terminal.

## Architecture
- **Backend**: Go (Golang) - Single binary, low overhead.
- **Frontend**: React + Tailwind CSS + Xterm.js.

## Installation

### Using Docker (Recommended)
```bash
docker-compose up -d --build
```

### Manual Installation
Run the install script as root:
```bash
sudo ./install.sh
```

## Development
### Backend
```bash
cd backend
go run .
```

### Frontend
```bash
cd frontend
pnpm dev
```
