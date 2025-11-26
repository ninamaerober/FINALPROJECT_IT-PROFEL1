import React, { useState, useEffect } from "react";
import supabase from "../../lib/supabase";

export default function MyBookings() {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingsData, setBookingsData] = useState([]);

  const openModal = (booking) => setSelectedBooking(booking);
  const closeModal = () => setSelectedBooking(null);

  // ================== FETCH BOOKINGS ==================
  const fetchBookings = async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return;

    const { data, error } = await supabase
      .from("bookings")
      .select("*, rooms(name, price)")
      .eq("user_id", user.id)
      .order("check_in", { ascending: true });

    if (error) {
      console.error("Error fetching bookings:", error.message);
      return;
    }

    setBookingsData(
      data.map((b) => ({
        id: b.id,
        room: b.rooms?.name || "Unknown",
        checkIn: b.check_in,
        checkOut: b.check_out,
        booking_status: b.booking_status,
        guests: b.guests || 1,
        price: b.rooms?.price || 0,
      }))
    );
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // ================== ADD BOOKING ==================
  const handleAddBooking = async (roomId, checkIn, checkOut, status = "Pending") => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return alert("User not logged in");
    if (!roomId || !checkIn || !checkOut) return alert("Fill all required fields");

    try {
      //  Insert booking
      const { data: bookingData, error: bookingError } = await supabase
        .from("bookings")
        .insert([
          {
            user_id: user.id,
            room_id: roomId,
            check_in: checkIn,
            check_out: checkOut,
            booking_status: status,
          },
        ])
        .select() 
        .single();

      if (bookingError) throw bookingError;

      //  Automatically create payment for this booking
      const { error: paymentError } = await supabase
        .from("payments")
        .insert([
          {
            booking_id: bookingData.id,
            payment_amount: bookingData.price || 0,
            payment_status: "Pending",
          },
        ]);

      if (paymentError) throw paymentError;

      alert("Booking and payment successfully created!");
      fetchBookings();
    } catch (err) {
      alert("Failed to add booking: " + err.message);
    }
  };

  // ================== CANCEL BOOKING ==================
  const handleCancelBooking = async () => {
    if (!selectedBooking) return;

    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    try {
      const { error: paymentError } = await supabase
        .from("payments")
        .delete()
        .eq("booking_id", selectedBooking.id);

      if (paymentError) throw paymentError;

      // Then delete the booking
      const { error: bookingError } = await supabase
        .from("bookings")
        .delete()
        .eq("id", selectedBooking.id);

      if (bookingError) throw bookingError;

      alert(`Booking for ${selectedBooking.room} has been cancelled.`);
      setBookingsData(bookingsData.filter((b) => b.id !== selectedBooking.id));
      closeModal();
    } catch (err) {
      alert("Failed to cancel booking: " + err.message);
    }
  };

  // ================== RENDER ==================
  return (
    <div className="flex-1 p-8 bg-gradient-to-br from-gray-700 to-gray-400 min-h-screen">
      {/* HEADER */}
      <div className="mb-10">
        <h1 className="text-5xl font-extrabold text-black tracking-tight">My Bookings</h1>
        <p className="text-white mt-2 text-lg max-w-xl">
          Manage your past and ongoing room reservations easily.
        </p>
      </div>

      {/* TABLE */}
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
              <tr key={b.id} className="border-b border-gray-200 hover:bg-gray-50/50 transition">
                <td className="px-6 py-4 font-semibold text-gray-900">{b.room}</td>
                <td className="px-6 py-4 text-gray-600">{b.checkIn}</td>
                <td className="px-6 py-4 text-gray-600">{b.checkOut}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold shadow-sm ${
                      b.booking_status === "Confirmed"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {b.booking_status}
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
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-600 hover:text-black text-2xl"
            >
              ✖
            </button>

            <h2 className="text-4xl font-extrabold text-gray-900 mb-6">Booking Summary</h2>

            <div className="space-y-4 text-gray-700 text-lg">
              <p><span className="font-semibold">Room:</span> {selectedBooking.room}</p>
              <p><span className="font-semibold">Check-In:</span> {selectedBooking.checkIn}</p>
              <p><span className="font-semibold">Check-Out:</span> {selectedBooking.checkOut}</p>
              <p><span className="font-semibold">Guests:</span> {selectedBooking.guests}</p>
              <p>
                <span className="font-semibold">Total Price:</span>{" "}
                <span className="text-blue-700 font-bold">₱{selectedBooking.price.toLocaleString()}</span>
              </p>
              <p
                className={`font-bold ${
                  selectedBooking.booking_status === "Confirmed"
                    ? "text-green-600"
                    : "text-yellow-600"
                }`}
              >
                Status: {selectedBooking.booking_status}
              </p>
            </div>

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
