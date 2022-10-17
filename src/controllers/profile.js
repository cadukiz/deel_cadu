const ProfileService = require('../services/profile')

class ProfileController {
  constructor () {
    this.profileService = new ProfileService()
  }

  async index (req, res) {
    const id = req.params.id
    const { Profile } = req.app.get('models')
    const profile = await Profile.findAll({
      where: {
        id
      }
    })
    res.json(profile)
  }
}

module.exports = ProfileController
