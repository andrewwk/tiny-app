const express        = require('express')
const cookieSession  = require('cookie-session')
const session        = require('express-session') //required for flash messages
const flash          = require('connect-flash')   //creates flash messages
const bodyParser     = require('body-parser')
const methodOverride = require('method-override') //method overried to allow for put and delete
const bcrypt         = require('bcrypt')
const login          = require('./routes/login')
const urls           = require('./routes/urls')
const register       = require('./routes/register')
const app            = express()
const PORT           = process.env.PORT || 8080  // default port 8080

const generateRandomString = () => {
  let text = ''
  const charset = 'abcdefghijklmnopqrstuvwxyz0123456789'

  for (let i = 0; i < 10; i++ ) {
    text += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return text;
}

const users = {
  '1': {
    id: '1',
    email: 'andrew@test.com',
    password: 'password',
    urls:
      {'82mcynywjz': 'http://www.motorauthority.com',
      'jpcmoo2ae4': 'http://www.anandtech.com'}
  },
  '1234': {
    id: '1234',
    email: 'thor@asgard.com',
    password: 'odin',
    urls:
      {'b2xVn2': 'http://www.lighthouselabs.ca',
      '9sm5xK': 'http://www.google.com'}
  }
}

const checkEmail = (email) => {
  for (userID in users) {
    if (users[userID].email === email) {
      return users[userID]
    }
  }
  return false;
}

const verifyURLOwner = (url, user_id) => {
  let verify = false;
  for (key in users) {
    if (users[user_id].urls[url]) {
      verify = true
    }
  }
  return verify;
}

const verifyShortURL = (shortURL) => {
  let verify = false;
  for (key in users) {
    if (users[key].urls[shortURL]) {
      verify = true
    }
  }
  return verify;
}

const findLongURL = (shortURL) => {
  let longURL = ''
  for (key in users) {
    if (users[key].urls[shortURL]) {
      longURL = users[key].urls[shortURL]
    }
  }
  return longURL
}

app.set('view engine', 'ejs')

app.use(cookieSession({
  name: 'session',
  keys: ['supasecret_secret'],
  maxAge: 60 * 60 * 1000
}))
app.use(session({
  cookie: { maxAge: 60000 },
  secret: 'uber_supasecret_secret',
  resave: false,
  saveUninitialized: false
}))
app.use(flash())
app.use(methodOverride('_method'))
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use('/login', login)
app.use('/urls', urls)
app.use('/register', register)

app.get('/', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/login')
  } else {
    res.redirect('/register')
  }
})

app.get('/error', (req, res) => {
  const locals = {
    users: users,
    message: req.flash('info'),
    user_id: req.session.user_id
  }
  res.render('error', locals)
})

app.post('/logout', (req, res) => {
  req.session = null
  res.redirect('/login')
})

app.get('/u/:shortURL', (req, res) => {
  let longURL = findLongURL(req.params.shortURL)
  if (!longURL) {
    req.flash('info', '404: URL not found.')
    res.status(404).redirect('/error')
  } else {
    res.redirect(`${longURL}`)
  }
})

app.use((req, res) => res.status(404).send('Error 404. This path does not exist.'))

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))
