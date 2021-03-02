import multer from 'multer';

export default function initListingsController(db) {
  /**
   * Function to return all the listings present in database
   * It also returns the list of unique categories
   * @param request
   * @param response
   */
  const index = async (request, response) => {
    db.Listing.findAll()
      .then((listings) => {
        // Find the list of unique categories
        const categories = db.Listing.rawAttributes.category.values;
        response.status(200).send({ listings, categories });
      })
      .catch((error) => console.log(error));
  };

  const create = async (req, res) => {
    const { updatedFormStore } = req.body;

    // Remove $ sign from usualPrice and discountedPrice
    const updatedFields = {
      ...updatedFormStore,
      usualPrice: updatedFormStore.usualPrice?.replace(/[$,]/g, ''),
      discountedPrice: updatedFormStore.discountedPrice?.replace(/[$,]/g, ''),
    };

    // Create a new listing
    const newListing = await db.Listing.create(
      updatedFields,
    );
    res.send({ newListing });
  };

  const uploadCampaignPictures = async (req, res) => {
    // Create a hashmap of all the image urls
    const imageUrls = {};
    req.files.forEach((file, idx) => {
      imageUrls[`img${idx + 1}`] = file.location;
    });

    const { listingId } = req.params;
    const newListing = await db.Listing.findByPk(Number(listingId));

    newListing.images = imageUrls;

    await newListing.save();

    res.send({ message: 'upload complete' });
  };

  const getAllPurchases = async (req, res) => {
    const { listingId } = req.params;
    console.log(listingId, 'listingId');
    const allPurchases = await db.Purchase.findAll({
      where: {
        listingId,
      },
      include: 'purchaser',
    });
    console.log(allPurchases, 'allPurchases');
    // Mutate allPurchases to only display the relevant fields on client's campaignProgress for a single listing
    allPurchases.forEach((purchase) => {
      console.log(purchase, 'purchase');
      // Purchase Data Field (not incl username & reputation) constitutes 1 row in campaignProgress table
      const purchaseData = {
        paymentStatus: true,
        // pending addition by jeremy
        quantity: true,
        createdAt: true,
        dateDelivered: true,
      };
      // Filter purchase variable only for the relevant fields and parse into purchaseData object
      const relevantPurchaseKeys = Object.keys(purchase.dataValues).filter((key) => purchaseData[key]).forEach((key) => {
        purchaseData[key] = purchase[key];
      });

      // manually include purchaser's name and reputation as they are nested
      purchaseData.username = purchase.purchaser.username;
      purchaseData.reputation = purchase.purchaser.reputation;
    });

    res.send({ allPurchases });
  };

  return {
    index,
    create,
    uploadCampaignPictures,
    getAllPurchases,
  };
}
