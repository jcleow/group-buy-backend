export default function initOrderTrackerModel(sequelize, DataTypes) {
  return sequelize.define('order_tracker', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    // FK
    purchaseId: {
      allowNull: false,
      type: DataTypes.INTEGER,
      references: {
        model: 'purchases',
        key: 'id',
      },
    },
    purchaseDate: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
    dateReceiptApproved: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
    dateMoqReached: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
  }, {
    underscored: true,
  });
}
