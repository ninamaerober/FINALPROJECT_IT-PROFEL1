import React, { useState, useEffect } from "react";
import { NavLink } from "react-router";
import supabase from "../../lib/supabase";
import { LogOut } from "react-feather";

export default function Admin() {
  // ===================== MODAL STATES =====================
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [promotionModalOpen, setPromotionModalOpen] = useState(false);

  // ===================== DATA STATES =====================
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [users, setUsers] = useState([]);
  

  // ===================== FORM STATES =====================
  const defaultBooking = { id: null, userId: "", roomId: "", checkIn: "", checkOut: "", status: "Pending" };
  const defaultRoom = { id: null, name: "", type: "", price: "", status: "Available", imageFile: null };
  const defaultPromotion = { id: null, title: "", discount: "", status: "Inactive" };

  const [newBooking, setNewBooking] = useState(defaultBooking);
  const [newRoom, setNewRoom] = useState(defaultRoom);
  const [newPromotion, setNewPromotion] = useState(defaultPromotion);

  const [editingRoom, setEditingRoom] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);
  const [editingPromotion, setEditingPromotion] = useState(null);

  // ===================== FETCH DATA =====================
  const fetchData = async () => {
    const { data: roomsData } = await supabase.from("rooms").select("*");
    setRooms(roomsData || []);
    const { data: bookingsData, error } = await supabase
  .from("bookings")
  .select(`
    id,
    check_in,
    check_out,
    booking_status,
    guest_name,
    room_id,
    user_id,
    users(full_name)
  `);

if (error) console.log(error);
setBookings(bookingsData || []);

    setBookings(bookingsData || []);
    const { data: promotionsData } = await supabase.from("promotions").select("*");
    setPromotions(promotionsData || []);
    const { data: usersData } = await supabase
  .from("users")
  .select("id, full_name")
  .eq("role", "guest");
setUsers(usersData || []);

  };

  useEffect(() => {
    fetchData();
      fetchPaymentsSummary();
      fetchUsers();

  }, []);

  // ===================== REVENUE CALCULATION =====================
   const [totalRevenue, setTotalRevenue] = useState(0);
  const [pendingPayments, setPendingPayments] = useState(0);

  // ===================== HANDLERS =====================

 const uploadRoomImage = async (file) => {
  if (!file) return null;

  const fileName = `${Date.now()}_${file.name}`;

  // Upload the file
  const { data, error } = await supabase.storage
    .from("room-images")
    .upload(fileName, file);

  if (error) {
    console.error("Upload error:", error.message);
    return null;
  }

  // Get public URL
  const { data: urlData, error: urlError } = supabase.storage
    .from("room-images")
    .getPublicUrl(fileName);

  if (urlError) {
    console.error("Error getting public URL:", urlError.message);
    return null;
  }

  return urlData.publicUrl;
};




  // ---- ROOM ----
   const handleAddRoom = async () => {
  if (!newRoom.name || !newRoom.type || !newRoom.price) return alert("Fill all room fields");

  try {
    let imageUrl = null;
    if (newRoom.imageFile) {
      imageUrl = await uploadRoomImage(newRoom.imageFile);
    }

    const payload = {
      name: newRoom.name,
      type: newRoom.type,
      price: Number(newRoom.price),
      status: newRoom.status,
      image: imageUrl, // <-- store URL here
    };

    let error = null;
    if (editingRoom) {
      const { error: updateError } = await supabase
        .from("rooms")
        .update(payload)
        .eq("id", editingRoom.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from("rooms")
        .insert([payload]);
      error = insertError;
    }

    if (error) throw error;

    setNewRoom(defaultRoom);
    setEditingRoom(null);
    setRoomModalOpen(false);
    fetchData();
  } catch (err) {
    alert(err.message || "Room error");
  }
};



  const handleDeleteRoom = async (id) => {
    if (!window.confirm("Delete this room?")) return;
    await supabase.from("rooms").delete().eq("id", id);
    fetchData();
  };

  const handleEditRoom = (room) => {
    setEditingRoom(room);
    setNewRoom({ ...room, price: Number(room.price) });
    setRoomModalOpen(true);
  };

  // ---- BOOKING ----
  const handleAddBooking = async () => {
    if (!newBooking.userId || !newBooking.roomId) return alert("Select a guest and room");
    if (!newBooking.checkIn || !newBooking.checkOut) return alert("Fill check-in and check-out dates");

    // UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(newBooking.userId) || !uuidRegex.test(newBooking.roomId)) {
      return alert("Invalid UUID for user or room");
    }

    const payload = {
      user_id: newBooking.userId,
      room_id: newBooking.roomId,
      check_in: newBooking.checkIn,
      check_out: newBooking.checkOut,
      booking_status: newBooking.status,
    };

    try {
      let error = null;
      if (editingBooking) {
        const { error: updateError } = await supabase.from("bookings").update(payload).eq("id", editingBooking.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase.from("bookings").insert([payload]);
        error = insertError;
      }
      if (error) throw error;
      setNewBooking(defaultBooking);
      setEditingBooking(null);
      setBookingModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.message || "Booking error");
    }
  };

  const handleDeleteBooking = async (id) => {
    if (!window.confirm("Delete this booking?")) return;
    await supabase.from("bookings").delete().eq("id", id);
    fetchData();
  };

  const handleEditBooking = (b) => {
    setEditingBooking(b);
    setNewBooking({
      id: b.id,
      userId: b.userId,
      roomId: b.roomId,
      checkIn: b.checkIn,
      checkOut: b.checkOut,
      status: b.status,
    });
    setBookingModalOpen(true);
  };

