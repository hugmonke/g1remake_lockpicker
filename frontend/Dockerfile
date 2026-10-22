# Use an official Node runtime as a parent image
FROM node:24.21.0

# Set the working directory in the container
WORKDIR /frontend

# Copy the package.json and install dependencies
COPY package.json /frontend/
RUN npm install

# Bundle app source including the public and src directories
COPY ./public /frontend/public
COPY ./src /frontend/src

# Make port 3000 available to the world outside this container
# EXPOSE 3000

# Run npm start when the container launches
CMD ["npm", "start"]