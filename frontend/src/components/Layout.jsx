import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";


export default function Layout() {
  return (
    <>
      <Sidebar />
      <Header />
      <main className="content">
        <Outlet /> {/* Aquí se renderizan las páginas */}
      </main>
      <Footer />
    </>
  );
}