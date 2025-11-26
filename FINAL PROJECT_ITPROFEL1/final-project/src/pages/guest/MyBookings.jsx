import React, { useState } from "react";

const bookingsData = [
  {
    id: 1,
    room: "Deluxe Suite",
    checkIn: "2025-11-20",
    checkOut: "2025-11-22",
    status: "Confirmed",
    guests: 2,
    price: 5000,
  },
  {
    id: 2,
    room: "Standard Room",
    checkIn: "2025-11-25",
    checkOut: "2025-11-27",
    status: "Pending",
    guests: 1,
    price: 4500,
  },
];

export default function MyBookings() {
  const [selectedBooking, setSelectedBooking] = useState(null);

  const openModal = (booking) => setSelectedBooking(booking);
  const closeModal = () => setSelectedBooking(null);

  const handleCancelBooking = () => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      alert(`Booking for ${selectedBooking.room} has been cancelled.`);
      closeModal();
    }
  };

  return (
    <div className="flex-1 p-8 bg-gradient-to-br from-gray-700 to-gray-400 min-h-screen">

      {/* HEADER */}
      <div className="mb-10">
        <h1 className="text-5xl font-extrabold text-black tracking-tight">
          My Bookings
        </h1>
        <p className="text-white mt-2 text-lg max-w-xl">
          Manage your past and ongoing room reservations easily.
        </p>
      </div>

      {/* TABLE WRAPPER */}
      <div className="overflow-x-auto bg-white backdrop-blur-xl rounded-3xl shadow-2xl border border-blue-500 p-6">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="text-gray-600 text-sm font-semibold uppercase border-b">
              <th className="px-6 py-3 text-left">Room</th>
              <th className="px-6 py-3 text-left">Check-In</th>
              <th className="px-6 py-3 text-left">Check-Out</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {bookingsData.map((b) => (
              <tr
                key={b.id}
                className="border-b border-gray-200 hover:bg-gray-50/50 transition"
              >
                <td className="px-6 py-4 font-semibold text-gray-900">{b.room}</td>
                <td className="px-6 py-4 text-gray-600">{b.checkIn}</td>
                <td className="px-6 py-4 text-gray-600">{b.checkOut}</td>

                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold shadow-sm ${
                      b.status === "Confirmed"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {b.status}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <button
                    onClick={() => openModal(b)}
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 active:scale-95 transition"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fadeIn">

          <div className="bg-white/90 backdrop-blur-xl w-full max-w-xl rounded-3xl shadow-2xl border border-white p-8 animate-fadeInDown relative">

            {/* CLOSE BUTTON */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-600 hover:text-black text-2xl"
            >
              ✖
            </button>

            <h2 className="text-4xl font-extrabold text-gray-900 mb-6">
              Booking Summary
            </h2>

            <div className="space-y-4 text-gray-700 text-lg">
              <p><span className="font-semibold">Room:</span> {selectedBooking.room}</p>
              <p><span className="font-semibold">Check-In:</span> {selectedBooking.checkIn}</p>
              <p><span className="font-semibold">Check-Out:</span> {selectedBooking.checkOut}</p>
              <p><span className="font-semibold">Guests:</span> {selectedBooking.guests}</p>

              <p>
                <span className="font-semibold">Total Price:</span>{" "}
                <span className="text-blue-700 font-bold">
                  ₱{selectedBooking.price.toLocaleString()}
                </span>
              </p>

              <p
                className={`font-bold ${
                  selectedBooking.status === "Confirmed"
                    ? "text-green-600"
                    : "text-yellow-600"
                }`}
              >
                Status: {selectedBooking.status}
              </p>
            </div>

            {/* BUTTONS */}
            <div className="mt-10 flex justify-between">
              <button
                onClick={handleCancelBooking}
                className="px-6 py-3 bg-red-600 text-white rounded-xl shadow hover:bg-red-700 active:scale-95 transition"
              >
                Cancel Booking
              </button>

              <button
                onClick={closeModal}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 active:scale-95 transition"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
