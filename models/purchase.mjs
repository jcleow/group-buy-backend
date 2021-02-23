export default function initPurchaseModel(sequelize, DataTypes) {
  return sequelize.define('purchase', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    listingId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'listings',
        key: 'id',
      },
    },
    purchaserId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    // From buyer's point of view
    purchaseStatus: {
      type: DataTypes.ENUM('committed', 'activated', 'pending fulfillment', 'fulfilled', 'cancelled'),
    },
    paymentStatus: {
      type: DataTypes.ENUM('processing', 'paid', 'refunded'),
    },
    amtRefunded: {
      type: DataTypes.DECIMAL,
    },
    refundTier: {
      type: DataTypes.ENUM('1', '2'),
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
