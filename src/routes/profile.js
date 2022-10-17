const express = require('express')
const { getProfile } = require('../middleware/getProfile')
const router = express.Router()

router.get('/:id', getProfile, async (req, res) => {
  const id = req.params.id
  const { Profile } = req.app.get('models')
  const profile = await Profile.findAll({
    where: {
      id
    }
  })
  res.json(profile)
})
module.exports = router
