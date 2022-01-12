## Express, Node, and MongoDB Example in Typescript

This is based on the tutorial by TomDoesTech called [Build a REST API with Node.js, Express, TypeScript, MongoDB & Zod](https://www.youtube.com/watch?v=BWUi6BS9T5Y).

### Objective

Create a user, create a way to login, get sessions, and logout. Then create a product that you can get, update and delete. You can only update and delete the product if you are the user that created the product.

## Structure
___
1. It will follow a RCSM pattern with Routes leading to a Controller which calls a service, that then uses the model to connect to the database layer.
1. A 'utils' folder will be creted for utilities. A logger to log info and errors with timestamps will be created, a connect.ts will be created to connect to the database and a jwt.utils.ts will be created to write the code to sign and verify jason web tokens which will be used for authorization.
1. A middleware folder will be created for a deserializeUser.ts which will take the accessToken and the refreshToken from the request Headers and verify them, finds the user associated with the token and assigns the user to res.locals.user. Then a requireUser.ts will also be created which requires there to be be a res.locals.user for access to parts of the site that requires someone to be logged in.
1. A config folder will be created with a default.ts which contains several variables that go into the server that you don't necessarily want being public like the privateKey, publicKey, port, accesTokenTimeToLive, refreshTokenTimeToLive.

## Note
This repository does not have the config folder and the node_modules folder. npm install will install all the node modules. But for the config, you'll have to read the approach and put the relevant variables and data in the default.ts file.

## Approach

### Setup & Utilities
___

1. Create a folder for the program by using mkdir in your terminal.
1. Cd into the folder and then use npm init -y to create a package.json for your node environment.
1. Then run the following commands to install all the necessary packages for the node express mongoDB server
    ```
    yarn add express zod config cors express mongoose pino pino-pretty dayjs bcrypt jsonwebtoken lodash nanoid
    ```
    Then run the following to add the developer dependencies and the types for those packages
    ```
    yarn add @types/body-parser @types/config @types/cors @types/express @types/node @types/pino @types/mongoose @types/bcrypt @types/jsonwebtoken @types/lodash @types/nanoid ts-node-dev typescript -D
    ``` 
1. Be sure to create the tsconfig.ts with the following terminal command:
    ```
    tsc --init
    ```
1. Start the database part by setting up the MongoDB server on Atlas (just google Mongodb Atlas). You can create a free account, and then start a basic database (should be free). 
1. Make sure you make the access from anywhere option active in the Network access tab. Then go to the connect button on the homepage of atlas for the cluster and then click the connect your application option and copy the string where the option is Node.js. 
1. Come to your developer folder mkdir and create a folder called config. Within it create a file called default.ts by using the touch default.ts command.
1. Within this default.ts create an object that you export as default with the url that you copied earlier from Atlas as 'mongo_uri'. It should look something like:
    ```
    export default {
        mongo_uri: 'mongodb+srv://username:<password>@cluster0.11io9.mongodb.net/databasename?retryWrites=true&w=majority',
    }
    ```
    Change the username, password and insert your databasename sections to the values that you want. You would have set the username and password in the database access part of your atlas while setting up your database. Else go to atlas and set that up.
1. Run the following commands to generate private and public keys in your terminal:
    ```
    openssl genrsa -out private.pem 2048
    ```
    Then run:
    ```
    openssl rsa -in private.pem pubout -out public.pem
    ```
    This will create two files a private.pem which will have your privateKey and a public.pem which will have your private key. You'll need this to generate and verify your jason web tokens respectively.
1. Copy the private key and put it as a property within the object exported from the default.ts file in the config folder. Do the same with the public key and then delete the private.pem and the public.pem files.
1. Add the port number that you'll use in connecting to your database. Have this be 4000 at the beginning. Put this in as a property in the default.ts file. Also add an accessTokenTtl (time the access jwt token lives): "15m" should be good. Access tokens should be short in duration. And a refreshTokenTtl of longer duration like "1y".
1. Also create a property called saltWorkFactor and set it to the number 10. This will be used to hash your passwords when storing it in your database.
1. Within the root folder of the server, create a utils folder and within it create a file called logger.ts. This will be used to log things in the server but with a timestamp.
1. Import logger from "pino" and dayjs from "dayjs". Create a const log that has a base, prettyPrint and timestamp property. Note that timestamp takes a function which in the return uses the dayjs().format() and the base takes an object with a property of pid: which is set to false. prettyPrint takes a boolean which will be true. Then export default log.
1. Within the same utils folder create a file called connect.ts. This will be used to connect to the database. This file should have a connectDb function.
1. Import log from "../logger" and mongoose from "mongoose".
1. connectDb is an async function that takes a url. Then within a try catch it awaits mongoose.connect(url). Then log.info that the database is connected or in the catch log.errors that the database could not be connected.
1. Be sure to export default connectDb from the connect.ts.
1. Now create the utility to sign and verify the jasonwebtokens called jwt.utils.ts within the utils folder.
1. This will have two functions a signJwt function and a verifyJwt function, both of which are exported.
1. This requires import of config from "config", jwt from "jsonwebtoken" and log from "../logger".
1. First get the privateKey and the publicKey from config using config.get\<string>("privateKey") and likewise for the publickey and assing them to variables. 
1. Then write the signJwt function that takes a (object: Object, options: jwt.SignOptions | undefined). This function returns a jwt.sign(object, privateKey, {...(options && options), algorithm: 'RSA256'}) within a try catch.
1. Then write a verifyJwt that takes a token:string with a try catch in it. const decoded is jwt.verify(token). Then return an object with the parameters. valid: true, expired: false, decoded. In the catch return an object with valid: false, expired: e.message === 'jwt expired' and decoded: null.
1. That completes all the utils.

### Create app.ts, create routes.ts and do a healthcheck
___
1. Create an app.ts. Within this create a const app = express(). The express is imported from express.
1. Use express.json() as a middleware to process form data that's in JSON.
1. Create a port that is imported form config. 
1. Create an async 'start' function within a try catch that connects to the database and then gets the app to listen to the port. Log the error. Then run the start function. 
1. Create a routes.ts in the root folder.
1. In the routes.ts create a routes function that is export defaulted. It should take in an "app" of type {Express} imported from "express".
1. Within the routes function set the route to '/healthcheck', and create a function that takes in a req, res and returns res.sendStatus(200). 

### Create User
___
1. Create a folder called model. Within it create a file called user.model.ts. This will have a userSchema which is a mongoose schema which will feed into the mongoose Model. Before the schema is fed into the mongoose Model, the password will be hashed and comparePassword method will be added to the schema. The file will also have two typescript interfaces UserInput and UserDocument. UserInput has the inputs that will be put into create a user and the UserDocument will have the additional createdAt, updatedAt and comparePassword functions. 
1. Import mongoose from "mongoose", bcrypt from "bcrypt" and config from "config".
1. Create the two typescript interfaces. UserDocument will extend UserInput and mongoose.Document. The comparePassword method will take candidatePassword of type string and return a Promise\<Boolean>.
1. Note that typescript interfaces take primitive types like string and number in lowercase (non primitives like Date can be capitalized), but in mongoose Schema that case of String and Number are capitals.
1. For the mongoose schema, you need to create a "new mongoose.Schema. Within the schema each userinput category is a property that is set equal to an object with a property of type, required, unique, default etc.
1. Next we hash the password by doing userSchema.pre("save", async function(next)). NOTE: The async function must not be an arrow function (because arrow functions have lexical scoping and regular functions will take the parent object for "this".). Within the object const user is this as UserDocument. Then if the !user.isModified("password"), then next(). Then create a salt variable that uses bcrypt and the saltWorkFactor from bcrypt to create a salt. Then in the next using bcrypt.hashSync create a hashed. Then replace the password with hashed and then return next().
1. Create the comparePassword method with userSchema.methods.comparePassword and set it equal to a function (not arrow function). In the function set const user = this as UserDocument. Uses bcrypt.compare(candidatePassword, user.password). Attach a catch to it and return false.
1. Next create a folder called service. Create a file called user.service.ts. The purpose of this is to make a creatUser, validatePassword and findUser function. A userType also needs to be made for the input in the createUser function.
1. In the createUser function in a try, catch call the create method on the UserModel imported from "../model/user.model". return omit(user, "password") with omit imported from lodash so that the returned object doesn't contain the password entered.
1. In the catch segment, throw a new Error(e). This could be caught later in the controller.
1. The verifyPassword method takes an object with email and password. First use the UserModel to findone to see if a user exits, if they can then use the comparePassword method from userModel to see if it's valid. If it is use omit from lodash to return the user without the password.
1. Use the findOne to findUser and return a lean version of it in the findUser method. It takes a query of type FilterQuery (from mongoose) which takes a \<UserDocument>. The lean version returns a POJO (Plain old javascript object) because it will be called by another function.  
1. Make sure every function in the service is async and exported or the code will malfunction.
1. Create a folder called controller and create a user.controller.ts within it. It will have just one function called createUserHandler. 
1. This function takes a req: of type Request<{}, {}, UserInput> where the first is the params, the second is the response body and the third is the request body. Within a try, catch call the createUser function from user.service. If user then res.send(user). In the catch res.status(403).send(e). Export the createUserHandler and make sure it's an async function. Always await when the userModel has been called.
1. Create a folder called schema and create a user.schema.ts. In it create a variable called createSessionSchema that takes an object imported from zod. The object has a body property which also takes an object. From it there is email, which is of string (imported from zod) which takes an object with required_error. Then a .email() with the error mentioned within. Also include a name property, a password property, and a confirmPassword property. Then a refine method is attached to the object under the body property. This takes a function with data as input and the data.password === data.passwordConfirmation. The second input into the method is an object that mentions the error message as a message property and a path property that takes an array with one value of the path within i.e. ['passwordConfirmation']. Export default this schema.
1. Create a folder called middleware and a file within called validateResource.ts. Create a validateResource function which takes schema of type AnyZodObject imported from Zod and that in turn takes a req, res, and next. Then within a try catch do schema.parse({}) the body, params, and query of req then return next. If catch, res.status(400).send(\`Error: ${e}`).
1. Export default validateResource.
1. In the routes file, mention the route to create user at '/api/v1/user' and with a post method add the middleware validateResoure(createUserSchema). The createUserSchema is imported from user.schema.ts from the schema folder. Then call the createUserHandler function.
1. Test the route with thunderclient using a name, email, password and passwordConfirmation at the api endpoint.

### Create Session
___
1. In the session model, create a session schema which will take a user of type mongoose.Schema.Types.ObjectId, with a ref of "User", also have a valid (boolean), userAgent (string). The valid can default to true.
1. In the session service have a service to createSession, which returns a session.toJSON() from the session model. Have a findSessions which gets all the sessions that are valid of a particular user, have an updateSession which finds a session and updates it. 
1. Have a reissueAccessToken function that takes in a refreshToken then checks for the validity of the refreshToken, then checks if the decoded object from the verification has a session associated with it.
1. If the session exists and is valid, then find the user that is associated with that session using findUser (from user service).
1. Finally sign a jwt with the user, and the sessionId and return the accessToken from the function.
1. Ensure all the functions are exported from the service.
1. In the controller, have a createUserSessionHandler. This checks the req.body using the validatePassword service from user service. Then if it is valid, create a session, then create an accessToken and a refreshToken with the user and session and send it in the response.
1. Create a getSessionsHandler that finds the user form res.locals.user._id and uses the findSessions service from session service to find all valid sessions associated with the user.
1. Create a deleteSessionsHandler that finds the session from the res.locals.user.session and uses the updateSession service to change the valid to false. Then res.send({accessToken: null, refreshToken: null}).
1. Remember to export all the handlers.
1. Create a session schema which will have a zod object which will basically take an email and a password. After the email property add a .email('You must put in a valid e-mail') so that the field is parsed for a valid e-mail.
1. Create the route for session which will have an endpoint of 'api/v1/sessions'. This will take a post method to create a session, a get method for getting the valid sessions (this will have the requireUser middleware because you should only be able to get your sessions if you're a logged in user), a delete method for deleting the session (this will also have the requireUser middleware run since you need to be logged in to log out).

### Create middleware
___
1. One should only be allowed to access certain parts of the site if they're logged in. To protect these we'll create a deserializeUser and a requireUser middleware.
1. A middleware folder is created. Within it a deserializeUser.ts is created.
1. This will have a deserialize user function, which will be export defaulted at the end. 
1. The function takes a req, res and next of type Request, Response, and NextFunction respectively all from "express".
1. Access token is to be got from the request.headers.Authorization after replacing the "Bearer " at the beginning.
1. Refresh token is to got from the request.headers.x-refresh.
1. If there's no accessToken return next(). If there's an accessToken verify it and find both the user it belongs to and the expired bit.
1. If the user is decoded, then res.locals.user = user and then return next().
1. If expired is true and there's a refreshToken, verify the refreshToken and find the user.
1. Create a newAccessToken using the reIssueAccessToken from the session service.
1. res.setHeader() to x-access-token the new accessToken.Find the user of the new accessToken and assign it to res.locals.user. Finally return next().
1. If the refreshToken is not there either, it should still go to next so in the outermost part return next() again.
1. Next create a requireUser.ts in middleware.
1. This has a requireUser function which will be export defaulted at the end. 
1. This takes in a req, res and next of type Request, Response, and NextFunction respectively from "express".
1. This checks if there is a user in res.locals.user. If there is it returns next() else on error it is to send a res.status(403).send('You are not authorized to access this page').
1. Create a validateResource.ts in the middleware folder.
1. This will have a validateResource function which will be export defaulted at the end.
1. This takes schema of AnyZodObject. Then in the nested function it takes in a req, res and next of type Request, Response, and NextFunction respectively from "express".
1. Within a try, catch. Schema.parse and set body: req.body, params: req.params, query: req.query. Then return next().
1. In the catch return a res.status(400).send(e.message) 

### Create Product
___
1. Create the product model with a product schema that will have a user which will again be of type mongoose.Schema.Types.ObjectId with a ref of "User".
1. The remaining properties will be a title, description, image, and price. Everything will be a string except price which would be a number.
1. timestamps will be true like all other schema in the project.
1. Mention the type, put the schema in the model and export default the model.
1. In the product service create a createProduct, getProduct, updateProduct and deleteProduct services. Corresponding handlers will be created in the product controller.
1. For the getProduct service use a FilterQuery of type ProductDocument, and in the updateProduct service use a FilterQuery of type ProductDocument as well as an UpdateQuery of type ProductDocument. For the update product service be sure to include the {new: true} option or create an options of type QueryOptions and then put that when the Handler calls the service.
1. In the updateProductHandler and the deleteProductHandler be sure to see if the product they're trying to update or delete exists then check to ensure that the user is the same as the creator of the user. Ensure that only the user who created the product can update or delete the product.
1. In the schema for this create a bodySchema and a paramsSchema and spread them in the object within each of create, get, update and delete product schemas. 
1. Finally create the routes for this and test them with Thunder client. 




