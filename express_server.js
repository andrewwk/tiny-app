const express      = require('express')
const session      = require('express-session')
const cookieParser = require('cookie-parser')
const flash        = require('connect-flash')
const app          = express()
const bodyParser   = require('body-parser')
const PORT         = process.env.PORT || 8080 // default port 8080

const urlDB = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
  '82mcynywjz': 'http://www.motorauthority.com',
  'jpcmoo2ae4': 'http://www.anandtech.com'
}

const generateRandomString = () => {
  let text = ''
  const charset = 'abcdefghijklmnopqrstuvwxyz0123456789/?<>:;{}[]'

  for (let i = 0; i < 10; i++ ) {
    text += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return text;
}

const users = {
  1: {
    id: 1,
    email: 'andrew@test.com',
    password: 'password'
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

app.set('view engine', 'ejs')
app.use(cookieParser('supasecret_secret'))
app.use(session({
  cookie: { maxAge: 60000 },
  secret: 'uber_supersecret_secret',
  resave: false,
  saveUninitialized: false
}))
app.use(flash())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', (req, res) => res.redirect('/login'))

app.get('/login',(req, res) => {
  let locals = { user_id: req.cookies['user_id'] }
  if (locals.email) {
    res.redirect('/urls')
  }
  res.render('login', locals)
});

app.post('/login', (req, res) => {
  let email = req.body.email
  let password = req.body.password
  let user = checkEmail(email)
  console.log("user", user);
  console.log("email", email);

  let user_id = ""
  if (user && (user.password === password)) {
    user_id = user.user_id
    console.log("user_id", user_id)
    let cookie = res.cookie('user_id', user_id)
    res.redirect('/urls')
  } else {
    res.sendStatus(403)
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id').redirect('/login')
});

app.post('/register', (req, res) => {
  let email = req.body.email
  let password = req.body.password
  let user_id = generateRandomString()
  console.log(checkEmail(email));
  if (!checkEmail(email)) {
    users[user_id] = { user_id: {
      id: user_id,
      email: email,
      password: password
    }}
    let cookie = res.cookie('user_id', user_id)
    res.redirect('/')
  } else {
    res.sendStatus(403)
  }
})

app.get('/register', (req, res) => {
  let locals = {
    user_id: req.cookies['user_id']
  }
  res.render('register', locals)
})

app.get('/urls', (req, res) => {
  let locals = {
    urls: urlDB,
    message: req.flash('info'),
    user_id: req.cookies['user_id']
  }
  res.render('urls_index', locals)
})

app.get('/urls/new', (req, res) => {
  let locals = { user_id: req.cookies['user_id'] }
  res.render('urls_new', locals)
});

app.post('/urls/create', (req, res) => {
  let longURL = req.body.longURL
  let shortURL = generateRandomString()
  urlDB[shortURL] = longURL
  res.redirect('/urls')
})

app.get('/u/:shortURL', (req, res) => {
  let longURL = urlDB[req.params.shortURL]
  res.redirect(longURL)
})

app.post('/urls/:id/delete', (req, res) => {
  delete urlDB[req.params.id]
  req.flash('info', 'Url Delete Successful!')
  res.redirect('/urls')
})

app.get('/urls/:id', (req, res) => {
  let locals = {
    shortURL: req.params.id,
    user_id: req.cookies['user_id']
  }
  res.render('urls_show', locals)
})

app.post('/urls/:id', (req, res) => {
  urlDB[req.params.id] = req.body.updated_url
  res.redirect('/urls')
})

app.use((req, res) => res.status(404).send('Error 404. This path does not exist.'))

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))
