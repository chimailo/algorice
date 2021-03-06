###########
# BUILDER #
###########

# base image
FROM node:11.12.0-alpine as builder

# set working directory
WORKDIR /usr/src/app

# install app dependencies
ENV PATH /usr/src/app/node_modules/.bin:$PATH

COPY package.json /usr/src/app/package.json

COPY package-lock.json /usr/src/app/package-lock.json

RUN apk --no-cache --virtual build-dependencies add \
    python \
    make \
    g++

RUN npm ci

RUN apk del build-dependencies

# To handle 'not get uid/gid'
RUN npm config set unsafe-perm true

# install app dependencies
RUN npm install react-scripts@2.1.8 -g --silent

# set environment variables
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL $REACT_APP_API_URL
ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

# create build
COPY . /usr/src/app
RUN npm run build


#########
# FINAL #
#########

# base image
FROM nginx:1.17-alpine

# update nginx conf
RUN rm -rf /etc/nginx/conf.d
COPY conf /etc/nginx

# copy static files
COPY --from=builder /usr/src/app/build /usr/share/nginx/html

# expose port
EXPOSE 80

# run nginx
CMD ["nginx", "-g", "daemon off;"]