# Use an official Node runtime as the base image
FROM node:latest

# Set the working directory in the container to /app
WORKDIR /usr/src/app

# Copy package.json and package-lock.json into the directory
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Bundle the app source inside the Docker image
COPY . .

# The app listens on port 8080, so let's expose it
EXPOSE 8080

# Define the command to run the app
CMD [ "npm", "start" ]
