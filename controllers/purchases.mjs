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
  return {
    index, addReceipt,
  };
}