// ---- PROMOTION ----
const handlePromotionChange = (e) => {
  const { name, value } = e.target;
  setNewPromotion({ ...newPromotion, [name]: value });
};

const handleAddPromotion = async () => {
  if (!newPromotion.title || !newPromotion.discount)
    return alert("Please fill in all fields");

  const { error } = await supabase.from("promotions").insert([
    {
      title: newPromotion.title,
      discount: parseFloat(newPromotion.discount),
      status: newPromotion.status,
    },
  ]);

  if (error) return alert("Failed to add promotion: " + error.message);

  alert("Promotion added successfully!");

  setNewPromotion({ id: null, title: "", discount: "", status: "Inactive" });
  fetchData(); // refresh promotions
};
  


  const handleDeletePromotion = async (id) => {
    if (!window.confirm("Delete this promotion?")) return;
    await supabase.from("promotions").delete().eq("id", id);
    fetchData();
  };

  const handleEditPromotion = (p) => {
    setEditingPromotion(p);
    setNewPromotion({ ...p, discount: Number(p.discount) });
    setPromotionModalOpen(true);
  };

  const fetchPaymentsSummary = async () => {
  // Fetch all payments with booking info
  const { data, error } = await supabase
    .from("payments")
    .select(`
      payment_amount,
      payment_status
    `);

  if (error) {
    console.error("Error fetching payments summary:", error.message);
    return;
  }

  const paidTotal = data
    .filter(p => p.payment_status === "Paid")
    .reduce((sum, p) => sum + Number(p.payment_amount), 0);

  const pendingTotal = data
    .filter(p => p.payment_status === "Pending")
    .reduce((sum, p) => sum + Number(p.payment_amount), 0);

  setTotalRevenue(paidTotal);
  setPendingPayments(pendingTotal);
};


const fetchUsers = async () => {
  const { data, error } = await supabase
    .from("users")
    .select("id, full_name, role")
    .eq("role", "guest");  // 🔥 only guests

  if (error) return console.error(error);
  setUsers(data);
};



  return (
    <div className="flex-1 p-8 bg-gradient-to-br from-gray-700 to-gray-400 min-h-screen">
      {/* HEADER */}
      <header className="mb-12 flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-extrabold text-black tracking-tight">Admin Dashboard</h1>
          <p className="text-white mt-2 text-lg">Full access to all hotel system features.</p>
        </div>
        <NavLink to="/login"><LogOut /></NavLink>
      </header>

      {/* SUMMARY CARDS */}
      <section className="mb-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white/10 backdrop-blur-xl shadow-2xl border border-blue-500 rounded-3xl p-10">
          <h2 className="text-xl font-semibold mb-2">Total Revenue</h2>
          <p className="text-3xl font-bold text-black">₱{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-xl shadow-2xl border border-blue-500 rounded-3xl p-10">
          <h2 className="text-xl font-semibold mb-2">Pending Payments</h2>
          <p className="text-3xl font-bold text-black">₱{pendingPayments.toLocaleString()}</p>
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
        <NavLink to="/admin/payment" className="bg-blue-100 border-2 border-blue-500 rounded-3xl p-10 hover:bg-blue-200 cursor-pointer">
          <h2 className="text-2xl font-semibold">Payments</h2>
          <p className="text-gray-600 mt-2">View all payment details.</p>
        </NavLink>
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
                  setNewRoom({ id: null, name: "", type: "", price: "", status: "Available", imageFile: null });
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
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setNewRoom({ ...newRoom, imageFile: e.target.files[0] })}
                className="p-4 border rounded-xl"
              />

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
      {/* BOOKING MODAL */}
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
            setNewBooking({ id: null, userId: "", roomId: "", checkIn: "", checkOut: "", status: "Pending" });
          }}
          className="text-gray-600 text-xl"
        >
          ×
        </button>
      </div>

      {/* Booking Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* Guest selection */}
        <select
  value={newBooking.userId}
  onChange={(e) => setNewBooking({ ...newBooking, userId: e.target.value })}
  className="p-4 border rounded-xl"
