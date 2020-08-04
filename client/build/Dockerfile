FROM node:current-slim AS build

WORKDIR /app

COPY ./package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:latest

WORKDIR /usr/share/nginx/html

COPY --from=build /app/dist/* ./
COPY --from=build /app/build/nginx/nginx.prod.conf /etc/nginx/nginx.conf
