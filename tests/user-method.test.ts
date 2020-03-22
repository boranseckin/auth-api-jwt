import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import UserModel, { IUser } from '../src/models/UserModel';

describe('User Method Tests', () => {
  it('can set password', async () => {
    const testUser: IUser = new UserModel();

    const randomPassword = Math.random().toString(36).substring(5);
    testUser.setPassword(randomPassword);

    expect(testUser.password).toBeDefined();
    expect(bcrypt.compareSync(randomPassword, testUser.password)).toBeTruthy();
  });

  it('can validate password', async () => {
    const testUser: IUser = new UserModel();

    const randomPassword = Math.random().toString(36).substring(5);
    testUser.setPassword(randomPassword);

    expect(testUser.password).toBeDefined();
    expect(testUser.validatePassword(randomPassword)).toBeTruthy();
  });

  it('can generate JWT', async () => {
    const testUser: IUser = new UserModel();

    const randomID = Math.random().toString(36).substring(5);
    const randomUsername = Math.random().toString(36).substring(5);

    testUser.id = randomID;
    testUser.username = randomUsername;

    const token = testUser.generateJWT();
    expect(jwt.verify(token, process.env.secret)).toBeTruthy();
  });

  it('can create Basic JSON', async () => {
    const testUser: IUser = new UserModel();

    const randomUsername = Math.random().toString(36).substring(5);
    const randomEmail = Math.random().toString(36).substring(5);
    const randomrole = Math.random().toString(36).substring(5);

    testUser.username = randomUsername;
    testUser.email = randomEmail;
    testUser.role = randomrole;

    const basicJSON = testUser.toBasicJSON();
    expect(basicJSON.username).toBe(randomUsername);
    expect(basicJSON.email).toBe(randomEmail);
    expect(basicJSON.role).toBe(randomrole);
  });

  it('can create Auth JSON', async () => {
    const testUser: IUser = new UserModel();

    const randomUsername = Math.random().toString(36).substring(5);
    const randomEmail = Math.random().toString(36).substring(5);
    const randomrole = Math.random().toString(36).substring(5);

    testUser.username = randomUsername;
    testUser.email = randomEmail;
    testUser.role = randomrole;

    const authJSON = testUser.toAuthJSON();
    expect(authJSON.username).toBe(randomUsername);
    expect(authJSON.email).toBe(randomEmail);
    expect(authJSON.role).toBe(randomrole);
    expect(jwt.verify(authJSON.token, process.env.secret)).toBeTruthy();
  });
});
