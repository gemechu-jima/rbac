import { useState } from "react";
import { Outlet } from "react-router-dom";

import { GiHamburgerMenu } from "react-icons/gi";
import { IoMdClose } from "react-icons/io";
import Sidebar from "../components/Sidebar";



export default function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  return (
    <div className="flex flex-row dark:bg-gray-950 bg-gray-800 min-h-screen min-w-screen">
    
      <Sidebar
        isSidebarOpen={isSidebarOpen}
      />
      <div className="flex-1 p-4 relative rounded-2xl dark:bg-gray-800 bg-gray-950 text-white m-4">
          <span
        onClick={() => setIsSidebarOpen((prev) => !prev)}
        className="text-2xl cursor-pointer  absolute "
      >
        {isSidebarOpen ? <GiHamburgerMenu /> : <IoMdClose/>}
      </span>
      
      
      
    
        <hr className="text-slate-600 mb-8" />
          <Outlet />
      </div>
    </div>
  );
}
