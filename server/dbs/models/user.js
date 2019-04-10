import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const userSchema = new Schema({
  username: {
    type: String,
    require: true,
    unique: true
  },
  password: {
    type: String,
    require: true
  },
  email: {
    type: String,
    require: true
  }
});

export default mongoose.model('User', userSchema);
