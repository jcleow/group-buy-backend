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
    qty: {
      type: DataTypes.INTEGER,
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
    purchaseDate: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
    paymentReceipt: {
      type: DataTypes.STRING,
    },
    receiptUploadDate: {
      type: DataTypes.DATE,
    },
    paymentStatus: {
      type: DataTypes.ENUM('processing', 'paid', 'refunded'),
    },
    dateReceiptApproved: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
    amtRefunded: {
      type: DataTypes.DECIMAL,
    },
    refundTier: {
      type: DataTypes.ENUM('1', '2'),
    },
    dateDelivered: {
      type: DataTypes.DATE(),
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
