'use strict';

module.exports = (sequelize, DataTypes) => {
  const Attendances = sequelize.define('Attendances', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    clockIn: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    clockOut: {
      type: DataTypes.DATE,
      allowNull: true,
    }
  }, {
    timestamps: true
  });

  Attendances.associate = (models) => {
    Attendances.belongsTo(models.Users, { foreignKey: 'userId' });
  };

  return Attendances;
};