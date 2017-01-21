const express        = require('express')
const cookieSession  = require('cookie-session')
const session        = require('express-session') //required for flash messages
const flash          = require('connect-flash')   //creates flash messages
const bodyParser     = require('body-parser')
const methodOverride = require('method-override') //method overried to allow for put and delete
const bcrypt         = require('bcrypt');
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

app.get('/login',(req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls')
  } else {
    res.status(200).render('login')
  }
})

app.post('/login', (req, res) => {
  let email = req.body.email
  let password = req.body.password
  let user = checkEmail(email)
  let user_id = ""
  if (user && (bcrypt.compareSync(password, user.password) || user.password === password)) {
    user_id = user.id
    req.session.user_id = user_id
    res.redirect('/')
  } else {
    req.flash('info', '401: Unauthorized User. Please login.')
    res.status(401).redirect('/error')
  }
});

app.post('/logout', (req, res) => {
  req.session = null
  res.redirect('/login')
})

app.get('/register', (req, res) => {
  let locals = { user_id: req.session.user_id }
  if (req.session.user_id) {
    res.redirect('/')
  } else {
    res.status(200).render('register', locals)
  }
})

app.post('/register', (req, res) => {
  let email = req.body.email
  let password = req.body.password
  let hashed_password = bcrypt.hashSync(password, 10)
  let user_id = generateRandomString()
  if (!checkEmail(email)) {
    users[user_id] = {
      id: user_id,
      email: email,
      password: hashed_password,
      urls:{}
    }
    req.session.user_id = user_id
    res.redirect('/')
  } else if (email.length === 0 || password.length === 0) {
    req.flash('info', '400: Please enter passsword AND email.')
    res.status(400).redirect('/error')
  } else {
    req.flash('info', '400: Email is already registered')
    res.status(400).redirect('/error')
  }
})

app.get('/urls', (req, res) => {
  const locals = {
    users: users,
    message: req.flash('info'),
    user_id: req.session.user_id
  };
  if (!req.session.user_id) {
    req.flash('info', '401: Unauthorized User. Please login.')
    res.status(401).redirect('/error')
  } else {
    res.status(201).render('urls_index', locals)
  }
})

app.post('/urls', (req, res) => {
  let longURL  = req.body.longURL
  let shortURL = generateRandomString()
  let user_id  = req.session.user_id
  if(!user_id) {
    req.flash('info', '401: Unauthorized User. Please login.')
    res.status(401).redirect('/error')
  } else {
    users[user_id].urls[shortURL] = longURL
    res.redirect(`/urls/${shortURL}`)
  }
})

app.get('/urls/new', (req, res) => {
  const locals = {
    user_id: req.session.user_id,
    message: req.flash('info'),
    users: users
   }
   if (!req.session.user_id) {
     req.flash('info', '401: Unauthorized User. Please login.')
     res.status(401).redirect('/error')
   } else {
     res.status(200).render('urls_new', locals)
   }
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

app.delete('/urls/:id/delete', (req, res) => {
  let user_id = req.session.user_id
  let urls    = users[user_id].urls
  if (!verifyURLOwner(req.params.id, user_id)) {
    req.flash('info', '403: FORBIDDEN! Unauthorized user. You are not the url owner.')
    res.status(403).redirect('/error')
  } else {
    delete urls[req.params.id]
    req.flash('info', 'Url Delete Successful!')
    res.redirect('/urls')
  }
})

app.get('/urls/:id', (req, res) => {
  let locals = {
    users: users,
    shortURL: req.params.id,
    user_id: req.session.user_id,
    message: req.flash('info')
  }
  if (!verifyShortURL(req.params.id)) {
    req.flash('info', '404: Short URL not found.')
    res.status(404).redirect('/error')
  } else if (!req.session.user_id) {
    req.flash('info', '401: Unauthorized user. Please login.')
    res.status(401).redirect('/error')
  } else if (!verifyURLOwner(req.params.id, req.session.user_id)) {
    req.flash('info', '403: Forbidden! This url is not registered to you.')
    res.status(403).redirect('/error')
  } else {
    res.status(200).render('urls_show', locals)
  }
})

app.put('/urls/:id', (req, res) => {
  let user_id = req.session.user_id
  let urls = users[user_id].urls
  if (req.body.updated_url.length < 1) {
    req.flash('info', 'It appears you forgot to enter a new url.')
    res.redirect('/urls')
  } else if (!user_id) {
    req.flash('info', '401: Unauthorized user. Please login.')
    res.status(401).redirect('/error')
  } else {
    for (url in urls) {
      urls[req.params.id] = req.body.updated_url
    }
    req.flash('info', 'Great Success! URL has been updated!')
    res.redirect(`/urls/${req.params.id}`)
  }
})

app.use((req, res) => res.status(404).send('Error 404. This path does not exist.'))

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))
