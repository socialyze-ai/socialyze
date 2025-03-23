const express = require('express')
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const Sequelize = require('sequelize');
const SequelizeStore = require('express-session-sequelize')(session.Store);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/config/config.json')[env];
const connectConstants = require('./constants/connectConstants');
const db = require('./models')

//Libraries for Twitter
const passport = require('passport');

const app = express()
const port = 3000

const sequelize = new Sequelize(config.database, config.username, config.password, config);

// app.use((req,res,next) => {
//   console.log("First" , req.session)
//   next()
// })

app.use(express.json())
app.use(cors({
    origin: `${config.frontendUrl}`,
    credentials: true
}));
app.use(
    session({
      secret: "some-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: { 
        maxAge: 1000 * 60 * 60 * 24, 
        httpOnly: true,
        secure: false // To be true in production
      }, // Session duration (1 day) 
      store: new SequelizeStore({
        db: sequelize,
        table: 'Session', // Make sure it matches the name of your model
      }),
    })
);

app.use(passport.initialize());
//app.use(passport.session());
app.use(express.urlencoded({extended: false}))

//Routers
const userRouter = require('./routes/User')
const connectRouter = require('./routes/Connect')
const postRouter = require('./routes/Post')
app.use("/user", userRouter )
app.use("/connect", connectRouter )
app.use("/post", postRouter )


app.get('/', (req,res) => {
    res.send('Server Running')
})

db.sequelize.sync().then(() => {
    app.listen(port, () => {
        console.log("Server Started")
    })
})
