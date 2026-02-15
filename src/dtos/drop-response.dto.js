class DropResponseDTO {
  constructor(drop) {
    this.id = drop.id;
    this.name = drop.name;
    this.price = drop.price;
    this.total_stock = drop.total_stock;
    this.available_stock = drop.available_stock;
    this.start_time = drop.start_time;
    this.image_url = drop.image_url;
    this.purchases = drop.Purchases
      ? drop.Purchases.map((purchase) => ({
          id: purchase.id,
          username: purchase.User?.username || "Unknown",
          createdAt: purchase.createdAt,
        }))
      : [];
  }
}

module.exports = DropResponseDTO;
