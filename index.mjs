import express from 'express';
import cookieParser from 'cookie-parser';
import methodOverride from 'method-override';
import cors from 'cors';
import bindRoutes from './routes.mjs';

// Initialise Express instance
const app = express();
// Set the Express view engine to expect EJS templates
app.set('view engine', 'ejs');

// *** Access-Control-Allow-Origins *** //
// Setting origin to 'true' reflects the request origin,
// as defined by req.header('Origin').
// This sets the response header to tell browsers that the response
// can be exposed to frontend JS code, after receiving pre-flight request
// (or set it to false to disable CORS.)

// *** Access-Control-Allow-Credentials *** //
// CORS requests normally don't include cookies to prevent
// Cross-site-request-forgery (CSRF) attacks.
// When set to true, the request can be made with/will include credentials such as Cookies.

app.use(cors({
  credentials: true,
  origin: true,
}));

// Bind cookie parser middleware to parse cookies in requests
app.use(cookieParser());
// Bind Express middleware to parse request bodies for POST requests
app.use(express.urlencoded({ extended: false }));
// Bind Express middleware to parse JSON request bodies
app.use(express.json());
// Bind method override middleware to parse PUT and DELETE requests sent as POST requests
app.use(methodOverride('_method'));
// Expose the files stored in the public folder
app.use(express.static('public'));

// Bind route definitions to the Express application
bindRoutes(app);

// Set Express to listen on the given port
const PORT = process.env.PORT || 3004;
app.listen(PORT);
