FROM node:22-alpine

WORKDIR /app

# Copy dependency files
COPY package.json yarn.lock ./

# Install dependencies using Node 22 & ignore engines if needed
RUN yarn install --frozen-lockfile --ignore-engines || yarn install --ignore-engines
RUN yarn add -D webpack webpack-cli --ignore-engines

# Copy source code
COPY . .

# Set Webpack memory limit and hardcode placeholders into build
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV REACT_APP_STRIPE_PUBLISHABLE_KEY="__REACT_APP_STRIPE_PUBLISHABLE_KEY__"
ENV VAPID_PUBLIC_KEY="__VAPID_PUBLIC_KEY__"

# Run production Webpack build
RUN npx webpack --mode production --progress

# Prepare runtime entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["npx", "serve", "-s", "dist", "-l", "3000"]
