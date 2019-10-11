# Get node image.
FROM node:12.7.0

# Create bot directory.
WORKDIR /usr/src/app

# Install bot dependencies.
COPY .env ./
COPY package.json ./
COPY yarn.lock ./
RUN yarn install

# Bundle bot source.
COPY . .

# Expose port 3000 for receiving webhook events.
EXPOSE 3000

# Build bot.
CMD ["yarn", "build"]

# Start bot.
CMD ["yarn", "start"]