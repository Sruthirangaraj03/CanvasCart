import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Products from "./pages/products";
import Favorites from "./pages/Favorites";
import Cart from "./pages/cart";
import Details from "./pages/productDetails";
import Layout from "./components/Layout";
import ScrollToTop from "./components/scroll";
import Dashboard from "./pages/dashboard";
import Admin from "./pages/admin";

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Landing page */}
        <Route path="/" element={<Dashboard />} />
        
        {/* Admin routes - NO Layout wrapper (Admin component has its own header) */}
        <Route path="/admin" element={<Admin />} />
        
        {/* User routes - WITH Layout wrapper (includes Header for regular users) */}
        <Route element={<Layout />}>
          <Route path="/products" element={<Products />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/products/:id" element={<Details/>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;