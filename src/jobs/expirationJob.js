const reservationRepository = require("../repositories/reservation.repository");
const dropService = require("../services/drop.services");
const { EXPIRATION_CHECK_INTERVAL_MS } = require("../config/constants");

/**
 * Background job to expire reservations and restore stock
 * Runs periodically to find and process expired reservations
 */
function startExpirationJob() {
  setInterval(async () => {
    try {
      await processExpiredReservations();
    } catch (error) {
      console.error("Error processing expired reservations:", error);
    }
  }, EXPIRATION_CHECK_INTERVAL_MS);

  console.log(
    `Reservation expiration job started (checking every ${EXPIRATION_CHECK_INTERVAL_MS}ms)`,
  );
}

/**
 * Find and process all expired reservations
 */
async function processExpiredReservations() {
  const expiredReservations = await reservationRepository.findExpired();

  if (expiredReservations.length === 0) {
    return;
  }

  console.log(
    `Processing ${expiredReservations.length} expired reservation(s)`,
  );

  // Process each reservation independently
  const results = await Promise.allSettled(
    expiredReservations.map((reservation) =>
      dropService.expireReservation(reservation),
    ),
  );

  // Log any failures
  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error(
        `Failed to expire reservation ${expiredReservations[index].id}:`,
        result.reason,
      );
    } else {
      console.log(
        `Expired reservation ${expiredReservations[index].id} - restored stock for drop ${result.value.drop.id}`,
      );
    }
  });
}

module.exports = startExpirationJob;
