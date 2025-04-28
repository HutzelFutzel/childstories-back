#!/bin/bash

# Check if NODE_ENV is set to development
if [ "$NODE_ENV" = "development" ]; then
  echo "NODE_ENV is development, preparing Firebase emulators..."

  # Check if Firebase token is provided
  if [ -n "$FIREBASE_TOKEN" ]; then
    echo "Authenticating Firebase CLI using FIREBASE_TOKEN..."
    firebase login:ci --token "$FIREBASE_TOKEN" > /dev/null 2>&1 || {
      echo "Firebase CLI authentication failed."
      exit 1
    }
  else
    echo "FIREBASE_TOKEN not set. Firebase CLI requires authentication."
    exit 1
  fi

  # Start Firebase emulators
  firebase emulators:start --only functions,firestore &
fi

# Execute the default CMD
exec "$@"
e8b1bb21-e929-421b-aede-a74dd7c3686b