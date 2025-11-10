import Header from "../components/Header";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";
import { Outlet, useLocation } from "react-router-dom";

const HomeLayout = () => {
  const location = useLocation();
  const hideSidebar = location.pathname.startsWith("/login") || location.pathname.startsWith("/signup");
  return (
    <div className="flex min-h-screen flex-col bg-slate-100 text-slate-900">
      <Header />
      <div className={`mx-auto flex w-full max-w-6xl flex-1 ${hideSidebar ? "" : "gap-6"} px-4 py-8 lg:px-6`}>
        {!hideSidebar && <Sidebar />}
        <main className="flex-1 rounded-xl bg-white shadow-sm">
          <div className="h-full rounded-xl border border-slate-100 bg-white p-6">
            <Outlet />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default HomeLayout;
