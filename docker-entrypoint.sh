#!/bin/sh
set -e

# Fallback to placeholder names if variables aren't provided
STRIPE_KEY="${REACT_APP_STRIPE_PUBLISHABLE_KEY:-__REACT_APP_STRIPE_PUBLISHABLE_KEY__}"
VAPID_KEY="${VAPID_PUBLIC_KEY:-__VAPID_PUBLIC_KEY__}"

echo "=========================================="
echo "Injecting runtime keys into dist files..."
echo "=========================================="

find /app/dist -type f \( -name "*.js" -o -name "*.html" \) \
  -exec sed -i "s|__REACT_APP_STRIPE_PUBLISHABLE_KEY__|$STRIPE_KEY|g" {} + \
  -exec sed -i "s|__VAPID_PUBLIC_KEY__|$VAPID_KEY|g" {} +

echo "Keys injected successfully. Starting app..."
exec "$@"
