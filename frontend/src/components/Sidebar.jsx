// import React, { type Dispatch, type SetStateAction } from "react";
import { Link, useLocation } from "react-router-dom";

import { CiUser } from "react-icons/ci";
import { CiLogout } from "react-icons/ci";
import { IoIosNotifications } from "react-icons/io";
import { MdSecurity } from "react-icons/md";
import { sidebarItems } from "../utils/menuLink";
import { useAuth } from "../context/AuthContext";
// interface SidebarProps {
//   isSidebarOpen: boolean;
// }
export default function Sidebar({ isSidebarOpen }) {
  const { logout, user } = useAuth();
  const location=useLocation()
  const adminOnlyRoutes = ["/users", "/service-register"];
  const filteredSidebarItems =
  user?.role === "admin"
    ? sidebarItems
    : sidebarItems.filter(item => !adminOnlyRoutes.includes(item.route));
  return (
    <div
      className={`dark:bg-gray-950 bg-gray-800 text-white p-3 relative transition-all duration-300 ${
        isSidebarOpen ? "w-64" : "w-[72px]"
      }`}
    >
      <div className="flex justify-between items-center mb-10 mt-5">
        <div className="flex gap-6 items-center">
          <h1>
            <MdSecurity className="bg-amber-800 rounded-full w-8 h-8" />
          </h1>
          {isSidebarOpen && (
            <h2 className=" py-3 rounded-lg px-10">DIVE DEEP</h2>
          )}
        </div>
      </div>
      <div className="">
        <ul>
  {filteredSidebarItems.map((item, index) => {
    const isActive = location.pathname === `/app${item.route}`;

    return (
      <li
        key={index}
        className={`flex items-center gap-2 p-2 my-2 cursor-pointer
        ${isSidebarOpen ? "rounded" : "rounded-full justify-center"}
        ${isActive ? "bg-[#00ac75]" : "hover:bg-[#00ac75]"}
        `}
      >
        <Link
          to={`/app${item.route}`}
          className="flex items-center gap-2 w-full "
        >
          <span className="p-1">
            <item.icon size={24} />
          </span>

          {isSidebarOpen && <span>{item.label}</span>}
        </Link>
      </li>
    );
  })}
</ul>

      </div>

      <div className="ml-0 absolute flex justify-center bottom-0 rounded-lg m-4 w-[90%]">
        <div
          className={`flex items-center justify-evenly ${
            isSidebarOpen ? "flex-row" : "flex-col"
          }`}
        >
          <button
            type="button"
            className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded-full justify-center"
          >
            <CiUser size={20} />
          </button>

          <button
            type="button"
            className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded-full justify-center"
          >
            <IoIosNotifications size={20} />
          </button>

          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded-full justify-center"
          >
            <CiLogout size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
