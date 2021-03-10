import jsSHA from 'jssha';
import convertUserIdToHash, { hashPassword } from '../helper.mjs';

const domainOption = { domain: 'groupbuy.site' };

export default function initUsersController(db) {
  const checkLoggedIn = (req, res) => {
    const { loggedInUserId, loggedInUsername } = req.cookies;
    if (loggedInUserId) {
      res.send({ auth: true, username: loggedInUsername });
      return;
    }
    res.send({ auth: false });
  };

  const signIn = async (req, res) => {
    const { usernameInput, passwordInput } = req.body;

    // Perform hashing of password
    const hashedPassword = hashPassword(passwordInput);
    try {
      const selectedUser = await db.User.findOne({
        where: {
          username: usernameInput,
          password: hashedPassword,
        },
      });
      if (!selectedUser) {
        res.send({ auth: false });
        return;
      }
      // { domain: 'group-buy-app-7087.herokuapp.com', secure: true, sameSite: 'None' }
      if (process.env.NODE_ENV === 'production') {
        res.cookie('loggedInUsername', selectedUser.username, domainOption);
        res.cookie('loggedInUserId', selectedUser.id, domainOption);
        res.cookie('loggedInHash', convertUserIdToHash(selectedUser.id), domainOption);
      } else {
        res.cookie('loggedInUsername', selectedUser.username);
        res.cookie('loggedInUserId', selectedUser.id);
        res.cookie('loggedInHash', convertUserIdToHash(selectedUser.id));
      }
      res.send({ auth: true, user: selectedUser });
    } catch (err) {
      console.log(err);
    }
  };

  const signOut = async (req, res) => {
    if (process.env.NODE_ENV === 'production') {
      res.clearCookie('loggedInHash', domainOption);
      res.clearCookie('loggedInUserId', domainOption);
      res.clearCookie('loggedInUsername', domainOption);
    } else {
      res.clearCookie('loggedInHash');
      res.clearCookie('loggedInUserId');
      res.clearCookie('loggedInUsername');
    }
    res.send({ message: 'signed out' });
  };

  const register = async (req, res) => {
    const {
      username, password, email, handphoneNum,
    } = req.body;

    // First hash the password
    const shaObj = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });
    shaObj.update(password);
    const hashedPassword = shaObj.getHash('HEX');

    // Next create a new user
    const newUser = await db.User.create({
      username,
      password: hashedPassword,
      email,
      handphoneNum,
    });

    // Send cookies
    if (process.env.NODE_ENV === 'production') {
      res.cookie('loggedInUsername', newUser.username, domainOption);
      res.cookie('loggedInUserId', newUser.id, domainOption);
      res.cookie('loggedInHash', convertUserIdToHash(newUser.id), domainOption);
    } else {
      res.cookie('loggedInUsername', newUser.username);
      res.cookie('loggedInUserId', newUser.id);
      res.cookie('loggedInHash', convertUserIdToHash(newUser.id));
    }
    res.send({ auth: true, user: newUser });
  };

  return {
    signIn,
    signOut,
    checkLoggedIn,
    register,
  };
}
