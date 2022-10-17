const ProfileRepository = require('../repositories/profile')

class ProfileService {
  constructor () {
    this.profileRepository = new ProfileRepository()
  }
}
module.exports = ProfileService
