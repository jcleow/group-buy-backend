import db from './models/index.mjs';
import convertUserIdToHash from './helper.mjs';
import initUsersController from './controllers/users.mjs';
import initPurchasesController from './controllers/purchases.mjs';
import initListingsController from './controllers/listings.mjs';
// import your controllers here

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

  const ListingsController = initListingsController(db);
  app.get('/listings', ListingsController.index);
  app.post('/createListing', ListingsController.create);
}
