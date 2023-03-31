const { parsePhoneNumber } = require('libphonenumber-js');

const parseNumber = (contactNumber) => {
  if (contactNumber) {
    const phoneNumber = parsePhoneNumber(contactNumber);
    if (phoneNumber) {
      return phoneNumber.number;
    } else {
      throw 'Invalid Contact Number';
    }
  }
};
exports.parseNumber = parseNumber;