import { useState } from "react";
import { Outlet } from "react-router-dom";

import { GiHamburgerMenu } from "react-icons/gi";
import { IoMdClose } from "react-icons/io";
import Sidebar from "../components/Sidebar";



export default function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  return (
    <div className="flex flex-row min-h-screen min-w-screen bg-gray-400">
    
      <Sidebar
        isSidebarOpen={isSidebarOpen}
      />
      <div className="flex-1 p-4 relative rounded-2xl  m-4">
          <span
        onClick={() => setIsSidebarOpen((prev) => !prev)}
        className="text-2xl cursor-pointer  absolute "
      >
        {isSidebarOpen ? <GiHamburgerMenu /> : <IoMdClose/>}
      </span>
      
      
      <h1 className="text-3xl text-center py-4">Header of Dashboard</h1>
    
        <hr className="text-slate-600 mb-8" />
          <Outlet />
      </div>
    </div>
  );
}
