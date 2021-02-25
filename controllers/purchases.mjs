export default function initPurchasesController(db) {
  const index = async (req, res) => {
    res.send();
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
    index, countPurchasesPerListing,
  };
}
