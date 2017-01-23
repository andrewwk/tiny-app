const express        = require('express');
const cookieSession  = require('cookie-session')
const session        = require('express-session') //required for flash messages
const flash          = require('connect-flash')   //creates flash messages
const bodyParser     = require('body-parser')
const methodOverride = require('method-override') //method overried to allow for put and delete
const app            = express()
const router         = express.Router();

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

const generateRandomString = () => {
  let text = ''
  const charset = 'abcdefghijklmnopqrstuvwxyz0123456789'

  for (let i = 0; i < 10; i++ ) {
    text += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return text;
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

// urls
router.get('/', (req, res) => {
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

router.post('/', (req, res) => {
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

router.get('/new', (req, res) => {
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

router.delete('/:id/delete', (req, res) => {
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

router.get('/:id', (req, res) => {
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

router.put('/:id', (req, res) => {
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

module.exports = router
