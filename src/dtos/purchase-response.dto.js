class PurchaseResponseDTO {
  constructor(purchase) {
    this.id = purchase.id;
    this.dropId = purchase.DropId;
    this.userId = purchase.UserId;
    this.createdAt = purchase.createdAt;
  }
}

module.exports = PurchaseResponseDTO;
