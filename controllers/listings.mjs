import { generatePastSevenDays, convertToDdMm, convertToDdMmYy } from '../helper.mjs';

export default function initListingsController(db) {
  /**
   * Function to return all the listings present in database
   * It also returns the list of unique categories
   */
  const index = async (request, response) => {
    db.Listing.findAll({
      include: {
        model: db.User,
        as: 'lister',
        attributes: ['username'],
      },
      where: {
        isDeleted: false,
      },
    })
      .then((listings) => {
        // Find the list of unique categories
        const categories = db.Listing.rawAttributes.category.values;
        const listingStatus = db.Listing.rawAttributes.listingStatus.values;
        const deliveryModes = db.Listing.rawAttributes.deliveryMode.values;
        response.status(200).send({
          listings, categories, listingStatus, deliveryModes,
        });
      })
      .catch((error) => console.log(error));
  };

  const getListing = async (request, response) => {
    const { listingId } = request.params;
    const selectedListing = await db.Listing.findOne({
      where: { id: Number(listingId), isDeleted: false },
      include: {
        model: db.User,
        as: 'lister',
        attributes: ['username'],
      },
    });

    if (selectedListing === null || undefined === selectedListing) {
      response.status(400).send({ message: 'Not a valid listing', selectedListing });
    }
    response.status(200).send({ selectedListing });
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

    updatingListing.changed('images', true);
    const updatedListing = await updatingListing.save();
    response.status(200).send({ message: 'Update completed', updatedListing });
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
    console.log(request.files, 'request.files');
    request.files.forEach((file, idx) => {
      newListing.images[`img${imageStartIndex + idx}`] = file.location;
    });

    let updatedListing = null;
    try
    {
      newListing.changed('images', true);
      updatedListing = await newListing.save();
    }
    catch (err) {
      console.log(err);
    }
    response.status(200).send({ message: 'Image upload completed', updatedListing });
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

      // Manually include purchaser's name and reputation as they are nested
      purchaseData.username = purchase.purchaser.username;
      purchaseData.reputation = purchase.purchaser.reputation;

      // Specify as 'quantity' instead of qty in db
      purchaseData.quantity = purchase.qty;
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

  // Retrieve user's listings

  const myListings = async (req, res) => {
    try {
    // If authenticated
      if (req.loggedInUserId) {
        const myListingsArr = await db.Listing.findAll({
          where: {
            lister_id: req.loggedInUserId,
            isDeleted: false,
          },
        });
        const formattedMyListings = myListingsArr.map((listing) => ({
          ...listing.dataValues,
          startDate: convertToDdMmYy(listing.dataValues.startDate),
          endDate: convertToDdMmYy(listing.dataValues.endDate),
        }));
        res.send({ message: 'success', formattedMyListings });
      // Else say you are not authenticated
      } else {
        res.send({ message: 'failure' });
      }
    } catch (err) {
      console.log(err);
      console.log('error here');
    }
  };

  /**
   * Function to delete a specific listing
   */
  const deleteListing = async (request, response) => {
    try {
      // If authenticated
      if (request.loggedInUserId) {
        const { listingId } = request.params;
        // Check whether there are any purchases for the listing.
        // If there is, set the cancelled status
        const purchaseCount = await db.Purchase.count({ where: { listing_id: listingId } });
        const existingListing = await db.Listing.findByPk(Number(listingId));
        let responseMessage = '';
        if (purchaseCount > 0) {
          existingListing.listingStatus = 'cancelled';
          responseMessage = 'Listing can\'t be deleted as purchases are already made. Instead it\'s cancelled.';
        }
        else {
          existingListing.isDeleted = true;
          responseMessage = 'Deletion completed.';
        }
        await existingListing.save();
        response.status(200).send({ message: responseMessage });
      }
      else {
        // Else say you are not authenticated
        response.send({ message: 'Not authoirzed. Failed to delete the specified listing' });
      }
    } catch (err) {
      console.log(err);
      response.send({ message: 'Failed to delete the specified listing' });
    }
  };

  return {
    index,
    getListing,
    create,
    uploadCampaignPictures,
    updateListing,
    updateListingImages,
    getAllPurchases,
    myListings,
    deleteListing,
  };
}
