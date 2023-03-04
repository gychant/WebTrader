# syntax=docker/dockerfile:1
FROM node:18-alpine As build
WORKDIR /app
COPY package.json ./
RUN yarn install
COPY public ./public
COPY src ./src
COPY nginx.conf .
COPY project.conf .
RUN yarn run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html

RUN rm /etc/nginx/nginx.conf
COPY --from=build /app/nginx.conf /etc/nginx/

RUN rm /etc/nginx/conf.d/default.conf
COPY --from=build /app/project.conf /etc/nginx/conf.d/default.conf