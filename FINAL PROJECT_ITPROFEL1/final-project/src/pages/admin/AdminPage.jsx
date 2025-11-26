import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import supabase from "../../lib/supabase";

export default function Admin() {
  // ===================== MODAL STATES =====================
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [promotionModalOpen, setPromotionModalOpen] = useState(false);

  // ===================== DATA STATES =====================
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [promotions, setPromotions] = useState([]);

  // ===================== ROOM STATES =====================
  const [newRoom, setNewRoom] = useState({ id: null, name: "", type: "", price: "", status: "Available" });
  const [editingRoom, setEditingRoom] = useState(null);

  // ===================== BOOKING STATES =====================
  const [newBooking, setNewBooking] = useState({ id: null, guest: "", room: "", checkIn: "", checkOut: "", status: "Pending" });
  const [editingBooking, setEditingBooking] = useState(null);

  // ===================== PROMOTION STATES =====================
  const [newPromotion, setNewPromotion] = useState({ title: "", discount: "", status: "Inactive" });
  const [editingPromotion, setEditingPromotion] = useState(null);

  // ===================== FETCH SUPABASE DATA =====================
  const fetchData = async () => {
    const { data: fetchedData, error } = await supabase.from("admin_view").select("*"); 
    if (error) {
      console.error("Error fetching data:", error);
      return;
    }

    if (fetchedData) {
      // Rooms
      const roomsData = Array.from(
        new Map(
          fetchedData.map(d => [d.room_name, {
            id: d.id,
            name: d.room_name,
            type: d.room_type,
            price: Number(d.room_price),
            status: d.room_status.charAt(0).toUpperCase() + d.room_status.slice(1)
          }])
        ).values()
      );
      setRooms(roomsData);

      // Bookings
      const bookingsData = fetchedData.map(d => ({
        id: d.id,
        guest: d.guest_name,
        room: d.room_name,
        checkIn: d.check_in,
        checkOut: d.check_out,
        status: d.booking_status ? d.booking_status.charAt(0).toUpperCase() + d.booking_status.slice(1) : "Pending"
      }));
      setBookings(bookingsData);

      // Payments
      const paymentsData = fetchedData.map(d => ({
        id: d.id,
        amount: Number(d.payment_amount),
        status: d.payment_status.charAt(0).toUpperCase() + d.payment_status.slice(1)
      }));
      setPayments(paymentsData);

      // Promotions
      const promotionsData = Array.from(
        new Map(
          fetchedData.map(d => [d.promo_title, {
            id: d.id,
            title: d.promo_title,
            discount: Number(d.promo_discount),
            status: d.promo_status.charAt(0).toUpperCase() + d.promo_status.slice(1)
          }])
        ).values()
      );
      setPromotions(promotionsData);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ===================== SUMMARY HELPERS =====================
  const totalRevenue = payments.filter(p => p.status === "Paid").reduce((sum, p) => sum + p.amount, 0);
  const pendingRevenue = payments.filter(p => p.status === "Pending").reduce((sum, p) => sum + p.amount, 0);

  // ===================== ROOM HANDLERS =====================
  const handleAddRoom = () => {
    if (!newRoom.name || !newRoom.type || !newRoom.price) return;
    if (editingRoom) {
      setRooms(prev => prev.map(r => r.id === editingRoom.id ? { ...newRoom, id: editingRoom.id, price: Number(newRoom.price) } : r));
      setEditingRoom(null);
    } else {
      setRooms(prev => [...prev, { ...newRoom, id: prev.length + 1, price: Number(newRoom.price) }]);
    }
    setNewRoom({ id: null, name: "", type: "", price: "", status: "Available" });
  };

  const handleEditRoom = (room) => {
    setEditingRoom(room);
    setNewRoom(room);
  };

  const handleDeleteRoom = (id) => {
    setRooms(prev => prev.filter(r => r.id !== id));
  };

  // ===================== BOOKING HANDLERS =====================
  const handleAddBooking = () => {
    if (!newBooking.guest || !newBooking.room || !newBooking.checkIn || !newBooking.checkOut) return;
    if (editingBooking) {
      setBookings(prev => prev.map(b => b.id === editingBooking.id ? { ...newBooking, id: editingBooking.id } : b));
      setEditingBooking(null);
    } else {
      setBookings(prev => [...prev, { ...newBooking, id: prev.length + 1 }]);
    }
    setNewBooking({ id: null, guest: "", room: "", checkIn: "", checkOut: "", status: "Pending" });
  };

  const handleEditBooking = (booking) => {
    setEditingBooking(booking);
    setNewBooking(booking);
  };

  const handleDeleteBooking = (id) => {
    setBookings(prev => prev.filter(b => b.id !== id));
  };

  // ===================== PROMOTION HANDLERS =====================
  const handleAddPromotion = () => {
    if (!newPromotion.title || !newPromotion.discount) return;
    if (editingPromotion) {
      setPromotions(prev => prev.map(p => p.id === editingPromotion.id ? { ...newPromotion, id: editingPromotion.id } : p));
      setEditingPromotion(null);
    } else {
      setPromotions(prev => [...prev, { ...newPromotion, id: prev.length + 1 }]);
    }
    setNewPromotion({ title: "", discount: "", status: "Inactive" });
  };

  const handleEditPromotion = (promo) => {
    setEditingPromotion(promo);
    setNewPromotion(promo);
  };

  const handleDeletePromotion = (id) => {
    setPromotions(prev => prev.filter(p => p.id !== id));
  };

  // ===================== JSX =====================
  return (
    <div className="flex-1 p-8 bg-gradient-to-br from-gray-700 to-gray-400 min-h-screen">
      {/* HEADER */}
      <header className="mb-10">
        <h1 className="text-5xl font-extrabold text-black tracking-tight">Admin Dashboard</h1>
        <p className="text-white mt-2 text-lg">Full access to all hotel system features.</p>
      </header>

      {/* SUMMARY CARDS */}
      <section className="mb-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white/10 backdrop-blur-xl shadow-2xl border border-blue-500 rounded-3xl p-10">
          <h2 className="text-xl font-semibold mb-2">Total Revenue</h2>
          <p className="text-3xl font-bold text-black">₱{totalRevenue.toLocaleString()}</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl shadow-2xl border border-blue-500 rounded-3xl p-10">
          <h2 className="text-xl font-semibold mb-2">Pending Payments</h2>
          <p className="text-3xl font-bold text-black">₱{pendingRevenue.toLocaleString()}</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl shadow-2xl border border-blue-500 rounded-3xl p-10">
          <h2 className="text-xl font-semibold mb-2">Total Bookings</h2>
          <p className="text-3xl font-bold">{bookings.length}</p>
        </div>
      </section>

      {/* MANAGEMENT CARDS */}
      <section className="mb-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div onClick={() => setRoomModalOpen(true)} className="bg-blue-100 border-2 border-blue-500 rounded-3xl p-10 hover:bg-blue-200 cursor-pointer">
          <h2 className="text-2xl font-semibold">Room Management</h2>
          <p className="text-gray-600 mt-2">Click to manage details.</p>
        </div>

        <div onClick={() => setBookingModalOpen(true)} className="bg-blue-100 border-2 border-blue-500 rounded-3xl p-10 hover:bg-blue-200 cursor-pointer">
          <h2 className="text-2xl font-semibold">Bookings</h2>
          <p className="text-gray-600 mt-2">Click to manage details.</p>
        </div>

        <Link to="/admin/payment" className="bg-blue-100 border-2 border-blue-500 rounded-3xl p-10 hover:bg-blue-200 cursor-pointer">
          <h2 className="text-2xl font-semibold">Payments</h2>
          <p className="text-gray-600 mt-2">View all payment details.</p>
        </Link>

        <div onClick={() => setPromotionModalOpen(true)} className="bg-blue-100 border-2 border-blue-500 rounded-3xl p-10 hover:bg-blue-200 cursor-pointer">
          <h2 className="text-2xl font-semibold">Promotions</h2>
          <p className="text-gray-600 mt-2">Click to manage promos.</p>
        </div>
      </section>

      {/* MODALS */}
      {/* ROOM MODAL */}
      {roomModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-auto">
          <div className="bg-white rounded-3xl p-8 w-full max-w-4xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-3xl font-bold">Room Management</h3>
              <button
                onClick={() => {
                  setRoomModalOpen(false);
                  setEditingRoom(null);
                  setNewRoom({ id: null, name: "", type: "", price: "", status: "Available" });
                }}
                className="text-gray-600 text-xl"
              >
                ×
              </button>
            </div>

            {/* Room Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <input type="text" placeholder="Room Name" value={newRoom.name} onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })} className="p-4 border rounded-xl" />
              <select value={newRoom.type} onChange={(e) => setNewRoom({ ...newRoom, type: e.target.value })} className="p-4 border rounded-xl">
                <option value="">Select Type</option>
                <option value="Standard">Standard</option>
                <option value="Executive">Executive</option>
                <option value="Suite">Suite</option>
              </select>
              <input type="number" placeholder="Price" value={newRoom.price} onChange={(e) => setNewRoom({ ...newRoom, price: e.target.value })} className="p-4 border rounded-xl" />
              <select value={newRoom.status} onChange={(e) => setNewRoom({ ...newRoom, status: e.target.value })} className="p-4 border rounded-xl">
                <option value="Available">Available</option>
                <option value="Occupied">Occupied</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>

            <div className="flex justify-end gap-4 mb-6">
              <button onClick={() => { setRoomModalOpen(false); setEditingRoom(null); }} className="px-6 py-2 bg-gray-300 rounded-xl">Close</button>
              <button onClick={handleAddRoom} className="px-6 py-2 bg-blue-600 text-white rounded-xl">{editingRoom ? "Save Changes" : "Add Room"}</button>
            </div>

            {/* Room Table */}
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Price</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr key={room.id} className="border-b">
                    <td className="px-4 py-2">{room.name}</td>
                    <td className="px-4 py-2">{room.type}</td>
                    <td className="px-4 py-2">₱{Number(room.price).toLocaleString()}</td>
                    <td className="px-4 py-2">{room.status}</td>
                    <td className="px-4 py-2 space-x-2">
                      <button onClick={() => handleEditRoom(room)} className="px-3 py-1 bg-yellow-500 text-white rounded">Edit</button>
                      <button onClick={() => handleDeleteRoom(room.id)} className="px-3 py-1 bg-red-500 text-white rounded">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* BOOKING MODAL */}
      {bookingModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-auto">
          <div className="bg-white rounded-3xl p-8 w-full max-w-4xl">
            <div className="flex justify-between mb-6">
              <h3 className="text-3xl font-bold">Booking Management</h3>
              <button
                onClick={() => {
                  setBookingModalOpen(false);
                  setEditingBooking(null);
                  setNewBooking({ id: null, guest: "", room: "", checkIn: "", checkOut: "", status: "Pending" });
                }}
                className="text-gray-600 text-xl"
              >
                ×
              </button>
            </div>

            {/* Booking Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <input type="text" placeholder="Guest Name" value={newBooking.guest} onChange={(e) => setNewBooking({ ...newBooking, guest: e.target.value })} className="p-4 border rounded-xl" />
              <select value={newBooking.room} onChange={(e) => setNewBooking({ ...newBooking, room: e.target.value })} className="p-4 border rounded-xl">
                <option value="">Select Room</option>
                {rooms.map(r => (
                  <option key={r.id} value={r.name}>{r.name}</option>
                ))}
              </select>
              <input type="date" value={newBooking.checkIn} onChange={(e) => setNewBooking({ ...newBooking, checkIn: e.target.value })} className="p-4 border rounded-xl" />
              <input type="date" value={newBooking.checkOut} onChange={(e) => setNewBooking({ ...newBooking, checkOut: e.target.value })} className="p-4 border rounded-xl" />
              <select value={newBooking.status} onChange={(e) => setNewBooking({ ...newBooking, status: e.target.value })} className="p-4 border rounded-xl col-span-2">
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex justify-end gap-4 mb-6">
              <button onClick={() => setBookingModalOpen(false)} className="px-6 py-2 bg-gray-300 rounded-xl">Close</button>
              <button onClick={handleAddBooking} className="px-6 py-2 bg-blue-600 text-white rounded-xl">{editingBooking ? "Save Changes" : "Add Booking"}</button>
            </div>

            {/* Booking Table */}
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-4 py-2">Guest</th>
                  <th className="px-4 py-2">Room</th>
                  <th className="px-4 py-2">Check-In</th>
                  <th className="px-4 py-2">Check-Out</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id} className="border-b">
                    <td className="px-4 py-2">{b.guest}</td>
                    <td className="px-4 py-2">{b.room}</td>
                    <td className="px-4 py-2">{b.checkIn}</td>
                    <td className="px-4 py-2">{b.checkOut}</td>
                    <td className="px-4 py-2">{b.status}</td>
                    <td className="px-4 py-2 space-x-2">
                      <button onClick={() => handleEditBooking(b)} className="px-3 py-1 bg-yellow-500 text-white rounded">Edit</button>
                      <button onClick={() => handleDeleteBooking(b.id)} className="px-3 py-1 bg-red-500 text-white rounded">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PROMOTION MODAL */}
      {promotionModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-auto">
          <div className="bg-white rounded-3xl p-8 w-full max-w-4xl">
            <div className="flex justify-between mb-6">
              <h3 className="text-3xl font-bold">Promotion Management</h3>
              <button
                onClick={() => {
                  setPromotionModalOpen(false);
                  setEditingPromotion(null);
                  setNewPromotion({ title: "", discount: "", status: "Inactive" });
                }}
                className="text-gray-600 text-xl"
              >
                ×
              </button>
            </div>

            {/* Promotion Form */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <input type="text" placeholder="Title" value={newPromotion.title} onChange={(e) => setNewPromotion({ ...newPromotion, title: e.target.value })} className="p-4 border rounded-xl" />
              <input type="number" placeholder="Discount %" value={newPromotion.discount} onChange={(e) => setNewPromotion({ ...newPromotion, discount: e.target.value })} className="p-4 border rounded-xl" />
              <select value={newPromotion.status} onChange={(e) => setNewPromotion({ ...newPromotion, status: e.target.value })} className="p-4 border rounded-xl">
                <option value="Inactive">Inactive</option>
                <option value="Active">Active</option>
              </select>
            </div>

            <div className="flex justify-end gap-4 mb-6">
              <button onClick={() => setPromotionModalOpen(false)} className="px-6 py-2 bg-gray-300 rounded-xl">Close</button>
              <button onClick={handleAddPromotion} className="px-6 py-2 bg-blue-600 text-white rounded-xl">{editingPromotion ? "Save Changes" : "Add Promotion"}</button>
            </div>

            {/* Promotion Table */}
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-4 py-2">Title</th>
                  <th className="px-4 py-2">Discount</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {promotions.map(p => (
                  <tr key={p.id} className="border-b">
                    <td className="px-4 py-2">{p.title}</td>
                    <td className="px-4 py-2">{p.discount}%</td>
                    <td className="px-4 py-2">{p.status}</td>
                    <td className="px-4 py-2 space-x-2">
                      <button onClick={() => handleEditPromotion(p)} className="px-3 py-1 bg-yellow-500 text-white rounded">Edit</button>
                      <button onClick={() => handleDeletePromotion(p.id)} className="px-3 py-1 bg-red-500 text-white rounded">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
