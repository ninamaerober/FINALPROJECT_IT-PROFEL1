import { BrowserRouter, Navigate, Route, Routes,} from "react-router";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Admin from "./pages/admin/AdminPage";
import Payment from "./pages/admin/Payment";  
import Receptionist from "./pages/receptionist/ReceptionistPage";
import Guest from "./pages/guest/GuestPage";
import BrowseRooms from "./pages/guest/BrowseRooms";
import MyBookings from "./pages/guest/MyBookings";
import Payments from "./pages/guest/Payments";
import Chatbot from "./Chatbot";



export default function App() {
  return (
    <BrowserRouter>
      <Routes>
           <Route path="/" element={<Navigate to="/login" replace />} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/admin/" element={<Admin />} />
          <Route path="/admin/payment" element={<Payment />} />

          <Route path="/receptionist/" element={<Receptionist />} />
         
          <Route path="/guest/" element={<Guest />} />
          <Route path="/guest/rooms" element={<BrowseRooms />} />
          <Route path="/guest/bookings" element={<MyBookings />} />
          <Route path="/guest/payments" element={<Payments />} />

          <Route path="/chatbot/" element={<Chatbot />} />

      </Routes>
    </BrowserRouter>
  );
}
