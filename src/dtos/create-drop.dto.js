class CreateDropDTO {
  constructor(data) {
    this.name = data.name;
    this.price = data.price;
    this.total_stock = data.total_stock;
    this.start_time = data.start_time;
    this.validate();
  }

  validate() {
    if (!this.name || typeof this.name !== "string") {
      throw new Error("Name is required and must be a string");
    }
    if (!this.price || typeof this.price !== "number" || this.price <= 0) {
      throw new Error("Price is required and must be a positive number");
    }
    if (
      !this.total_stock ||
      typeof this.total_stock !== "number" ||
      this.total_stock <= 0
    ) {
      throw new Error("Total stock is required and must be a positive number");
    }
    if (!this.start_time) {
      throw new Error("Start time is required");
    }
  }
}

module.exports = CreateDropDTO;
