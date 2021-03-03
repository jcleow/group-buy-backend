import { generatePastSevenDays, convertToDdMm } from '../helper.mjs';

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
        const listingStatus = db.Listing.rawAttributes.listingStatus.values;
        response.status(200).send({ listings, categories, listingStatus });
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

  /**
   * Function to update an existing listing data
   */
  const updateListing = async (request, response) => {
    console.log('updateListing');

    console.log('request.params', request.params);
    console.log('request.body', request.body);
    console.log('request.files', request.files);

    const { updatedListingData } = request.body;
    const { listingId } = request.params;

    // Reorder the image keys, if they are not in order
    const existingImages = (!updatedListingData.images)
      ? [] : Object.values(updatedListingData.images);
    if (existingImages.length !== 0) {
      existingImages.forEach((imgSrc, imgIndex) => {
        updatedListingData.images[`img${imgIndex + 1}`] = imgSrc;
      });
    }
    const updatingListing = await db.Listing.findByPk(Number(listingId));
    if (updatingListing === null || undefined === updatingListing
      || updatingListing.id !== updatedListingData.id) {
      response.send({ message: 'Not a valid listing' });
    }
    Object.keys(updatedListingData).forEach((key) => {
      updatingListing[key] = updatedListingData[key];
    });
    // updatingListing = { ...updatedListingData };
    const updatedListing = await updatingListing.save();
    console.log('Succesfully updated');

    response.send({ message: 'Update completed', updatedListing });
  };

  const updateListingImages = async (request, response) => {
    const { listingId } = request.params;
    const newListing = await db.Listing.findByPk(Number(listingId));
    // First get all the image files names already existing db
    // Get the last key value and get it's index
    let imageStartIndex = 0;
    if (newListing.images) {
      const numOfImages = Object.keys(newListing.images).length;
      // Get the last index after 'img' in key
      imageStartIndex = Number(Object.keys(newListing.images)[numOfImages - 1].substr(3));
      imageStartIndex += 1;
    }
    // Add the new image files to the existing ones

    // Create a hashmap of all the image urls
    request.files.forEach((file, idx) => {
      newListing.images[`img${imageStartIndex + idx}`] = file.location;
    });

    const updatedListing = await newListing.save();

    response.send({ message: 'Image upload completed', updatedListing });
  };

  const getAllPurchases = async (req, res) => {
    const { listingId } = req.params;
    const allDetailedPurchasesInfo = await db.Purchase.findAll({
      where: {
        listingId,
      },
      include: 'purchaser',
    });
    // Mutate allPurchases to only display the relevant fields
    // on client's campaignProgress for a single listing
    const allFilteredPurchaseData = allDetailedPurchasesInfo.map((purchase) => {
      // Purchase Data Field (not incl username & reputation)
      // constitutes 1 row in campaignProgress table
      const purchaseData = {
        id: true,
        paymentStatus: true,
        // pending addition by jeremy
        quantity: true,
        createdAt: true,
        dateDelivered: true,
      };
      // Filter purchase variable only for the relevant fields and parse into purchaseData object
      Object.keys(purchase.dataValues).filter(
        (key) => purchaseData[key],
      ).forEach((key) => {
        purchaseData[key] = purchase[key];
      });
      console.log(purchase.dataValues, 'purchase-dataValues');

      // Manually include purchaser's name and reputation as they are nested
      purchaseData.username = purchase.purchaser.username;
      purchaseData.reputation = purchase.purchaser.reputation;

      // **** Fictious quantity in purchases!! to be removed ***///
      purchaseData.quantity = Math.floor(Math.random() * 100);
      // *******************************************************//
      console.log(purchaseData, 'purchaseData');
      return purchaseData;
    });

    const pastSevenDays = generatePastSevenDays();
    // Create a tally of daily counts from all purchases
    const dailyQuantityPurchased = {};
    allFilteredPurchaseData.forEach((purchase) => {
      // First convert purchase.createdAt to the same datestring format
      const formattedCreatedDate = convertToDdMm(purchase.createdAt);
      if (!dailyQuantityPurchased[formattedCreatedDate]) {
        dailyQuantityPurchased[formattedCreatedDate] = purchase.quantity;
      } else {
        dailyQuantityPurchased[formattedCreatedDate] += purchase.quantity;
      }
    });
    // Get only the past seven days count
    const pastSevenDaysCount = pastSevenDays.map((day) => {
      if (dailyQuantityPurchased[day]) {
        return { x: day, y: dailyQuantityPurchased[day] };
      }
      return { x: day, y: 0 };
    });
    res.send({ allFilteredPurchaseData, pastSevenDaysCount });
  };

  return {
    index,
    create,
    uploadCampaignPictures,
    updateListing,
    updateListingImages,
    getAllPurchases,
  };
}
