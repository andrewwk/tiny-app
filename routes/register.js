const express        = require('express')
const cookieSession  = require('cookie-session')
const session        = require('express-session') //required for flash messages
const flash          = require('connect-flash')   //creates flash messages
const bodyParser     = require('body-parser')
const methodOverride = require('method-override') //method overried to allow for put and delete
const bcrypt         = require('bcrypt')
const app            = express()
const router         = express.Router()

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

const generateRandomString = () => {
  let text = ''
  const charset = 'abcdefghijklmnopqrstuvwxyz0123456789'

  for (let i = 0; i < 10; i++ ) {
    text += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return text;
}

// register
router.get('/', (req, res) => {
  let locals = { user_id: req.session.user_id }
  if (req.session.user_id) {
    res.redirect('/')
  } else {
    res.status(200).render('register', locals)
  }
})

router.post('/', (req, res) => {
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

module.exports = router
