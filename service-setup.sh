#!/usr/bin/env bash
set -e

SERVICE_NAME="chitchat"
SERVICE_FILE="$(dirname "$(realpath "$0")")/chitchat.service"
TARGET="/etc/systemd/system/${SERVICE_NAME}.service"

case "${1:-install}" in
  install)
    echo "Building frontend..."
    npm run build --prefix "$(dirname "$SERVICE_FILE")/frontend"

    echo "Installing service..."
    sudo cp "$SERVICE_FILE" "$TARGET"
    sudo systemctl daemon-reload
    sudo systemctl enable "$SERVICE_NAME"
    sudo systemctl start "$SERVICE_NAME"
    echo "Done. Service is running."
    sudo systemctl status "$SERVICE_NAME" --no-pager
    ;;
  uninstall)
    sudo systemctl stop "$SERVICE_NAME" 2>/dev/null || true
    sudo systemctl disable "$SERVICE_NAME" 2>/dev/null || true
    sudo rm -f "$TARGET"
    sudo systemctl daemon-reload
    echo "Service removed."
    ;;
  *)
    echo "Usage: $0 [install|uninstall]"
    exit 1
    ;;
esac
