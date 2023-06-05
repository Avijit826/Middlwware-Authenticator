require('./config/database').connect()
const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

//custom middleware
const auth = require('./middleware/auth')

//import model - User
const User = require('./model/user')

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.send('Login to get Authenticate')
})

app.post('/register', async (req, res) => {
  try {
    //collect all information
    const { firstname, lastname, email, password } = req.body
    //validate the data, if exists
    if (!(email && password && lastname && firstname)) {
      res.status(401).send('All fileds are required')
    }
    //check if email is in correct format
    if (!email.includes('@', '.')) {
      res.status(401).send('Email format is not valid')
    }
    //check if user exists or not
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      res.status(401).send('User already found in database')
    }

    //encrypt the password
    const myEncyPassword = await bcrypt.hash(password, 10)

    //create a new entry in database
    const user = await User.create({
      firstname,
      lastname,
      email,
      password: myEncyPassword,
    })

    //create a token and send it to user
    const token = jwt.sign(
      {
        id: user._id,
        email,
      },
      'shhhhh',
      { expiresIn: '2h' }
    )

    user.token = token
    //don't want to send the password
    user.password = undefined

    res.status(201).json(user)
  } catch (error) {
    console.log(error)
    console.log('Error is response route')
  }
})

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    //validate
    if (!(email && password)) {
      res.status(401).send('email and password is required')
    }
    const user = await User.findOne({ email })
    if (!user) {
      res.status(401).send('User not exists')
    }
    const match = await bcrypt.compare(password, user.password)
    if (!match) {
      res.status(401).json('Data Not Match')
    }
    const token = jwt.sign({ id: user._id }, 'salt_secret', {
      expiresIn: '5h',
    })
    user.password = undefined
    user.token = token
    res.status(201).json({ token })
  } catch (error) {
    console.error(`ERROR>>>...................\n${error}`)
  }
})

app.get('/dashboard', auth, (req, res) => {
  res.send('Welcome to dashboard')
})

module.exports = app
