# Use the official Node.js image as a base
FROM node:20.17.0

# Set the working directory
WORKDIR /usr/src/app

# Install Git and SSH client
RUN apt-get update && apt-get install -y git openssh-client && rm -rf /var/lib/apt/lists/*

# Copy package.json and yarn.lock (if using yarn)
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Install Firebase CLI
RUN npm install -g firebase-tools

# Copy the rest of your application code
COPY . .

# Build the TypeScript code
RUN yarn build

ENV PORT 8080
# Expose the port the app runs on
EXPOSE 8080

# Copy the custom entrypoint script
COPY entrypoint.sh /usr/src/app/entrypoint.sh
RUN chmod +x /usr/src/app/entrypoint.sh

# Set the custom entrypoint
ENTRYPOINT ["/usr/src/app/entrypoint.sh"]

# Default command to run the application
CMD ["node", "dist/server.js"]