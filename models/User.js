const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
require('dotenv').config();

const UserSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    organizationName: {
      type: String,
      required: false
    },
    image: {
      type: String,
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false
    },
    isVerified: {
      type: Boolean,
      default: false,
      required: true,
    },
    contactNumber: {
      type: String,
      required: true,
      unique: true
    },
    walletAddress: {
      type: String,
      required: true,
      unique: true
    },
    rating: {
      type: Number,
      default: 0
    },
    pool: {
      type: Schema.Types.ObjectId,
      ref: 'pool',
      required: false,
      autopopulate: true
    },
    categories: [{
      type: Schema.Types.ObjectId,
      ref: 'categories',
      required: false,
      autopopulate: true
    }],
    workExperience: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(parseInt(process.env.SALT_WORK_FACTOR));
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

UserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compareSync(candidatePassword, this.password);
};

UserSchema.plugin(require('mongoose-autopopulate'));

module.exports = mongoose.model('users', UserSchema);
