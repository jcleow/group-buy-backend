import multer from 'multer';
import aws from 'aws-sdk';
import multerS3 from 'multer-s3';
import db from './models/index.mjs';
import convertUserIdToHash from './helper.mjs';
import initUsersController from './controllers/users.mjs';
import initPurchasesController from './controllers/purchases.mjs';
import initListingsController from './controllers/listings.mjs';
import 'dotenv/config.js';

// Set up a new S3 instance
const s3 = new aws.S3({
  accessKeyId: process.env.ACCESSKEYID,
  secretAccessKey: process.env.SECRETACCESSKEY,
});

// Set up multer upload
const multerUpload = multer({
  storage: multerS3({
    s3,
    bucket: 'swe1-group-buy',
    acl: 'public-read',
    metadata: (request, file, callback) => {
      callback(null, { fieldName: file.fieldname });
    },
    key: (request, file, callback) => {
      callback(null, Date.now().toString());
    },
  }),
});

// other resources on multerupload
// comprehensive video: https://www.youtube.com/watch?v=KoWTJ5XiYm4&ab_channel=webnaturesolutions
// --------------------------------------------------

export default function bindRoutes(app) {
  // Middleware that checks if a user is authenticated
  app.use(async (req, res, next) => {
    req.middlewareLoggedIn = false;

    if (req.cookies.loggedInUserId) {
      const hash = convertUserIdToHash(req.cookies.loggedInUserId);

      if (req.cookies.loggedInHash === hash) {
        req.middlewareLoggedIn = true;

        const { loggedInUserId } = req.cookies;
        // Double check by finding this user in the database
        const chosenUser = await db.User.findByPk(loggedInUserId);
        if (!chosenUser) {
          res.status(503).send('Sorry an error has occurred');
        }
        req.loggedInUserId = Number(req.cookies.loggedInUserId);
        req.loggedInUsername = chosenUser.username;
        // If hash is not valid, delete all cookies
      } else {
        res.clearCookie('loggedInHash');
        res.clearCookie('loggedInUserId');
        res.clearCookie('loggedInUsername');
      }
      next();
      return;
    }
    next();
  });

  // initialize the controller functions here
  // pass in the db for all callbacks
  const UsersController = initUsersController(db);
  app.put('/signIn', UsersController.signIn);
  app.put('/signOut', UsersController.signOut);
  app.post('/register', UsersController.register);

  const PurchasesController = initPurchasesController(db);
  app.post('/addReceipt', multerUpload.single('receiptImg'), PurchasesController.addReceipt);
  app.get('/purchases/count/:listingId', PurchasesController.countPurchasesPerListing);

  const ListingsController = initListingsController(db);
  app.get('/listings', ListingsController.index);
  app.post('/createListing', ListingsController.create);
  // Used multerUpload.array and req files was empty hence use .any() instead.
  // https://stackoverflow.com/questions/46987140/express-multer-upload-doesnt-work
  // Accepts all files that comes over the wire. An array of files will be stored in req.files.
  app.post('/uploadCampaignPictures', multerUpload.any('campaignImages'), ListingsController.uploadCampaignPictures);
}
