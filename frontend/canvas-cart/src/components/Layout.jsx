import Header from "./Header";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <>
      <Header />
      <main className="bg-gray-50 min-h-screen pt-1 px-4">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
