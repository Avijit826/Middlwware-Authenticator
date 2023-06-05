const mongoose = require('mongoose')

const MONGODB_URL = 'mongodb://127.0.0.1:27017/jwtauth'

exports.connect = () => {
  mongoose
    .connect(MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(console.log('DB CONNECTED with a success'))
    .catch((error) => {
      console.log('DB connection failed')
      console.log(error)
      process.exit(1)
    })
}
