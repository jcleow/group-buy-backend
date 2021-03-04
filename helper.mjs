import jsSHA from 'jssha';

const SALT = 'hello';

// Function that converts supplied userId into a hash (using a salt)
export default function convertUserIdToHash(userId) {
  const shaObj = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });
  const unhashedCookieString = `${userId}-${SALT}`;
  shaObj.update(unhashedCookieString);
  const hashedCookieString = shaObj.getHash('HEX');
  return hashedCookieString;
}

// Function that hashes a variable
export const hashPassword = (reqBodyPassword) => {
  // Perform hashing of password first
  const shaObj = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });
  shaObj.update(reqBodyPassword);
  const hash = shaObj.getHash('HEX');
  return hash;
};
// Helper that generates and pushes the past 7 days
export const generatePastSevenDays = () => {
  const pastSevenDaysArray = [];
  for (let i = 7; i >= 0; i -= 1) {
    const singleDate = new Date();
    singleDate.setDate(singleDate.getDate() - i);
    const options = { day: '2-digit', month: '2-digit' };
    const formattedDate = singleDate.toLocaleDateString('en-GB', options);
    pastSevenDaysArray.push(formattedDate);
  }
  return pastSevenDaysArray;
};

// Helper that converts a single date into a dd/mm format
export const convertToDdMm = (dateObj) => {
  const options = { day: '2-digit', month: '2-digit' };
  return dateObj.toLocaleDateString('en-GB', options);
};

// Helper that converts a single date into a dd/mm format
export const convertToDdMmYy = (dateObj) => {
  const options = { day: '2-digit', month: '2-digit', year: '2-digit' };
  return dateObj.toLocaleDateString('en-GB', options);
};
