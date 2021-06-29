import { connect, clearDatabase, closeDatabase } from './db-handler';
import UserModel, { IUser } from '../src/models/UserModel';

beforeAll(async () => connect());

afterAll(async () => closeDatabase());

describe('User Database Tests', () => {
  afterEach(async () => clearDatabase());

  it('can create user', async () => {
    const random = Math.random().toString(36).substring(5);

    const testUser: IUser = new UserModel({
      username: random,
      email: `${random}@test.com`,
      role: 'User',
    });
    testUser.setPassword(random);

    expect(async () => UserModel.create(testUser)).not.toThrow();
  });

  it('can create admin', async () => {
    const random = Math.random().toString(36).substring(5);

    const testUser: IUser = new UserModel({
      username: random,
      email: `${random}@test.com`,
      role: 'Admin',
    });
    testUser.setPassword(random);

    expect(async () => UserModel.create(testUser)).not.toThrow();
  });

  it('can delete user', async () => {
    const random = Math.random().toString(36).substring(5);

    const testUser: IUser = new UserModel({
      username: random,
      email: `${random}@test.com`,
      role: 'User',
    });
    testUser.setPassword(random);

    await testUser.save();

    const del = await UserModel.deleteOne({ username: random });
    expect(del.deletedCount).toBe(1);

    const count = await UserModel.countDocuments({ username: random });
    expect(count).toBe(0);
  });

  it('should not create with a duplicate username', async () => {
    const random = Math.random().toString(36).substring(5);

    const testUser: IUser = new UserModel({
      username: random,
      email: `${random}@test.com`,
      role: 'User',
    });
    testUser.setPassword(random);

    await testUser.save();

    const duplicateTestUser: IUser = new UserModel({
      username: random,
      email: 'test@test.com',
      role: 'User',
    });
    duplicateTestUser.setPassword(random);

    await duplicateTestUser.save((error) => {
      expect(error).not.toBeUndefined();
    });

    const count = await UserModel.countDocuments({});
    expect(count).toBe(1);
  });

  it('should not create with a duplicate email', async () => {
    const random = Math.random().toString(36).substring(5);

    const testUser: IUser = new UserModel({
      username: random,
      email: `${random}@test.com`,
      role: 'User',
    });
    testUser.setPassword(random);

    await testUser.save();

    const duplicateTestUser: IUser = new UserModel({
      username: 'username',
      email: `${random}@test.com`,
      role: 'User',
    });
    duplicateTestUser.setPassword(random);

    await duplicateTestUser.save((error) => {
      expect(error).not.toBeUndefined();
    });

    const count = await UserModel.countDocuments({});
    expect(count).toBe(1);
  });

  it('should not create with a random role', async () => {
    const random = Math.random().toString(36).substring(5);

    const testUser: IUser = new UserModel({
      username: random,
      email: `${random}@test.com`,
      role: random,
    });
    testUser.setPassword(random);

    await testUser.save((error) => {
      expect(error).not.toBeUndefined();
      expect(error.name).toBe('ValidationError');
    });
  });
});
