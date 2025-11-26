import React, { useState, useEffect } from "react";
import { Link, NavLink } from "react-router";
import supabase from "../../lib/supabase"; 
import { LogOut } from "react-feather";

export default function Guest() {
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackInput, setFeedbackInput] = useState("");
  const [feedbacks, setFeedbacks] = useState([]);
  const [roomsData, setRoomsData] = useState([]);
  const [bookingsData, setBookingsData] = useState([]);
  const [user, setUser] = useState({ full_name: "Guest" });
 



  // Feedback submit handler
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();

    // Get logged-in user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return alert("Please login first.");

    // Insert feedback into Supabase
    const { error } = await supabase.from("feedback").insert([
      { user_id: user.id, message: feedbackInput }
    ]);

    if (error) return alert(error.message);

    const newFeedback = {
      message: feedbackInput,
      date: new Date().toLocaleDateString(),
    };

    setFeedbacks([newFeedback, ...feedbacks]);
    setFeedbackInput("");
    setFeedbackModalOpen(false);
  };


  // Fetch rooms
  const fetchRooms = async () => {
    const { data, error } = await supabase.from("rooms").select("*");
    if (!error) setRoomsData(data);
  };

  // Fetch bookings
  const fetchBookings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("bookings")
      .select("*, rooms(name)")
      .eq("user_id", user.id);

    if (!error) setBookingsData(data.map(b => ({
      ...b,
      room: b.rooms.name,
      checkIn: b.check_in,
      checkOut: b.check_out
    })));
  };

  // Fetch feedbacks
  const fetchFeedback = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("feedback")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setFeedbacks(data.map(f => ({
      message: f.message,
      date: new Date(f.created_at).toLocaleDateString()
    })));
  };



  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      // Fetch name from your users table
      const { data, error } = await supabase
        .from("users")
        .select("full_name")
        .eq("id", authUser.id)
        .single();

      if (!error && data) setUser({ full_name: data.full_name });
    };

    fetchUser();
  }, []);

  useEffect(() => {
    fetchRooms();
    fetchBookings();
    fetchFeedback();
  }, []);



  return (
    <div className="flex-1 p-8 bg-gradient-to-br from-gray-700 to-gray-400 min-h-screen">
      {/* Header */}
      <header className="mb-12 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold text-black tracking-tight">
            Welcome, {user.full_name} 
          </h1>
          <p className="text-white mt-2 text-lg">
            Explore rooms, manage bookings, and share your experience.
          </p>
        </div>

        <NavLink to="/login">
          <LogOut />
        </NavLink>
      </header>


      {/* Action Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {[
          {
            title: "Browse Rooms",
            desc: "See available rooms and amenities.",
            to: "/guest/rooms",
          },
          {
            title: "My Bookings",
            desc: "View or modify your reservations.",
            to: "/guest/bookings",
          },
          {
            title: "Payments",
            desc: "Settle payments & view receipts.",
            to: "/guest/payments",
          },
        ].map((item, index) => (
          <Link
            key={index}
            to={item.to}
            className="bg-white/10 backdrop-blur-xl shadow-2xl border border-blue-500 rounded-3xl p-10 w-full max-w-md relative z-10"
          >
            <h3 className="text-xl font-semibold text-black">{item.title}</h3>
            <p className="text-white mt-2">{item.desc}</p>
            <span className="text-indigo-900 mt-4 inline-block font-semibold">
              Explore →
            </span>
          </Link>
        ))}

        {/* Feedback Button */}
        <button
          onClick={() => setFeedbackModalOpen(true)}
          className="bg-white/10 backdrop-blur-xl shadow-2xl border border-blue-500 rounded-3xl p-10 w-full max-w-md relative z-10"
        >
          <h3 className="text-xl font-semibold text-black">Feedback</h3>
          <p className="text-white mt-2">Share your experience with us.</p>
          <span className="text-indigo-900 mt-4 inline-block font-semibold">
            Write →
          </span>
        </button>
      </section>

      {/* Recent Bookings */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">My Recent Bookings</h2>

        <div className="overflow-x-auto backdrop-blur-xl bg-white/70 shadow-lg rounded-2xl p-4 border border-white/20">
          <table className="w-full table-auto">
            <thead>
              <tr className="text-gray-700 text-left border-b">
                <th className="px-4 py-2">Room</th>
                <th className="px-4 py-2">Check-In</th>
                <th className="px-4 py-2">Check-Out</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookingsData.map((b) => (
                <tr key={b.id} className="border-b text-gray-800">
                  <td className="px-4 py-3">{b.room}</td>
                  <td className="px-4 py-3">{b.checkIn}</td>
                  <td className="px-4 py-3">{b.checkOut}</td>
                  <td
                    className={`px-4 py-3 font-semibold ${
                      b.status === "Confirmed" ? "text-green-600" : "text-yellow-600"
                    }`}
                  >
                    {b.booking_status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Available Rooms */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Rooms</h2>

        <div className="overflow-x-auto backdrop-blur-xl bg-white/70 shadow-lg rounded-2xl p-4 border border-white/20">
          <table className="w-full table-auto">
            <thead>
              <tr className="text-gray-700 text-left border-b">
                <th className="px-4 py-2">Image</th>
                <th className="px-4 py-2">Room</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Price</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {roomsData.map((r) => (
                <tr key={r.id} className="border-b text-gray-900">
                  <td className="px-4 py-3">
                    <img
                      src={r.image}
                      className="w-24 h-16 object-cover rounded-lg shadow"
                      alt={r.name}
                    />
                  </td>
                  <td className="px-4 py-3">{r.name}</td>
                  <td className="px-4 py-3">{r.type}</td>
                  <td className="px-4 py-3">₱{r.price.toLocaleString()}</td>
                  <td
                    className={`px-4 py-3 font-semibold ${
                      r.status === "Available" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {r.status}
                  </td>
                  <td className="px-4 py-3">
                    {r.status === "Available" ? (
                      <NavLink to="/guest/rooms">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow">
                        Book Now
                      </button>
                      </NavLink>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Feedback Section */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">My Feedback</h2>

        {feedbacks.length === 0 ? (
          <p className="text-gray-600 ml-1">No feedback yet.</p>
        ) : (
          <div className="overflow-x-auto backdrop-blur-xl bg-white/70 shadow-lg rounded-2xl p-4 border border-white/20">
            <table className="w-full table-auto">
              <thead>
                <tr className="text-left text-gray-700 border-b">
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Feedback</th>
                </tr>
              </thead>
              <tbody>
                {feedbacks.map((f) => (
                  <tr key={f.id} className="border-b text-gray-800">
                    <td className="px-4 py-3">{f.date}</td>
                    <td className="px-4 py-3">{f.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Feedback Modal */}
      {feedbackModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 relative border border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Submit Feedback</h2>

            <form onSubmit={handleFeedbackSubmit} className="flex flex-col gap-4">
              <textarea
                value={feedbackInput}
                onChange={(e) => setFeedbackInput(e.target.value)}
                placeholder="Write your feedback..."
                className="border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                rows={5}
                required
              />

              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setFeedbackModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 rounded-xl hover:bg-gray-300"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
