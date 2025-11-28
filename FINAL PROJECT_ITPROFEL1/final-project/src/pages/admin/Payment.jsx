import React, { useState, useEffect } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { ReportSalesDocument } from "../../pdfTemplates/ReportSalesDocument";
import supabase from "../../lib/supabase";

export default function Payment() {
  const [payments, setPayments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [newPayment, setNewPayment] = useState({
    guest: "",
    amount: "",
    status: "Pending",
  });
  const [activePromotion, setActivePromotion] = useState(null);

  // ================= FETCH ACTIVE PROMOTION =================
  const fetchActivePromotion = async () => {
    const { data, error } = await supabase
      .from("promotions")
      .select("title, discount, status")
      .eq("status", "Active")
      .order("id", { ascending: false })
      .limit(1)
      .single();

    if (!error && data) {
      setActivePromotion(data);
    } else {
      setActivePromotion(null);
    }
  };

  // ================= FETCH BOOKINGS =================
  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        id,
        guest_name,
        users(full_name)
      `);

    if (error) return console.error("Error fetching bookings:", error.message);
    setBookings(data);
  };

  // ================= FETCH PAYMENTS =================
  const fetchPayments = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("payments")
      .select(`
        id,
        payment_amount,
        payment_status,
        booking_id,
        bookings(
          guest_name,
          users(full_name)
        )
      `)
      .eq("user_id", user.id);

    if (error) return console.error("Error fetching payments:", error.message);

    setPayments(
      data.map((p) => ({
        id: p.id,
        guest:
          p.bookings?.users?.full_name || // registered user
          p.bookings?.guest_name ||        // walk-in / manual guest
          "Unknown",
        amount: p.payment_amount,
        status: p.payment_status,
        booking_id: p.booking_id,
      }))
    );
  };

  useEffect(() => {
    fetchBookings();
    fetchPayments();
    fetchActivePromotion();
  }, []);

  // ================= INPUT HANDLER =================
  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setNewPayment({ ...newPayment, [name]: value });
  };

  // ================= ADD PAYMENT =================
  // ================= ADD PAYMENT =================
const handleAddPayment = async () => {
  if (!newPayment.guest || !newPayment.amount)
    return alert("Fill all required fields");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return alert("User not logged in");

  // Apply promotion discount
  let finalAmount = parseFloat(newPayment.amount);
  if (activePromotion) {
    const discountValue = finalAmount * (activePromotion.discount / 100);
    finalAmount -= discountValue;
  }

  const { error } = await supabase.from("payments").insert([
    {
      booking_id: newPayment.guest,
      payment_amount: finalAmount,
      payment_status: newPayment.status,
      user_id: user.id,
    },
  ]);

  if (error) return alert("Failed to add payment: " + error.message);

  fetchPayments();
  setNewPayment({ guest: "", amount: "", status: "Pending" });
};


  // ================= UPDATE STATUS =================
  const handleStatusChange = async (id, newStatus) => {
    const { error } = await supabase
      .from("payments")
      .update({ payment_status: newStatus })
      .eq("id", id);

    if (error) return alert("Failed to update status: " + error.message);

    setPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
    );
  };

  return (
    <div className="flex-1 p-10 min-h-screen bg-gradient-to-b from-gray-800 to-gray-600 text-white">
      <h2 className="text-5xl font-extrabold text-black">Payment Management</h2>

      <div className="mb-8 p-5 m-5 rounded-2xl bg-white/10 backdrop-blur-md shadow-lg border border-white/20">
        {activePromotion ? (
          <p className="text-sm text-green-300 tracking-wide">
            🎉 Active Promotion: <strong>"{activePromotion.title}"</strong> —{" "}
            {activePromotion.discount}% discount applied
          </p>
        ) : (
          <p className="text-sm text-red-300 tracking-wide">
            🚫 No active promotions at the moment
          </p>
        )}
      </div>

      {/* Add Payment */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-xl mb-10">
        <h3 className="text-xl font-semibold mb-4">Add Payment</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <select
            name="guest"
            value={newPayment.guest}
            onChange={handlePaymentChange}
            className="p-4 rounded-xl border text-black"
          >
            <option value="">Select Guest / Booking</option>
            {bookings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.users?.full_name || b.guest_name || "Unknown Guest"}
              </option>
            ))}
          </select>

          <input
            type="number"
            name="amount"
            placeholder="Amount"
            value={newPayment.amount}
            onChange={handlePaymentChange}
            className="p-4 rounded-xl bg-white/20 border border-white/30 placeholder-gray-300 text-white"
          />

          <select
            name="status"
            value={newPayment.status}
            onChange={handlePaymentChange}
            className="p-4 rounded-xl bg-white/20 border border-white/30 text-white"
          >
            <option value="Pending" className="text-black">Pending</option>
            <option value="Paid" className="text-black">Paid</option>
          </select>
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={handleAddPayment}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md text-white"
          >
            Add Payment
          </button>
        </div>
      </div>

      {/* Payment Table */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-2xl">
        <table className="w-full">
          <thead>
            <tr className="text-gray-200 border-b border-white/20">
              <th className="px-6 py-4 text-left font-medium">Guest</th>
              <th className="px-6 py-4 text-left font-medium">Amount</th>
              <th className="px-6 py-4 text-left font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.length ? (
              payments.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-white/10 border-b border-white/10"
                >
                  <td className="px-6 py-4">{p.guest}</td>
                  <td className="px-6 py-4">₱{p.amount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <select
                      value={p.status}
                      onChange={(e) =>
                        handleStatusChange(p.id, e.target.value)
                      }
                      className={`bg-transparent font-semibold ${
                        p.status === "Paid"
                          ? "text-green-400"
                          : "text-yellow-300"
                      }`}
                    >
                      <option value="Pending" className="text-black">Pending</option>
                      <option value="Paid" className="text-black">Paid</option>
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="text-center py-6 italic text-gray-300" colSpan="3">
                  No payments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Export PDF */}
      <div className="flex justify-end mb-8">
        <PDFDownloadLink
          document={
            <ReportSalesDocument
              payments={payments}
              activePromotion={activePromotion}
            />
          }
          fileName={`Sales_Report_${new Date().toLocaleDateString()}.pdf`}
          className="px-8 py-3 m-5 bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md text-white"
        >
          {({ loading }) => (loading ? "Generating..." : "Export PDF")}
        </PDFDownloadLink>
      </div>
    </div>
  );
}
