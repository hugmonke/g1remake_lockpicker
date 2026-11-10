FROM node:24.21.0
WORKDIR /frontend

COPY package.json /frontend/
# Build time
RUN npm install 

COPY ./public /frontend/public
COPY ./src /frontend/src

# Runtime
CMD ["npm", "start"]