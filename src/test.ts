import UserModel from './models/UserModel';

const testUser: any = new UserModel({
  firstName: 'Foo',
  lastName: 'Bar',
  username: Math.random().toString(36).substring(5),
  role: 'User',
});

testUser.setPassword('secret');

testUser.save((err: any) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log('Saved');
});
