FROM node:current-slim AS build

WORKDIR /app

COPY ./package*.json ./

RUN npm install
RUN ls -al

COPY . .

RUN npm run build
RUN ls -al

FROM nginx:latest

WORKDIR /usr/share/nginx/html

COPY --from=build /app/dist/* ./
