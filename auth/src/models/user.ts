import mongoose from 'mongoose';
import { Password } from '../services/password';

// Interface that describe properties 
// that are required to create new user
interface UserAttrs {
  email: string;
  password: string;
}

// Interface that describe the properties 
// that User Model has
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

// Interface that describes the properties 
// that User Document has
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;

      delete ret.password;
      delete ret.__v;
    }
  }
});

// middlware in mongoose need to call done() once the hook finished
// use function keyword so that this will refer to document being saved
// arrow function will refer this to the context of entire file
userSchema.pre('save', async function(done) {
  // return true if password is created / modified
  if (this.isModified('password')) {
    const hashed = await Password.toHash(this.get('password'));
    this.set('password', hashed);
  }
  done();
});

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs)
}

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };