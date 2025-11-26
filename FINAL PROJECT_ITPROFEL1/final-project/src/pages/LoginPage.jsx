import React, { useState } from "react";
import { useNavigate } from "react-router"; 

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "guest",
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true); 
    console.log("Login attempt:", formData);

    setTimeout(() => {
      setLoading(false); 
      alert(`Logged in as ${formData.role} with email ${formData.email}`);

      if (formData.role === "admin") navigate("/admin");
      else if (formData.role === "receptionist") navigate("/receptionist");
      else navigate("/guest");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-gray-600 to-gray-200 px-6 relative overflow-hidden">
      <div className="bg-white/10 backdrop-blur-xl shadow-2xl border border-white/20 rounded-3xl p-10 w-full max-w-md relative z-10">
        <h1 className="text-3xl font-extrabold mb-6 text-gray-800 text-center">Welcome Back</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
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
            <label className="block text-black mb-1 font-medium">Login as</label>
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
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-md"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex justify-center mt-6">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        <p className="mt-6 text-center text-gray-900">
          Don't have an account?{" "}
          <a href="/register" className="text-blue-900 font-medium hover:underline">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}
