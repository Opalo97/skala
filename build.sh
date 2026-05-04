#!/bin/bash

echo "Building frontend..."
cd frontend
npm run build
if [ $? -eq 0 ]; then
  echo "Frontend build successful"
  cd ..
  node scripts/move-dist.js
  echo "Build completed successfully!"
else
  echo "Frontend build failed"
  exit 1
fi
