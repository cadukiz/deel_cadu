'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Contract extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      Contract.belongsTo(models.Profile, { as: 'Contractor' })
      Contract.belongsTo(models.Profile, { as: 'Client' })
      Contract.hasMany(models.Job)
    }
  }
  Contract.init(
    {
      terms: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('new', 'in_progress', 'terminated')
      }
    },
    {
      sequelize,
      modelName: 'Contract'
    })
  return Contract
}
