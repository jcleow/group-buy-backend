export default function initPurchasesController(db) {
  const index = async (req, res) => {
    res.send();
  };
  const addReceipt = async (req, res) => {
    console.log('req.body is:');
    console.log(req.body);
    console.log('req.file is:');
    console.log(req.file);
    // const { id } = req.body.selectedListingData;
    // get the instance of the listing to update the photo addres
    // const purchaseInstance = await db.Purchase.findByPk(id);
    // console.log('purchaseInstance is');
    // const imgUrl = req.file.location;
    // console.log(purchaseInstance);
    // purchaseInstance.paymentReceipt = imgUrl;
    // purchaseInstance.paymentStatus = 'processing';
    // purchaseInstance.purchaseStatus = 'committed';
    // await purchaseInstance.save();
    res.send();

    // get the user's id
    // get the item's listing id
    // create new db entry based on the following
    // db.Purchase.create({
    //   listId: '',
    //   purchaserId: '',
    //   purchase_status: 'committed',
    // paymentReceipt:req.file,
    // paymentStatus: 'paid',
    // });
  };

  // const uploadCampaignPictures = async (req, res) => {
  //   console.log(req.files, 'req.files');

  //   // Create a hashmap of all the image urls
  //   const imageUrls = {};
  //   req.files.forEach((file, idx) => {
  //     imageUrls[`img${idx + 1}`] = file.location;
  //   });

  //   console.log(imageUrls, 'imageUrls');

  //   const { listingId } = req.params;
  //   const newListing = await db.Listing.findByPk(Number(listingId));

  //   newListing.images = imageUrls;

  //   await newListing.save();

  //   res.send({ message: 'upload complete' });
  // };

  /**
   * Function to handle the request to count the number of purchases for a listing
   * @param request
   * @param response
   */
  const countPurchasesPerListing = async (request, response) => {
    db.Purchase.count({ where: { listing_id: request.params.listingId } })
      .then((purchaseCount) => {
        response.status(200).send({ purchaseCount });
      })
      .catch((error) => console.log(error));
  };

  const allPurchases = async (req, res) => {
    const userId = req.loggedInUserId;

    // use userId to query purchases table for all the purchases associated w/ the user
    const purchasesAssociatedWithUser = await db.Purchase.findAll({
      where: {
        purchaser_id: userId,
      },
      include: [{ model: db.Listing }],
    });
    console.log('purchasesAssociatedWithUser');
    console.log(purchasesAssociatedWithUser);
    // console.log('purchasesAssociatedWithUser.listing');
    // console.log(purchasesAssociatedWithUser.listing);
    res.send(purchasesAssociatedWithUser);

    // docs for mixins: https://sequelize.org/master/manual/assocs.html#one-to-many-relationships
    // for the mixin below, instead of get Purchases, use getPurchaser, which is the alias.
    // also, even tho getPurchaser is singular, it returns all purchases associated w/ e instance
    // const allPurchasesAssociatedWithUserId = (await userIdInstance.getPurchaser());
    // console.log('allPurchasesAssociatedWithUserId is:');
    // console.log(allPurchasesAssociatedWithUserId);
    // console.log(allPurchasesAssociatedWithUserId.length);
  };

  return {
    index, countPurchasesPerListing, addReceipt, allPurchases,
  };
}
