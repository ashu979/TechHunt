const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  role:{
    type:String,
    required:true,
    default:"User"
  },
  answerRecord: {
    ques1: {
      type: Number
    },
    ques2: {
      type: Number
    },
    ques3: {
      type: Number
    },
    ques4: {
      type: Number
    }
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;