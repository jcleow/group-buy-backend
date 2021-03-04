module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      email: {
        type: Sequelize.STRING,
      },
      username: {
        type: Sequelize.STRING,
      },
      password: {
        type: Sequelize.STRING,
      },
      profile_picture: {
        type: Sequelize.STRING,
      },
      handphone_num: {
        type: Sequelize.STRING,
      },
      reputation: {
        type: Sequelize.INTEGER,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.createTable('listings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      title: {
        type: Sequelize.STRING,
      },
      description: {
        type: Sequelize.TEXT,
      },
      images: {
        type: Sequelize.JSON,
      },
      quantity: {
        type: Sequelize.INTEGER,
      },
      // tracks how many units are available for puchase (i.e. the stock)
      quantity_remaining: {
        type: Sequelize.INTEGER,
      },
      // minimum order quantity
      moq: {
        type: Sequelize.INTEGER,
      },
      allow_oversubscription: {
        type: Sequelize.BOOLEAN,
      },
      usual_price: {
        type: Sequelize.DECIMAL,
      },
      discounted_price: {
        type: Sequelize.DECIMAL,
      },
      start_date: {
        type: Sequelize.DATE,
      },
      end_date: {
        type: Sequelize.DATE,
      },
      delivery_date: {
        type: Sequelize.DATE,
      },
      delivery_mode: {
        type: Sequelize.ENUM('pickup', 'electronic'),
      },
      tnc: {
        type: Sequelize.TEXT,
      },
      category: {
        type: Sequelize.ENUM('food', 'clothes'),
      },
      lister_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      listing_status: {
        type: Sequelize.ENUM('below-moq', 'above-moq', 'cancelled', 'completed'),
        defaultValue: 'below-moq',
      },
      is_deleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.createTable('purchases', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      listing_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'listings',
          key: 'id',
        },
      },
      qty: {
        type: Sequelize.INTEGER,
      },
      purchaser_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      // From buyer's point of view
      purchase_status: {
        type: Sequelize.ENUM('committed', 'activated', 'pending fulfillment', 'fulfilled', 'cancelled'),
      },
      payment_receipt: {
        type: Sequelize.STRING,
      },
      receipt_upload_date: {
        type: Sequelize.DATE,
      },
      payment_status: {
        type: Sequelize.ENUM('processing', 'paid', 'refunded'),
      },
      amt_refunded: {
        type: Sequelize.DECIMAL,
      },
      refund_tier: {
        type: Sequelize.ENUM('1', '2'),
      },
      date_delivered: {
        type: Sequelize.DATE(),
      },
      // Add a quantity purchased field to purchases
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.createTable('order_trackers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      // FK
      purchase_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'purchases',
          key: 'id',
        },
      },
      purchase_date: {
        type: Sequelize.DATE,
        defaultValue: null,
      },
      date_receipt_approved: {
        type: Sequelize.DATE,
        defaultValue: null,
      },
      date_moq_reached: {
        type: Sequelize.DATE,
        defaultValue: null,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('order_trackers');
    await queryInterface.dropTable('purchases');
    await queryInterface.dropTable('listings');
    await queryInterface.dropTable('users');
  },
};
