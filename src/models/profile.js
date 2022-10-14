'use strict'
const {
  Model
} = require('sequelize')
const { CLIENT, CONTRACTOR } = require('../enums/profile-types')
module.exports = (sequelize, DataTypes) => {
  class Profile extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      Profile.hasMany(models.Contract, { as: 'contractor', foreignKey: 'contractorId' })
      Profile.hasMany(models.Contract, { as: 'client', foreignKey: 'clientId' })
    }
  }
  Profile.init({
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    profession: {
      type: DataTypes.STRING,
      allowNull: false
    },
    balance: {
      type: DataTypes.DECIMAL(12, 2)
    },
    type: {
      type: DataTypes.ENUM(CLIENT, CONTRACTOR)
    }
  }, {
    sequelize,
    modelName: 'Profile'
  })
  return Profile
}
