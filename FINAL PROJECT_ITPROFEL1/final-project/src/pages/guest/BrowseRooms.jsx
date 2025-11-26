import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import supabase from "../../lib/supabase";

export default function BrowseRooms() {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomsData, setRoomsData] = useState([]);

  const openModal = (room) => setSelectedRoom(room);
  const closeModal = () => setSelectedRoom(null);

  const fetchRooms = async () => {
    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching rooms:", error.message);
      return;
    }

    setRoomsData(
      data.map((room) => ({
        id: room.id,
        name: room.name,
        type: room.type,
        price: room.price,
        status: room.status,
        image: room.image || "https://via.placeholder.com/400x250",
        description: room.description || "No description available.",
      }))
    );
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // Handle booking insertion
  const handleBookNow = async (room) => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return alert("Please login first.");

    const { error } = await supabase.from("bookings").insert([
      {
        user_id: user.id,
        room_id: room.id,
        check_in: new Date().toISOString().slice(0, 10), 
        check_out: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10), // default tomorrow
        booking_status: "Pending",
      },
    ]);

    if (error) return alert(`Booking failed: ${error.message}`);
    alert(`Booking request for ${room.name} submitted successfully!`);
  };

  return (
    <div className="flex-1 p-8 bg-gradient-to-br from-gray-700 to-gray-400 min-h-screen">
      {/* Header */}
      <h1 className="text-5xl font-extrabold text-black mb-3 tracking-tight drop-shadow-sm">
        Browse Rooms
      </h1>
      <p className="text-white mb-12 text-lg max-w-xl">
        Choose from our carefully curated rooms designed to give you comfort, luxury, and convenience.
      </p>

      {/* Room Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
        {roomsData.map((room) => (
          <div
            key={room.id}
            className="bg-white/80 backdrop-blur-xl border border-gray-200 shadow-xl rounded-3xl overflow-hidden transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl"
          >
            <div className="relative">
              <img
                src={room.image}
                alt={room.name}
                onError={(e) => (e.target.src = "https://via.placeholder.com/400x250")}
                className="w-full h-52 object-cover rounded-b-none"
              />

              <span
                className={`absolute top-4 right-4 px-4 py-1.5 text-sm rounded-full font-semibold shadow-md ${
                  room.status === "Available"
                    ? "bg-green-600 text-white"
                    : "bg-red-600 text-white"
                }`}
              >
                {room.status}
              </span>
            </div>

            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900">{room.name}</h2>
              <p className="text-gray-500 text-sm">{room.type}</p>

              <p className="mt-4 text-3xl font-bold text-blue-700">
                ₱{room.price.toLocaleString()}
              </p>

              <button
                onClick={() => openModal(room)}
                className="mt-6 w-full py-3 bg-blue-600 text-white rounded-xl text-lg font-semibold hover:bg-blue-700 active:scale-95 transition"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-fadeIn">
          <div className="bg-white/90 backdrop-blur-xl border border-gray-300 rounded-3xl shadow-2xl w-full max-w-xl p-7 relative">

            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-700 hover:text-black text-3xl"
            >
              ✖
            </button>

            <img
              src={selectedRoom.image}
              onError={(e) => (e.target.src = "https://via.placeholder.com/600x400")}
              className="w-full h-64 object-cover rounded-2xl mb-6"
            />

            <h2 className="text-3xl font-extrabold text-gray-900">{selectedRoom.name}</h2>
            <p className="text-gray-600 text-lg">{selectedRoom.type}</p>

            <p className="mt-4 text-3xl font-bold text-blue-700">
              ₱{selectedRoom.price.toLocaleString()}
            </p>

            <p
              className={`mt-1 text-lg font-semibold ${
                selectedRoom.status === "Available" ? "text-green-600" : "text-red-600"
              }`}
            >
              {selectedRoom.status}
            </p>

            <p className="text-gray-700 mt-5 mb-8 leading-relaxed">
              {selectedRoom.description}
            </p>

            {selectedRoom.status === "Available" ? (
              <button
                onClick={() => handleBookNow(selectedRoom)}
                className="w-full py-3.5 bg-blue-600 text-white rounded-xl text-lg font-semibold hover:bg-blue-700 transition active:scale-95"
              >
                Book Now
              </button>
            ) : (
              <button
                disabled
                className="w-full py-3.5 bg-gray-400 text-white rounded-xl text-lg cursor-not-allowed"
              >
                Not Available
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
