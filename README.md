# auth-api-jwt

[![Build Status](https://travis-ci.com/boranseckin/auth-api-jwt.svg?branch=master)](https://travis-ci.com/boranseckin/auth-api-jwt) ![Docker Cloud Build Status](https://img.shields.io/docker/cloud/build/boranseckin/auth-api-jwt) [![codecov](https://codecov.io/gh/boranseckin/auth-api-jwt/branch/master/graph/badge.svg)](https://codecov.io/gh/boranseckin/auth-api-jwt)

This is a REST API written in Typescript using Express. It handles authentication and authorization. It has a security layer provided by JSON Web Token.

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
