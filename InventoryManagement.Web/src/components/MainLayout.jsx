import Sidebar from "./Sidebar";
import "./MainLayout.css";

export default function MainLayout({ children }) {
  return (
    <div className="main-layout">

      <Sidebar />

      <main className="main-content">
        {children}
      </main>

    </div>
  );
}