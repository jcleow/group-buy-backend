export default function initListingModel(sequelize, DataTypes) {
  return sequelize.define('listing', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    title: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.TEXT,
    },
    images: {
      type: DataTypes.JSON,
    },
    quantity: {
      type: DataTypes.INTEGER,
    },
    quantityRemaining: {
      type: DataTypes.INTEGER,
    },
    // minimum order quantity
    moq: {
      type: DataTypes.INTEGER,
    },
    dateMoqReached: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
    allowOversubscription: {
      type: DataTypes.BOOLEAN,
    },
    usualPrice: {
      type: DataTypes.DECIMAL,
    },
    discountedPrice: {
      type: DataTypes.DECIMAL,
    },
    startDate: {
      type: DataTypes.DATE,
    },
    endDate: {
      type: DataTypes.DATE,
    },
    deliveryDate: {
      type: DataTypes.DATE,
    },
    deliveryMode: {
      type: DataTypes.ENUM('pickup', 'electronic'),
    },
    tnc: {
      type: DataTypes.TEXT,
    },
    category: {
      type: DataTypes.ENUM('Food', 'Clothes', 'Toys', 'Health', 'Sports', 'Pets'),
    },
    listerId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    listingStatus: {
      type: DataTypes.ENUM('below-moq', 'above-moq', 'cancelled', 'completed'),
      defaultValue: 'below-moq',
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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
