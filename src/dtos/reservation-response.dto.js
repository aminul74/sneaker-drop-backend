class ReservationResponseDTO {
  constructor(reservation) {
    this.id = reservation.id;
    this.dropId = reservation.DropId;
    this.userId = reservation.UserId;
    this.status = reservation.status;
    this.expires_at = reservation.expires_at;
    this.createdAt = reservation.createdAt;
  }
}

module.exports = ReservationResponseDTO;
