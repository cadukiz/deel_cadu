const JobRepository = require('../repositories/job')

class JobService {
  constructor () {
    this.jobRepository = new JobRepository()
  }
}
module.exports = JobService
