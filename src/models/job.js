'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Job extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      Job.belongsTo(models.Contract, { as: 'contract', foreignKey: 'contractId' })
    }
  }
  Job.init(
    {
      description: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
      },
      paid: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      paymentDate: {
        type: DataTypes.DATE
      }
    },
    {
      sequelize,
      modelName: 'Job'
    }
  )
  return Job
}
