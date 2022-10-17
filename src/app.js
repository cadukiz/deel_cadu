const express = require('express')
const bodyParser = require('body-parser')
const { sequelize } = require('./models')

const app = express()

app.use(bodyParser.json())
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

const adminRouter = require('./routes/admin')
const contractRouter = require('./routes/contract')
const jobRouter = require('./routes/job')
const profileRouter = require('./routes/profile')

app.use('/admin', adminRouter)
app.use('/contracts', contractRouter)
app.use('/jobs', jobRouter)
app.use('/profiles', profileRouter)

module.exports = app
