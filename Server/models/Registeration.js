const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  regNo: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
});

const registrationSchema = new mongoose.Schema({
  teamName: {
    type: String,
    required: true,
  },
  teamLead: {
    name: {
      type: String,
      required: true,
    },
    regNo: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
    },
  },
  
  teamMembers: [teamMemberSchema], // Array of team members
  
  registrationDate: {
    type: Date,
    default: Date.now,
  },
});

const Registration = mongoose.model('Registration', registrationSchema);

module.exports = Registration;
