import React, { useState } from "react";
import { useNavigate } from "react-router";
import supabase from "../lib/supabase";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "guest",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  const { name: full_name, email, password, role } = formData;

  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name, role }, 
      },
    });

    if (authError) throw authError;

    const userId = authData?.user?.id;
    if (!userId) throw new Error("Failed to get user ID");

    const { error: dbError } = await supabase.from("users").insert([
      { id: userId, full_name, email, role }
    ]);

    if (dbError) throw dbError;

    alert("Registration successful!");
    navigate("/login");
  } catch (error) {
    alert(error.message);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-gray-600 to-gray-200 px-6 relative overflow-hidden">
      <div className="bg-white/10 backdrop-blur-xl shadow-2xl border border-white/20 rounded-3xl p-10 w-full max-w-md relative z-10">
        <h1 className="text-3xl font-extrabold mb-6 text-gray-800 text-center">
          Create Account
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-black mb-1 font-medium">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-black mb-1 font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-black mb-1 font-medium">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-black mb-1 font-medium">Select Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
            >
              <option value="guest">Guest</option>
              <option value="receptionist">Receptionist</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-md ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-900">
          Already have an account?{" "}
          <a href="/login" className="text-blue-900 font-medium hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
