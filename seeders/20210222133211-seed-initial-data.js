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
        reputation: 30,
        created_at: new Date(),
        updated_at: new Date(),
      }, {
        username: 'user2',
        email: 'user2@gmail.com',
        handphone_num: '+6587459621',
        password: hashedPassword,
        reputation: 50,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];
    const arrOfListings = [];

    const arrOfDiscounts = [0.2, 0.3, 0.4];
    const arrOfCategories = ['Food', 'Clothes', 'Toys', 'Health', 'Sports', 'Pets'];
    const arrOfListingStatuses = ['below-moq', 'above-moq', 'cancelled', 'completed'];
    const arrOfPurchaseStatuses = ['committed', 'activated', 'pending fulfillment', 'fulfilled', 'cancelled'];
    const arrOfPaymentStatuses = ['processing', 'paid', 'refunded'];

    // Generate a random date between 2 bounds
    function randomDate(start, end) {
      return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    }

    // Set upper and lower bound dates for listings

    const today = new Date();
    const lowerBoundListingDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
    const upperBoundListingDate = new Date();

    for (let i = 0; i < 6; i += 1) {
      // $1 to $5
      const usualPriceAmt = Math.floor(Math.random() * 5) + 1;
      const startDate = randomDate(lowerBoundListingDate, upperBoundListingDate);

      const moqDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 4);
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 14);
      const deliveryDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() + 7);

      const randDiscountPrice = Number((arrOfDiscounts[Math.floor(Math.random() * arrOfDiscounts.length)]
         * usualPriceAmt).toFixed(2));

      const listing = {

        id: i + 1,
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

        // quantity remaining( random num) // 1-9
        quantity_remaining: Math.floor(Math.random() * 10),

        // moq (random num) // 1 to 5
        moq: Math.floor(Math.random() * 5) + 1,

        date_moq_reached: moqDate,
        // Whether a lister's listing can go beyond its goal set
        allow_oversubscription: false,

        // usual_price (rand num)
        usual_price: usualPriceAmt,

        // discount_price
        discounted_price: randDiscountPrice,

        start_date: new Date(startDate),

        // end date = startDate.date() + 14days
        end_date: endDate,

        // delivery date = endDate + 7 days
        delivery_date: deliveryDate,

        // modulo index if even -> pickup odd -> electronic
        delivery_mode: (i % 2 === 0 ? 'pickup' : 'electronic'),

        // tnc: 'Some text'
        tnc: faker.lorem.paragraph(),

        // category modulo index if even -> food odd -> clothes
        // category: (i % 2 === 0 ? 'food' : 'clothes'),
        category: arrOfCategories[Math.floor(Math.random() * arrOfCategories.length)],

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
    for (let i = 0; i < 50; i += 1) {
      const selectedListingId = Math.floor(Math.random() * 6) + 1;
      const listingStartDate = new Date(arrOfListings[selectedListingId - 1].start_date);
      console.log(listingStartDate, 'listingStartDate');

      const randomPurchaseDate = new Date(
        listingStartDate.getFullYear(), listingStartDate.getMonth(), listingStartDate.getDate() + Math.floor(Math.random() * 5),
      );
      const purchase = {
        listing_id: selectedListingId,
        qty: Math.floor(Math.random() * 3) + 1,
        purchaser_id: Math.floor(Math.random() * 2) + 1,
        purchase_status: arrOfPurchaseStatuses[Math.floor(Math.random() * arrOfPurchaseStatuses.length)],
        purchase_date: randomPurchaseDate,
        payment_receipt: 'https://www.citibank.com.sg/gcb/otherservices/images/paynow/step-4.jpg',
        receipt_upload_date: randomPurchaseDate,
        payment_status: arrOfPaymentStatuses[Math.floor(Math.random() * arrOfPaymentStatuses.length)],
        date_receipt_approved: new Date(randomPurchaseDate.getFullYear(), randomPurchaseDate.getMonth(), randomPurchaseDate.getDate() + 2),
        // dummy values
        amt_refunded: 0,
        refund_tier: '2',
        date_delivered: null,
        // both of the below were changed from singleDate to randomPurchaseDate, which is synced to the receipt upload date.
        // logic is tt the entry create date shld be initially same as the payment date
        created_at: randomPurchaseDate,
        updated_at: randomPurchaseDate,
      };

      arrOfPurchases.push(purchase);
    }

    arrOfListings.forEach((listing) => { delete listing.id; });

    await queryInterface.bulkInsert('users', usersList);
    await queryInterface.bulkInsert('listings', arrOfListings);
    await queryInterface.bulkInsert('purchases', arrOfPurchases);
    // await queryInterface.bulkInsert('order_trackers', arrOfOrderTrackers);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('purchases', null, {});
    await queryInterface.bulkDelete('listings', null, {});
    await queryInterface.bulkDelete('users', null, {});
  },
};
