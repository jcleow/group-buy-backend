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
    // minimum order quantity
    moq: {
      type: DataTypes.INTEGER,
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
      type: DataTypes.ENUM('food', 'clothes'),
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
