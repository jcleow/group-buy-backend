export default function initPurchasesController(db) {
  const index = async (req, res) => {
    res.send();
  };
  const addReceipt = async (req, res) => {
    console.log('req.file is:');
    console.log(req.file);
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

  return {
    index, countPurchasesPerListing, addReceipt,
  };
}
