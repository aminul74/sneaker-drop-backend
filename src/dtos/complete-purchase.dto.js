class CompletePurchaseDTO {
  constructor(data) {
    this.reservationId = data.reservationId;
    this.validate();
  }

  validate() {
    if (!this.reservationId || typeof this.reservationId !== "number") {
      throw new Error("Reservation ID is required and must be a number");
    }
  }
}

module.exports = CompletePurchaseDTO;
