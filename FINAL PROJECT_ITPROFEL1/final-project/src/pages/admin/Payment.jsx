import React, { useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { ReportSalesDocument } from "../../pdfTemplates/ReportSalesDocument";

export default function Payment() {
  const [payments, setPayments] = useState([
    { id: 1, guest: "John Doe", amount: 5000, status: "Pending" },
    { id: 2, guest: "Jane Smith", amount: 4500, status: "Paid" },
    
  ]);

  const [newPayment, setNewPayment] = useState({
    guest: "",
    amount: "",
    status: "Pending",
  });

  const getActivePromotion = () => ({ title: "Holiday Sale", discount: 10 });

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setNewPayment({ ...newPayment, [name]: value });
  };

  const handleAddPayment = () => {
    if (!newPayment.guest || !newPayment.amount) return;

    setPayments([
      ...payments,
      {
        id: Date.now(),
        guest: newPayment.guest,
        amount: parseFloat(newPayment.amount),
        status: newPayment.status,
      },
    ]);

    setNewPayment({ guest: "", amount: "", status: "Pending" });
  };

  const handleStatusChange = (id, newStatus) => {
    setPayments((prevPayments) =>
      prevPayments.map((p) =>
        p.id === id ? { ...p, status: newStatus } : p
      )
    );
  };

  return (
    <div className="flex-1 p-10 min-h-screen bg-gradient-to-b from-gray-800 to-gray-600 text-white">

      {/* Title */}
      <h2 className="text-5xl font-extrabold text-black">Payment Management</h2>

      {/* Highlight Banner */}
      <div className="mb-8 p-5 m-5 rounded-2xl bg-white/10 backdrop-blur-md shadow-lg border border-white/20">
        <p className="text-sm text-green-300 tracking-wide">
          🎉 Active Promotion: <strong>"{getActivePromotion().title}"</strong>  
          — {getActivePromotion().discount}% discount applied
        </p>
      </div>

      {/* Card: Add Payment */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-xl mb-10">
        <h3 className="text-xl font-semibold mb-4">Add Payment</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input
            type="text"
            name="guest"
            placeholder="Guest Name"
            value={newPayment.guest}
            onChange={handlePaymentChange}
            className="p-4 rounded-xl bg-white/20 border border-white/30 placeholder-gray-300 text-white focus:ring-2 focus:ring-blue-300 focus:outline-none"
          />

          <input
            type="number"
            name="amount"
            placeholder="Amount"
            value={newPayment.amount}
            onChange={handlePaymentChange}
            className="p-4 rounded-xl bg-white/20 border border-white/30 placeholder-gray-300 text-white focus:ring-2 focus:ring-blue-300 focus:outline-none"
          />

          <select
            name="status"
            value={newPayment.status}
            onChange={handlePaymentChange}
            className="p-4 rounded-xl bg-white/20 border border-white/30 text-white focus:ring-2 focus:ring-blue-300 focus:outline-none"
          >
            <option value="Pending" className="text-black">Pending</option>
            <option value="Paid" className="text-black">Paid</option>
          </select>
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={handleAddPayment}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition text-white font-medium"
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
            {payments.length > 0 ? (
              payments.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-white/10 transition border-b border-white/10"
                >
                  <td className="px-6 py-4">{p.guest}</td>
                  <td className="px-6 py-4">₱{p.amount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <select
                      value={p.status}
                      onChange={(e) => handleStatusChange(p.id, e.target.value)}
                      className={`bg-transparent font-semibold focus:outline-none ${
                        p.status === "Paid" ? "text-green-400" : "text-yellow-300"
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
                <td
                  colSpan="3"
                  className="text-center py-6 text-gray-300 italic"
                >
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
        activePromotion={getActivePromotion()}
      />
    }
    fileName={`Sales_Report_${new Date().toLocaleDateString()}.pdf`}
    className="px-8 py-3 m-5 bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition text-white font-medium"
  >
    {({ loading }) => (loading ? "Generating..." : "Export PDF")}
  </PDFDownloadLink>
</div>

    </div>
  );
}