>
  <option value="">Select Guest</option>
  {users.map((u) => (
    <option key={u.id} value={u.id}>
      {u.full_name}
    </option>
  ))}
</select>


        {/* Room selection */}
        <select
          value={newBooking.roomId}
          onChange={(e) => setNewBooking({ ...newBooking, roomId: e.target.value })}
          className="p-4 border rounded-xl"
        >
          <option value="">Select Room</option>
          {rooms.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>

        {/* Check-in / Check-out */}
        <input
          type="date"
          value={newBooking.checkIn}
          onChange={(e) => setNewBooking({ ...newBooking, checkIn: e.target.value })}
          className="p-4 border rounded-xl"
        />
        <input
          type="date"
          value={newBooking.checkOut}
          onChange={(e) => setNewBooking({ ...newBooking, checkOut: e.target.value })}
          className="p-4 border rounded-xl"
        />

        {/* Booking status */}
        <select
          value={newBooking.status}
          onChange={(e) => setNewBooking({ ...newBooking, status: e.target.value })}
          className="p-4 border rounded-xl col-span-2"
        >
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-4 mb-6">
        <button
          onClick={() => {
            setBookingModalOpen(false);
            setEditingBooking(null);
            setNewBooking({ id: null, userId: "", roomId: "", checkIn: "", checkOut: "", status: "Pending" });
          }}
          className="px-6 py-2 bg-gray-300 rounded-xl"
        >
          Close
        </button>
        <button
          onClick={handleAddBooking}
          className="px-6 py-2 bg-blue-600 text-white rounded-xl"
        >
          {editingBooking ? "Save Changes" : "Add Booking"}
        </button>
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
<td className="px-4 py-2">
  {b.guest_name || b.users?.full_name || "Unknown"}
</td>
              <td className="px-4 py-2">{rooms.find(r => r.id === b.room_id)?.name || "Unknown"}</td>
              <td className="px-4 py-2">{b.check_in}</td>
              <td className="px-4 py-2">{b.check_out}</td>
              <td className="px-4 py-2">{b.booking_status}</td>
              <td className="px-4 py-2 space-x-2">
                <button
                  onClick={() => handleEditBooking({
                    id: b.id,
                    userId: b.user_id,
                    roomId: b.room_id,
                    checkIn: b.check_in,
                    checkOut: b.check_out,
                    status: b.booking_status
                  })}
                  className="px-3 py-1 bg-yellow-500 text-white rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteBooking(b.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded"
                >
                  Delete
                </button>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
  <input
    type="text"
    name="title"
    placeholder="Promotion Title"
    value={newPromotion.title}
    onChange={handlePromotionChange}
    className="p-4 border rounded-xl"
  />

  <input
    type="number"
    name="discount"
    placeholder="Discount %"
    value={newPromotion.discount}
    onChange={handlePromotionChange}
    className="p-4 border rounded-xl"
  />

  <select
    name="status"
    value={newPromotion.status}
    onChange={handlePromotionChange}
    className="p-4 border rounded-xl"
  >
    <option value="Active">Active</option>
    <option value="Inactive">Inactive</option>
  </select>
</div>

            <div className="flex justify-end gap-4">
  <button onClick={() => setPromotionModalOpen(false)} className="px-6 py-2 bg-gray-300 rounded-xl">
    Close
  </button>
  <button onClick={handleAddPromotion} className="px-6 py-2 bg-blue-600 text-white rounded-xl">
    Add Promotion
  </button>
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
