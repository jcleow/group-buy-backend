export default function initPurchasesController(db) {
  const index = async (req, res) => {
    res.send();
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
    res.send(purchasesAssociatedWithUser);

    // docs for mixins: https://sequelize.org/master/manual/assocs.html#one-to-many-relationships
    // for the mixin below, instead of get Purchases, use getPurchaser, which is the alias.
    // also, even tho getPurchaser is singular, it returns all purchases associated w/ e instance
    // const allPurchasesAssociatedWithUserId = (await userIdInstance.getPurchaser());
    // console.log('allPurchasesAssociatedWithUserId is:');
    // console.log(allPurchasesAssociatedWithUserId);
    // console.log(allPurchasesAssociatedWithUserId.length);
  };

  const recordPurchase = async (req, res) => {
    const { listingPK } = req.params;
    const { qtyOrdered } = req.params;
    const userId = req.loggedInUserId;

    // create a new entry in db.Purchase
    const newPurchaseInstance = await db.Purchase.create({
      listingId: listingPK,
      qty: qtyOrdered,
      purchaserId: userId,
      purchaseStatus: 'committed',
      purchaseDate: new Date(),
      paymentReceipt: req.file.location,
      receiptUploadDate: new Date(),
      paymentStatus: 'processing',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // update item's stock/ qtyRemaining in the listings table
    const relatedListing = await newPurchaseInstance.getListing();
    // deduct qty ordered from quantityRemaining
    relatedListing.quantityRemaining -= qtyOrdered;

    // check if this purchse causes MOQ to be reached
    const { quantity, quantityRemaining, moq } = relatedListing;
    if (quantity - quantityRemaining >= moq) {
      console.log('====================MOQ REACHED====================');
      relatedListing.dateMoqReached = new Date();
    }
    // save the update
    relatedListing.save();

    res.send();
  };

  const updateDateDelivered = async (req, res) => {
    const { purchaseId } = req.params;
    const { formattedNewDate } = req.body;
    await db.Purchase.update(
      { dateDelivered: formattedNewDate },
      {
        where: {
          id: purchaseId,
        },
      },
    );
    res.send({ message: 'updated' });
  };

  return {
    index, countPurchasesPerListing, recordPurchase, allPurchases, updateDateDelivered,
  };
}
