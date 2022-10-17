const { Op } = require('sequelize')
const { TERMINATED } = require('../enums/contract-status')
const ContractService = require('../services/contract')

class ContractController {
  constructor () {
    this.contractService = new ContractService()
  }

  async show (req, res) {
    const { Contract } = req.app.get('models')
    const id = req.params.id
    const contract = await Contract.findOne({
      where: {
        id,
        [Op.or]: [
          {
            contractorId: req.profile.id
          },
          {
            clientId: req.profile.id
          }
        ]
      }
    })
    if (!contract) return res.status(404).end()
    res.json(contract)
  }

  async index (req, res) {
    const { Contract } = req.app.get('models')
    const contracts = await Contract.findAll({
      where: {
        status: {
          [Op.ne]: TERMINATED
        },
        [Op.or]: [
          {
            contractorId: req.profile.id
          },
          {
            clientId: req.profile.id
          }
        ]
      }
    })
    res.json(contracts)
  }
}

module.exports = ContractController
