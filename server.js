const express = require('express')
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session);
const mongodb = require('mongoose')
const bcrypt = require('bcryptjs');
const app = express()

const UserModel = require('./models/User')
const MongoUri = "mongodb://localhost:27017/sessions"
mongodb.connect(MongoUri, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    console.log("Mongo db connected")
})


var store = new MongoDBStore({
    uri: MongoUri,
    collection: 'mySessions'
});
app.use(session({
    secret: 'This is the session',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    },
    store: store,
}))

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

app.get('/login', (req, res) => {
    res.render('login')
})
app.post('/login', (req, res) => {
    console.log(req.body)
})
app.get('/register', (req, res) => {
    res.render('register')
})
app.post('/register', async (req, res) => {
    var { username, email, password } = req.body
    var user = await UserModel.findOne({ email })
    if (user) {
        res.redirect('/register')
    }
    var hashpwd = await bcrypt.hash(password, 12)
    var newuser = new UserModel({
        username,
        email,
        password: hashpwd
    });
    await newuser.save()
    res.redirect('/login')
})
app.get('/', (req, res) => {
    res.render('dashboard')
})


app.listen(3000, console.log('Server is running att https://localhost:3000'))