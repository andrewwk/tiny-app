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

// login
router.get('/',(req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls')
  } else {
    res.status(200).render('login')
  }
})

router.post('/', (req, res) => {
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

module.exports = router
