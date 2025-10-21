#!/bin/bash

echo "Force killing existing processes..."

# Kill processes for all uba1-uba10
for i in {1..10}; do
    if [[ "$i" -eq 1 ]]; then
        pkill -9 -f "ubabearerbulkbox"
        pkill -9 -f "ubasmsbulkbox"
    else
        pkill -9 -f "ubabearerbulkbox$i"
        pkill -9 -f "ubasmsbulkbox$i"
    fi
done

# Wait a few seconds to ensure processes are killed
sleep 2

echo "Processes stopped. Restarting..."

# Restart each service for uba1 to uba10
for i in {1..10}; do
    # Set correct folder and process names
    if [[ "$i" -eq 1 ]]; then
        FOLDER="ubabulk1"
        BEARERBOX="ubabearerbulkbox1"
        SMSBOX="ubasmsbulkbox1"
    else
        FOLDER="ubabulk$i"
        BEARERBOX="ubabearerbulkbox$i"
        SMSBOX="ubasmsbulkbox$i"
    fi

    echo "Starting $BEARERBOX in $FOLDER..."
    /var/www/html/kannel/$FOLDER/gw/$BEARERBOX -v 1 /var/www/html/kannel/$FOLDER/gw/smskannel.conf > /var/www/html/kannel/logs/$BEARERBOX.log 2>&1 &

    # Wait a few seconds to ensure bearerbox starts
    sleep 3

    # Check if bearerbox is running before starting smsbox
    if pgrep -f "$BEARERBOX" > /dev/null; then
        echo "Starting $SMSBOX in $FOLDER..."
                 /var/www/html/kannel/$FOLDER/gw/$SMSBOX -v 1 /var/www/html/kannel/$FOLDER/gw/smskannel.conf > /var/www/html/kannel/logs/$SMSBOX.log 2>&1 &
    else
        echo "❌ $BEARERBOX failed to start in $FOLDER! Check logs."
        exit 1
    fi

    # Wait a few seconds and check if smsbox started
    sleep 3
    if ! pgrep -f "$SMSBOX" > /dev/null; then
        echo "❌ $SMSBOX failed to start in $FOLDER! Check logs: /var/www/html/kannel/logs/$SMSBOX.log"
        exit 1
    fi

    echo "✅ Restarted $BEARERBOX and $SMSBOX successfully in $FOLDER!"
done

echo "✅ All processes restarted successfully!"