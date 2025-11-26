import React, { useState } from "react";

export default function Payments() {
  const payments = [
    { id: 1, bookingId: "BK-1001", room: "Deluxe Suite", amount: 5000, status: "Pending", date: "2025-11-20" },
    { id: 2, bookingId: "BK-1002", room: "Standard Room", amount: 4500, status: "Paid", date: "2025-11-15" },
  ];

  const [openModal, setOpenModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("");

  const openPaymentModal = (payment) => {
    setSelectedPayment(payment);
    setOpenModal(true);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    alert(`Payment successful via ${paymentMethod}!`);
    setOpenModal(false);
    setPaymentMethod("");
  };

  return (
    <div className="flex-1 p-8 bg-gradient-to-br from-gray-700 to-gray-400 min-h-screen">

      {/* HEADER */}
      <div className="mb-10">
        <h1 className="text-5xl font-extrabold text-black tracking-tight">Payments</h1>
        <p className="text-white mt-2 text-lg max-w-xl">
          Review charges and complete secure payments for your bookings.
        </p>
      </div>

      {/* PAYMENT TABLE */}
      <div className="overflow-x-auto bg-white backdrop-blur-xl rounded-3xl shadow-2xl border border-blue-500 p-6">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="text-gray-600 text-sm font-semibold uppercase border-b">
              <th className="px-6 py-3 text-left">Booking ID</th>
              <th className="px-6 py-3 text-left">Room</th>
              <th className="px-6 py-3 text-left">Amount</th>
              <th className="px-6 py-3 text-left">Date</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-b border-gray-200 hover:bg-gray-50/50 transition">
                <td className="px-6 py-4 font-semibold text-gray-900">{p.bookingId}</td>
                <td className="px-6 py-4 text-gray-700">{p.room}</td>
                <td className="px-6 py-4 text-gray-700">₱{p.amount.toLocaleString()}</td>
                <td className="px-6 py-4 text-gray-600">{p.date}</td>
                <td className={`px-6 py-4 font-semibold ${p.status === "Paid" ? "text-green-600" : "text-yellow-600"}`}>
                  {p.status}
                </td>
                <td className="px-6 py-4">
                  {p.status === "Pending" ? (
                    <button
                      onClick={() => openPaymentModal(p)}
                      className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 active:scale-95 transition"
                    >
                      Pay Now
                    </button>
                  ) : (
                    <span className="text-gray-500">Completed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAYMENT METHOD MODAL */}
      {openModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center p-6 z-50 animate-fadeIn">
          <div className="bg-white/90 backdrop-blur-xl w-full max-w-md p-8 rounded-3xl shadow-2xl border border-white relative animate-fadeInDown">

            {/* CLOSE BUTTON */}
            <button
              onClick={() => setOpenModal(false)}
              className="absolute top-4 right-4 text-gray-600 hover:text-black text-2xl"
            >
              ✖
            </button>

            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Complete Payment</h2>
            <p className="text-gray-700 text-lg mb-4">
              <strong>{selectedPayment.room}</strong>
            </p>
            <p className="text-gray-700 mb-6">
              Total Amount:{" "}
              <span className="font-bold text-blue-700">₱{selectedPayment.amount.toLocaleString()}</span>
            </p>

            <form onSubmit={handlePaymentSubmit} className="space-y-6">
              <div className="flex flex-col gap-4">
                <label className="text-gray-700 font-medium">Select Payment Method</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("GCash")}
                    className={`flex-1 px-5 py-3 rounded-xl border-2 text-gray-800 font-semibold transition ${
                      paymentMethod === "GCash" ? "border-blue-600 bg-blue-50" : "border-gray-300"
                    }`}
                  >
                    GCash
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("Cash")}
                    className={`flex-1 px-5 py-3 rounded-xl border-2 text-gray-800 font-semibold transition ${
                      paymentMethod === "Cash" ? "border-green-600 bg-green-50" : "border-gray-300"
                    }`}
                  >
                    Cash
                  </button>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setOpenModal(false)}
                  className="px-5 py-3 bg-gray-300 rounded-xl hover:bg-gray-400 active:scale-95 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={!paymentMethod}
                  className={`px-5 py-3 text-white rounded-xl transition shadow-md ${
                    paymentMethod
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
