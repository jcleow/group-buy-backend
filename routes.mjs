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
    bucket: 'groupbuyprojectbucket',
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
  // // Any traffic going into my server can query it
  // app.use((req, res, next) => {
  //   res.header('Access-Control-Allow-Origin', '*');
  //   next();
  // });

  // Middleware that checks if a user is authenticated
  app.use(async (req, res, next) => {
    req.middlewareLoggedIn = false;

    if (req.cookies.loggedInUserId) {
      const hash = convertUserIdToHash(req.cookies.loggedInUserId);

      if (req.cookies.loggedInHash === hash) {
        const { loggedInUserId } = req.cookies;
        // Double check by finding this user in the database
        const chosenUser = await db.User.findByPk(loggedInUserId);
        if (!chosenUser) {
          res.status(503).send('Sorry an error has occurred');
        }
        req.middlewareLoggedIn = true;
        req.loggedInUserId = Number(req.cookies.loggedInUserId);
        req.loggedInUsername = chosenUser.username;
        // If hash is not valid, delete all cookies
      } else {
        res.clearCookie('loggedInHash', { secure: true, sameSite: 'None' });
        res.clearCookie('loggedInUserId', { secure: true, sameSite: 'None' });
        res.clearCookie('loggedInUsername', { secure: true, sameSite: 'None' });
      }
      next();
      return;
    }
    next();
  });

  // Check if user is logged in, else proceed
  const checkLoggedIn = async (req, res, next) => {
    if (req.middlewareLoggedIn === false) {
      res.status(503).send('You are not logged in');
      return;
    }
    next();
  };
  // initialize the controller functions here
  // pass in the db for all callbacks
  const UsersController = initUsersController(db);
  app.put('/signIn', UsersController.signIn);
  app.put('/signOut', UsersController.signOut);
  app.post('/register', UsersController.register);

  const PurchasesController = initPurchasesController(db);
  app.post('/recordPurchase/:listingPK/:qtyOrdered', multerUpload.single('receiptImg'), PurchasesController.recordPurchase);
  app.get('/purchases/count/:listingId', PurchasesController.countPurchasesPerListing);
  // get all purchases to display in MyProfile
  // app.post('/allPurchases', PurchasesController.allPurchases);
  app.post('/allPurchases', checkLoggedIn, PurchasesController.allPurchases);
  app.put('/listing/:currListingId/purchase/:purchaseId/date', PurchasesController.updateDateDelivered);

  const ListingsController = initListingsController(db);
  app.get('/listings', ListingsController.index);
  app.get('/listing/:listingId', ListingsController.getListing);
  // To get all purchases associated with a listing
  app.get('/listing/:listingId/allPurchases', checkLoggedIn, ListingsController.getAllPurchases);
  app.post('/createListing', checkLoggedIn, ListingsController.create);
  // Used multerUpload.array and req files was empty hence use .any() instead.
  // https://stackoverflow.com/questions/46987140/express-multer-upload-doesnt-work
  // Accepts all files that comes over the wire. An array of files will be stored in req.files.
  app.post('/listings/:listingId/uploadCampaignPictures', multerUpload.any('campaignImages'), ListingsController.uploadCampaignPictures);
  app.get('/myListings', checkLoggedIn, ListingsController.myListings);

  // To update an already existing data
  app.post('/listings/:listingId/update', ListingsController.updateListing);
  app.post('/listings/:listingId/update/images', multerUpload.any('campaignImages'), ListingsController.updateListingImages);
}
