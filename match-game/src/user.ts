function convert2to10(stringBinary: string) {
  let count = 0;
  let sum = 0;
  for (let i = stringBinary.length - 1; i >= 0; i -= 1) {
    sum += 2 ** count * Number(stringBinary[i]);
    count += 1;
  }
  return sum;
}

function convertHashIn32bit(number: number) {
  let stringBinary = number.toString(2);
  let sum: number;
  let modifier = 1;
  if (stringBinary[0] === '-') {
    modifier = -1;
    stringBinary = stringBinary.slice(1);
  }
  if (stringBinary.length < 32) {
    sum = convert2to10(stringBinary);
  } else {
    stringBinary = stringBinary.slice(stringBinary.length - 32);
    if (stringBinary[0] === '0') {
      sum = convert2to10(stringBinary);
    } else {
      stringBinary = stringBinary.slice(1);
      sum = 2 ** 32 / -2 + convert2to10(stringBinary);
    }
  }
  return sum * modifier;
}

export default class User {
  firstName: string;

  lastName: string;

  email: string;

  avatar: string;

  hash: number;

  static currentUser: User;

  constructor(firstName: string, lastName: string, email: string, avatar: string) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.avatar = avatar;
    this.hash = User.hashCode(firstName, lastName, email);
  }

  static hashCode(firstName: string, lastName: string, email: string) {
    let hash = 0;
    const stringForHash = (firstName + lastName + email).toLowerCase();
    for (let i = 0; i < stringForHash.length; i += 1) {
      const chr = stringForHash.charCodeAt(i);
      hash = hash * 2 ** 5 - hash + chr; // origin => hash = (hash << 5)- hash + chr;
      hash = convertHashIn32bit(hash); // origin => hash |= 0;
      // Convert to 32bit integer, otherwise it could be really big numbers
    }
    return hash;
  }
}
