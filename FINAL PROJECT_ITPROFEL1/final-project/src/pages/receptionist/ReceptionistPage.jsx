import React, { useState } from "react";

const bookingsDataInitial = [
  { id: 1, guest: "John Doe", room: "Deluxe Suite", checkIn: "2025-11-20", checkOut: "2025-11-22", status: "Confirmed" },
  { id: 2, guest: "Jane Smith", room: "Standard Room", checkIn: "2025-11-21", checkOut: "2025-11-23", status: "Pending" },
];

const roomsDataInitial = [
  { id: 1, name: "Deluxe Suite", type: "Suite", status: "Available" },
  { id: 2, name: "Standard Room", type: "Standard", status: "Available" },
  { id: 3, name: "Executive Room", type: "Executive", status: "Available" },
  { id: 4, name: "Presidential Suite", type: "Executive", status: "Occupied" },
];

export default function Receptionist() {
  const [bookings, setBookings] = useState(bookingsDataInitial);
  const [rooms, setRooms] = useState(roomsDataInitial);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [checkinModalOpen, setCheckinModalOpen] = useState(false);
  const [roomModalOpen, setRoomModalOpen] = useState(false);

  const [newBooking, setNewBooking] = useState({
    guest: "",
    room: rooms[0].name,
    checkIn: "",
    checkOut: "",
    status: "Pending",
  });

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // ----- Handlers -----
  const handleBookingSubmit = (e) => {
    e.preventDefault();
    const newId = bookings.length + 1;
    setBookings([...bookings, { id: newId, ...newBooking }]);
    setNewBooking({ guest: "", room: rooms[0].name, checkIn: "", checkOut: "", status: "Pending" });
    setCreateModalOpen(false);
  };

  const handleCheckinSubmit = (e) => {
    e.preventDefault();
    setBookings(
      bookings.map((b) =>
        b.id === selectedBooking.id ? { ...b, status: selectedBooking.status } : b
      )
    );
    setSelectedBooking(null);
    setCheckinModalOpen(false);
  };

  const handleRoomUpdate = (e) => {
    e.preventDefault();
    setRooms(
      rooms.map((r) =>
        r.id === selectedRoom.id ? { ...r, status: selectedRoom.status } : r
      )
    );
    setSelectedRoom(null);
    setRoomModalOpen(false);
  };

  // ----- JSX -----
  return (
    <div className="flex-1 p-8 bg-gradient-to-br from-gray-700 to-gray-400 min-h-screen">

      {/* Header */}
      <header className="mb-12">
        <h1 className="text-5xl font-extrabold text-black tracking-tight">Receptionist Dashboard</h1>
        <p className="text-white mt-2 text-lg">Limited access: Handle bookings, check-ins, and room management efficiently.</p>
      </header>

      {/* Quick Action Cards */}
      <section className="mb-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <button
          onClick={() => setCreateModalOpen(true)}
          className="bg-white/10 backdrop-blur-xl shadow-2xl border border-blue-500 rounded-3xl p-10 w-full max-w-md relative z-10"
        >
          <h2 className="text-xl font-semibold mb-2">Create Booking</h2>
          <p className="text-white/80 mb-4">Add a new guest booking.</p>
          <span className="text-white font-semibold">Go &rarr;</span>
        </button>

        <button
          onClick={() => setCheckinModalOpen(true)}
          className="bg-white/10 backdrop-blur-xl shadow-2xl border border-blue-500 rounded-3xl p-10 w-full max-w-md relative z-10"
        >
          <h2 className="text-xl font-semibold mb-2">Check-In / Check-Out</h2>
          <p className="text-white/80 mb-4">Update guest status.</p>
          <span className="text-white font-semibold">Go &rarr;</span>
        </button>

        <button
          onClick={() => setRoomModalOpen(true)}
          className="bg-white/10 backdrop-blur-xl shadow-2xl border border-blue-500 rounded-3xl p-10 w-full max-w-md relative z-10"
        >
          <h2 className="text-xl font-semibold mb-2">Room Status</h2>
          <p className="text-white/80 mb-4">Update room availability.</p>
          <span className="text-white font-semibold">Go &rarr;</span>
        </button>
      </section>

      {/* Recent Bookings Table */}
      <section className="mb-12">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">Recent Bookings</h2>

        <div className="overflow-x-auto bg-gray-50 border border-gray-200 rounded-3xl shadow-xl">
          <table className="min-w-full text-left border-collapse">
          <thead className="bg-gray-100">
        <tr>
          {["Guest", "Room", "Check-In", "Check-Out", "Status"].map((th, i) => (
            <th
              key={i}
              className="px-6 py-3 text-gray-700 font-medium uppercase tracking-wider"
            >
              {th}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {bookings.map((b) => (
          <tr
            key={b.id}
            className="border-b border-gray-200 hover:bg-gray-100 transition-all"
          >
            <td className="px-6 py-4">{b.guest}</td>
            <td className="px-6 py-4">{b.room}</td>
            <td className="px-6 py-4">{b.checkIn}</td>
            <td className="px-6 py-4">{b.checkOut}</td>
            <td
              className={`px-6 py-4 font-semibold rounded-full text-center w-32 ${
                b.status === "Confirmed"
                  ? "bg-green-100 text-green-700"
                  : b.status === "Checked In"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {b.status}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</section>


      {/* Rooms Status Table */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Room Status</h2>
        <div className="overflow-x-auto bg-white shadow-xl rounded-2xl">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {["Room", "Type", "Status", "Action"].map((th, i) => (
                  <th key={i} className="px-6 py-3 text-left text-gray-600 uppercase tracking-wider">{th}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rooms.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-3">{r.name}</td>
                  <td className="px-6 py-3">{r.type}</td>
                  <td className={`px-6 py-3 font-semibold ${r.status === "Available" ? "text-green-600" : r.status === "Occupied" ? "text-red-600" : "text-yellow-600"}`}>
                    {r.status}
                  </td>
                  <td className="px-6 py-3">
                    <button
                      onClick={() => { setSelectedRoom(r); setRoomModalOpen(true); }}
                      className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ===================== CREATE BOOKING MODAL ====================== */}
     {createModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-5xl p-8 animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Create Booking</h2>
        <button 
          onClick={() => setCreateModalOpen(false)} 
          className="text-gray-400 hover:text-gray-600 transition text-2xl font-bold"
        >
          ×
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleBookingSubmit} className="space-y-5">
        <div>
          <label className="block text-gray-700 font-medium mb-2">Guest Name</label>
          <input
            type="text"
            value={newBooking.guest}
            onChange={(e) => setNewBooking({ ...newBooking, guest: e.target.value })}
            className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            placeholder="Enter guest name"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Room</label>
          <select
            value={newBooking.room}
            onChange={(e) => setNewBooking({ ...newBooking, room: e.target.value })}
            className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
          >
            <option value="">Select Room</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.name}>{room.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Check-In</label>
            <input
              type="date"
              value={newBooking.checkIn}
              onChange={(e) => setNewBooking({ ...newBooking, checkIn: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Check-Out</label>
            <input
              type="date"
              value={newBooking.checkOut}
              onChange={(e) => setNewBooking({ ...newBooking, checkOut: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              required
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 mt-6">
          <button 
            type="button" 
            onClick={() => setCreateModalOpen(false)} 
            className="px-5 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition shadow-md"
          >
            Create
          </button>
        </div>
      </form>
    </div>
  </div>
)}

      {/* ===================== CHECK-IN MODAL ====================== */}
      {checkinModalOpen && (
       <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
       <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-5xl p-8 animate-fadeIn">
    {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Check-In / Check-Out</h2>
        <button 
          onClick={() => setCheckinModalOpen(false)} 
          className="text-gray-400 hover:text-gray-600 transition text-2xl font-bold"
        >
          ×
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleCheckinSubmit} className="space-y-5">
        {/* Booking Selector */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Select Booking</label>
          <select
            value={selectedBooking?.id || ""}
            onChange={(e) => setSelectedBooking(bookings.find((b) => b.id === parseInt(e.target.value)))}
            className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm"
            required
          >
            <option value="" disabled>Select booking</option>
            {bookings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.guest} - {b.room} ({b.status})
              </option>
            ))}
          </select>
        </div>

        {/* Status Update */}
        {selectedBooking && (
          <div>
            <label className="block text-gray-700 font-medium mb-2">Update Status</label>
            <select
              value={selectedBooking.status}
              onChange={(e) => setSelectedBooking({ ...selectedBooking, status: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm"
            >
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Checked In">Checked In</option>
              <option value="Checked Out">Checked Out</option>
            </select>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-4 mt-6">
          <button 
            type="button" 
            onClick={() => setCheckinModalOpen(false)} 
            className="px-5 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="px-5 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition shadow-md"
          >
            Update
          </button>
        </div>
      </form>
    </div>
  </div>
)}

    {/* ===================== ROOM MODAL ====================== */}
     {roomModalOpen && selectedRoom && (
       <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
       <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-5xl p-8 animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Room Status</h2>
        <button 
          onClick={() => setRoomModalOpen(false)} 
          className="text-gray-400 hover:text-gray-600 text-2xl font-bold transition"
        >
          ×
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleRoomUpdate} className="space-y-5">
        {/* Room Name */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Room</label>
          <input
            type="text"
            value={selectedRoom.name}
            disabled
            className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-gray-100 shadow-sm"
          />
        </div>

        {/* Status Selector */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Status</label>
          <select
            value={selectedRoom.status}
            onChange={(e) => setSelectedRoom({ ...selectedRoom, status: e.target.value })}
            className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm"
          >
            <option value="Available">Available</option>
            <option value="Occupied">Occupied</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 mt-6">
          <button 
            type="button" 
            onClick={() => setRoomModalOpen(false)} 
            className="px-5 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition shadow-md"
          >
            Update
          </button>
        </div>
      </form>
    </div>
  </div>
)}

    </div>
  );
}
