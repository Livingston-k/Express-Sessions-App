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

const isAuth = (req, res, next) => {
    if (req.session.isAuth) {
        next()
    } else {
        res.redirect('/login')
    }
}


app.get('/login', (req, res) => {
    res.render('login')
})
app.post('/login', async (req, res) => {
    var { email, password } = req.body
    var user = await UserModel.findOne({ email })
    if (!user) {
        res.redirect('/login')
    }
    var isMatchPwd = await bcrypt.compare(password, user.password)
    if (!isMatchPwd) {
        res.redirect('/login')
    }
    req.session.isAuth = true
    res.redirect('/')

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
app.get('/', isAuth, (req, res) => {
    res.render('dashboard')
})
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) throw err
        res.redirect('/login')
    })

})

app.listen(3000, console.log('Server is running att https://localhost:3000'))