import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-red-500">403</h1>

        <h2 className="mt-4 text-2xl font-semibold text-gray-800">
          Unauthorized Access
        </h2>

        <p className="mt-2 text-gray-600">
          You don’t have permission to view this page.  
          Please contact your administrator or try logging in again.
        </p>

        <div className="mt-6 flex items-center justify-center gap-4">
          <Link
            to="/"
            className="px-5 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Go Home
          </Link>

          <Link
            to="/login"
            className="px-5 py-2 rounded-md border border-gray-400 text-gray-700 hover:bg-gray-100 transition"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}