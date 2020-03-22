import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export interface IUser extends Document {
  id?: string | number,
  username: string,
  password: string,
  email: string,
  role: string,
  setPassword(password: string): void,
  validatePassword(password: string): boolean,
  generateJWT(): string,
  toAuthJSON(): any,
  toBasicJSON(): any,
}

const UserSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, required: true },
}, { timestamps: true });

UserSchema.path('role').validate((value: string) => {
  const roles = ['Admin', 'User'];
  return roles.includes(value);
});

function setPassword(password: string) {
  const hash = bcrypt.hashSync(password, 8);
  this.password = hash;
}

function validatePassword(password: string) {
  return bcrypt.compareSync(password, this.password);
}

function generateJWT() {
  return jwt.sign({
    id: this._id,
    username: this.username,
  }, process.env.secret, { expiresIn: '1h' });
}

function toAuthJSON() {
  return {
    username: this.username,
    token: this.generateJWT(),
    email: this.email,
    role: this.role,
  };
}

function toBasicJSON() {
  return {
    username: this.username,
    email: this.email,
    role: this.role,
  };
}

UserSchema.methods = {
  validatePassword,
  setPassword,
  generateJWT,
  toAuthJSON,
  toBasicJSON,
};

const UserModel = mongoose.model<IUser>('User', UserSchema, 'users');
export default UserModel;
