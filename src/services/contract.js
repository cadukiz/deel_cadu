const ContractRepository = require('../repositories/contract')

class ContractService {
  constructor () {
    this.contractRepository = new ContractRepository()
  }
}
module.exports = ContractService
