import multer from 'multer';
import db from './models/index.mjs';
import convertUserIdToHash from './helper.mjs';
import initUsersController from './controllers/users.mjs';
import initPurchasesController from './controllers/purchases.mjs';
import initListingsController from './controllers/listings.mjs';
// import your controllers here

// multer settings for local deployment (From Alvin) ------------------------
// set the name of the upload directory and filename of uploaded photos here for multer
// more info on whys of using multer.diskStorage (see steps 5-6): https://medium.com/@svibhuti22/file-upload-with-multer-in-node-js-and-express-5bc76073419f
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'public/images/');
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.fieldname}-${file.originalname}`);
  },
});

// // using the configuration in the storage varible, generate a middleware to process
// // multiple files for the field names 'payment' and 'product photos'
// // to upload images of a request's payment details and product photos respectively
// // the `Request` object will be populated with a `files` object which
// // maps each field name to an array of the associated file information objects.
const multerUpload = multer({ storage });

// other resources on multerupload
// comprehensive video: https://www.youtube.com/watch?v=KoWTJ5XiYm4&ab_channel=webnaturesolutions
// --------------------------------------------------

export default function bindRoutes(app) {
  app.use(async (req, res, next) => {
    req.middlewareLoggedIn = false;

    if (req.cookies.loggedInUserId) {
      const hash = convertUserIdToHash(req.cookies.loggedInUserId);

      if (req.cookies.loggedInHash === hash) {
        req.middlewareLoggedIn = true;
      }

      const { loggedInUserId } = req.cookies;
      // Find this user in the database
      const chosenUser = await db.User.findOne({
        where: {
          id: loggedInUserId,
        },
      });
      if (!chosenUser) {
        res.status(503).send('Sorry an error has occurred');
      }
      req.middlewareLoggedIn = true;
      req.loggedInUserId = Number(req.cookies.loggedInUserId);
      req.loggedInUsername = chosenUser.username;
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
  app.post('/allPurchases', PurchasesController.allPurchases);

  const ListingsController = initListingsController(db);
  app.get('/listings', ListingsController.index);
  app.post('/createListing', ListingsController.create);
}
