const jsSHA = require('jssha');
const faker = require('faker');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const shaObj = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });
    shaObj.update('password');
    const hashedPassword = shaObj.getHash('HEX');
    const usersList = [
      {
        username: 'user1',
        email: 'user1@gmail.com',
        handphone_num: '+6589891234',
        password: hashedPassword,
        created_at: new Date(),
        updated_at: new Date(),
      }, {
        username: 'user2',
        email: 'user2@gmail.com',
        handphone_num: '+6587459621',
        password: hashedPassword,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];
    const arrOfListings = [];

    const arrOfDiscounts = [0.2, 0.3, 0.4];
    const arrOfListingStatuses = ['below-moq', 'above-moq', 'cancelled', 'completed'];
    const arrOfPurchaseStatuses = ['committed', 'activated', 'pending fulfillment', 'fulfilled', 'cancelled'];
    const arrOfPaymentStatuses = ['paid', 'refunded'];

    for (let i = 0; i < 6; i += 1) {
      // $1 to $5
      const usualPriceAmt = Math.floor(Math.random() * 5) + 1;
      const startDate = new Date(faker.date.future());

      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 14);

      const deliveryDate = new Date(endDate);
      deliveryDate.setDate(deliveryDate.getDate() + 7);

      const randDiscountPrice = Number((arrOfDiscounts[Math.floor(Math.random() * arrOfDiscounts.length)]
         * usualPriceAmt).toFixed(2));

      console.log(randDiscountPrice, 'randDiscountPx');

      const listing = {
        // title
        title: faker.hacker.noun(),

        // description
        description: faker.lorem.paragraph(),

        // img
        images: JSON.stringify({
          img1: faker.image.imageUrl(),
          img2: faker.image.imageUrl(),
          img3: faker.image.imageUrl(),
        }),

        // quantity (random num) //10 to 19
        quantity: Math.floor(Math.random() * 10) + 10,

        // moq (random num) // 1 to 5
        moq: Math.floor(Math.random() * 5) + 1,

        // usual_price (rand num)
        usual_price: usualPriceAmt,

        // discount_price
        discounted_price: randDiscountPrice,

        // start faker.date.future
        start_date: startDate,

        // end date = startDate.date() + 14days
        end_date: endDate,

        // delivery date = endDate + 7 days
        delivery_date: deliveryDate,

        // modulo index if even -> pickup odd -> electronic
        delivery_mode: (i % 2 === 0 ? 'pickup' : 'electronic'),
        // tnc: 'Some text'
        tnc: faker.lorem.paragraph(),

        // category modulo index if even -> food odd -> clothes
        category: (i % 2 === 0 ? 'food' : 'clothes'),

        // random Number for lister_id
        lister_id: Math.floor(Math.random() * 2) + 1,

        // listing_status
        listing_status: arrOfListingStatuses[Math.floor(Math.random() * arrOfListingStatuses.length)],
        created_at: new Date(),
        updated_at: new Date(),
      };
      arrOfListings.push(listing);
    }

    const arrOfPurchases = [];

    for (let i = 0; i < 3; i += 1) {
      const purchase = {
        listing_id: Math.floor(Math.random() * 6) + 1,
        purchaser_id: Math.floor(Math.random() * 2) + 1,
        purchase_status: arrOfPurchaseStatuses[Math.floor(Math.random() * arrOfPurchaseStatuses.length)],
        payment_status: arrOfPaymentStatuses[Math.floor(Math.random() * arrOfPaymentStatuses.length)],
        // dummy values
        amt_refunded: 0,
        refund_tier: '2',
        created_at: new Date(),
        updated_at: new Date(),
      };
      arrOfPurchases.push(purchase);
    }

    await queryInterface.bulkInsert('users', usersList);
    await queryInterface.bulkInsert('listings', arrOfListings);
    await queryInterface.bulkInsert('purchases', arrOfPurchases);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('purchases', null, {});
    await queryInterface.bulkDelete('listings', null, {});
    await queryInterface.bulkDelete('users', null, {});
  },
};
