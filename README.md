# auth-api-jwt

[![Build Status](https://travis-ci.com/boranseckin/auth-api-jwt.svg?branch=master)](https://travis-ci.com/boranseckin/auth-api-jwt) ![Docker Cloud Build Status](https://img.shields.io/docker/cloud/build/boranseckin/auth-api-jwt) [![codecov](https://codecov.io/gh/boranseckin/auth-api-jwt/branch/master/graph/badge.svg)](https://codecov.io/gh/boranseckin/auth-api-jwt)

This is a REST API written in Typescript using Express. It handles authentication and authorization. It has a security layer provided by JSON Web Token. API uses MongoDB to store the user data. In order to use the server, you have to connect to a database.

## Usage
Clone the repository to your machine.

Pull the `mongo` image from the Docker Hub and run it with `-v ~/data:/etc/db` to use a local volume. Configure the authentication as such you will have a username and password for a database to be used by the API.

Once you successfully configured the MongoDB create a `docker-compose.yml` file using the example below. You have to change `<DB NAME>`, `<DB USERNAME>`, `<DB PASSWORD>` to match your authentication credentials.

In order to use JWT, you have to specify a secret string. Change the `<JWT SECRET>` to a secret of your choice.

Once your compose file is ready, run `docker-compose up`.

Example `docker-compose.yml` file:
```
version: '3'
services:
  mongodb:
    image: mongo:latest
    command: [--auth]
    container_name: mongodb
    volumes:
      - ~/data:/data/db
    ports:
      - "27017:27017"
  web:
    image: boranseckin/auth-api-jwt
    container_name: app
    depends_on:
      - mongodb
    environment:
      - NODE_ENV=production
      - PORT=3000
      - dbUrl=mongodb
      - dbPort=27017
      - dbName=<DB NAME> # TODO: change this
      - dbUsername=<DB USERNAME> # TODO: change this
      - dbPassword=<DB PASSOWRD> # TODO: change this
      - secret=<JWT SECRET> # TODO: change this
    ports:
      - "3000:3000"
```

## Routes

#### Auth - /api/auth
- `POST /signup`: Used to signup a new user.
    - Required body:
        `user: {
          username: "string",
          email: "string",
          password: "string"
        }`
    - Returns: Object of user info with JWT token.

- `POST /login`: Used to login as an existing user.
    - Required body:
        `user: {
          username: "string" | email: "string",
          password: "string"
        }`
    - Returns: Object of user info with JWT token.
        
#### Users - /api/users
- `GET /`: Used to return the currnet user's information.
    - Required Authorization request header as a Bearer JWT token. `Bearer <token>`
    - Returns:
      - Object of the current user's info if the request is made by a regular user.
      - Object of all users' info if the request is made by an admin user.

- `GET /:username`: Used to return a user's info.
    - Required Authorization request header as a Bearer JWT token. `Bearer <token>`
    - Returns:
      - Object of the current user's info if the request is made by a regular user and the user is itself.
      - Object of the user's info if the request is made by an admin user.

- `DELETE /:username`: Used to delete a user.
    - Required Authorization request header as a Bearer JWT token. `Bearer <token>`
    - Returns: Username of the deleted user if the request is made by an admin user.
    
## Author
- Boran Seckin
