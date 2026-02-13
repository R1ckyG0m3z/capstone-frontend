import { Outlet } from "react-router";

import Navbar from "./Navbar";

export default function Layout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <footer>
        <p>&copy; 2026 Trail Kreweser. All rights reserved.</p>
      </footer>
    </>
  );
}
