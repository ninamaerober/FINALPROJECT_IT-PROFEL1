import React, { useState, useEffect } from "react";
import supabase from "../../lib/supabase";
import { Navigate, NavLink } from "react-router";
import { LogOut } from "react-feather";

export default function Receptionist() {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [checkinModalOpen, setCheckinModalOpen] = useState(false);
  const [roomModalOpen, setRoomModalOpen] = useState(false);

  const [newBooking, setNewBooking] = useState({
    guest: "",
    room: "",
    checkIn: "",
    checkOut: "",
    status: "Pending",
  });

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    fetchBookings();
    fetchRooms();
  }, []);

  const fetchBookings = async () => {
  const { data, error } = await supabase
    .from("bookings")
    .select(`
      id,
      booking_status,
      check_in,
      check_out,
      guest_name,
      room:rooms(name),
      guest:users(full_name)
    `)
    .order("check_in", { ascending: false });

  if (error) {
    console.error("Error fetching bookings:", error);
    return;
  }

  // Map snake_case / nested data to easy-to-use structure
  const mapped = data.map(b => ({
  id: b.id,
  guest: b.guest?.full_name || b.guest_name , // from users table
  room: b.room?.name || "",         // from rooms table
  status: b.booking_status,
  checkIn: b.check_in,
  checkOut: b.check_out,
}));


  setBookings(mapped || []);
};



  const fetchRooms = async () => {
    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .order("name");
    if (error) console.error("Error fetching rooms:", error);
    else {
      setRooms(data || []);
      // default room for new booking
      if (data?.length) setNewBooking((prev) => ({ ...prev, room: data[0].name }));
    }
  };

  // Create Booking
const handleBookingSubmit = async (e) => {
  e.preventDefault();
  if (!newBooking.room) return alert("Please select a room");

  const roomObj = rooms.find(r => r.name === newBooking.room);
  if (!roomObj) return alert("Selected room not found");

  // Insert and fetch inserted row immediately
  const { data, error } = await supabase
    .from("bookings")
    .insert([
      {
        guest_name: newBooking.guest,
        room_id: roomObj.id,
        check_in: newBooking.checkIn,
        check_out: newBooking.checkOut,
        booking_status: newBooking.status,
      },
    ])
    .select(`
      id,
      guest_name,
      room:rooms(name),
      check_in,
      check_out,
      booking_status
    `); // ensures nested room info comes too

  if (error) {
    console.error("Insert booking error:", error);
  } else if (data && data.length > 0) {
    const mappedBooking = {
      id: data[0].id,
      guest: data[0].guest_name,
      room: data[0].room?.name || "",
      checkIn: data[0].check_in,
      checkOut: data[0].check_out,
      status: data[0].booking_status,
    };
    setBookings([mappedBooking, ...bookings]); // direct fetch into state
    setNewBooking({ guest: "", room: rooms[0]?.name || "", checkIn: "", checkOut: "", status: "Pending" });
    setCreateModalOpen(false);
  } else {
    console.error("No data returned from insert");
  }
};


  // Update Booking Status
  const handleCheckinSubmit = async (e) => {
  e.preventDefault();
  if (!selectedBooking) return;

  const { error } = await supabase
    .from("bookings")
    .update({ booking_status: selectedBooking.status })
    .eq("id", selectedBooking.id);

  if (error) {
    console.error("Update booking error:", error);
    return;
  }

  // Update local state so table reflects new status
  setBookings(
    bookings.map((b) =>
      b.id === selectedBooking.id ? { ...b, status: selectedBooking.status } : b
    )
  );

  // Close modal
  setSelectedBooking(null);
  setCheckinModalOpen(false);
};


  // Update Room Status
  const handleRoomUpdate = async (e) => {
    e.preventDefault();
    if (!selectedRoom) return;
    const { error } = await supabase
      .from("rooms")
      .update({ status: selectedRoom.status })
      .eq("id", selectedRoom.id);
    if (error) console.error("Update room error:", error);
    else {
      setRooms(rooms.map(r => (r.id === selectedRoom.id ? { ...r, status: selectedRoom.status } : r)));
      setSelectedRoom(null);
      setRoomModalOpen(false);
    }
  };

  return (
    <div className="flex-1 p-8 bg-gradient-to-br from-gray-700 to-gray-400 min-h-screen">
      {/* Header */}
      <header className="mb-12 flex items-center justify-between">
  <div>
    <h1 className="text-5xl font-extrabold text-black tracking-tight">Receptionist Dashboard</h1>
    <p className="text-white mt-2 text-lg">
      Limited access: Handle bookings, check-ins, and room management efficiently.
    </p>
  </div>

  <NavLink to="/login" className="text-white hover:text-gray-300">
    <LogOut className="w-8 h-8" />
  </NavLink>
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
       
        <button onClick={() => setRoomModalOpen(true)}
          className="bg-white/10 backdrop-blur-xl shadow-2xl border border-blue-500 rounded-3xl p-10 w-full max-w-md relative z-10"
        >
          <h2 className="text-xl font-semibold mb-2">Room Status</h2>
          <p className="text-white/80 mb-4">Update room availability.</p>
          <span className="text-white font-semibold">Go &rarr; </span>
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
                  <th key={i} className="px-6 py-3 text-gray-700 font-medium uppercase tracking-wider">{th}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b border-gray-200 hover:bg-gray-100 transition-all">
                  <td className="px-6 py-4">{b.guest}</td>
                  <td className="px-6 py-4">{b.room}</td>
                  <td className="px-6 py-4">{b.checkIn}</td>
                  <td className="px-6 py-4">{b.checkOut}</td>
                  <td className={`px-6 py-4 font-semibold rounded-full text-center w-32 ${
                    b.status === "Confirmed" ? "bg-green-100 text-green-700" :
                    b.status === "Checked In" ? "bg-blue-100 text-blue-700" :
                    b.status === "Checked Out" ? "bg-gray-100 text-gray-700" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>
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
  onChange={(e) =>
    setSelectedBooking(bookings.find((b) => b.id.toString() === e.target.value))
  }
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
  <select
    value={selectedBooking.status || "Pending"}
    onChange={(e) =>
      setSelectedBooking({ ...selectedBooking, status: e.target.value })
    }
  >
    <option value="Pending">Pending</option>
    <option value="Confirmed">Confirmed</option>
    <option value="Checked In">Checked In</option>
    <option value="Checked Out">Checked Out</option>
  </select>
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
      <div id="room" className="flex justify-between items-center">
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
