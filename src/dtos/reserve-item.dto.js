class ReserveItemDTO {
  constructor(data) {
    this.dropId = data.dropId;
    // this.userId = data.userId;
    this.validate();
  }

  validate() {
    if (!this.dropId || typeof this.dropId !== "number") {
      throw new Error("Drop ID is required and must be a number");
    }
    // if (!this.userId || typeof this.userId !== "number") {
    //   throw new Error("User ID is required and must be a number");
    // }
  }
}

module.exports = ReserveItemDTO;
