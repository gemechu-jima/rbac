export type SortOrder = "asc" | "desc";

export function universalSort<T>(
  array: T[],
  key: keyof T,
  order: SortOrder = "asc"
): T[] {
  return [...array].sort((a, b) => {

    const valA = a[key];
    const valB = b[key];

   // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dateA = new Date(valA as any);
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dateB = new Date(valB as any);

    const isDateA = !isNaN(dateA.getTime());
    const isDateB = !isNaN(dateB.getTime());

    if (isDateA && isDateB) {
      const result = dateA.getTime() - dateB.getTime();
      return order === "desc" ? -result : result;
    }

    const numA = Number(valA);
    const numB = Number(valB);
    const isNumberA = !isNaN(numA);
    const isNumberB = !isNaN(numB);

    if (isNumberA && isNumberB) {
      const result = numA - numB;
      return order === "desc" ? -result : result;
    }


    const strA = String(valA).toLowerCase();
    const strB = String(valB).toLowerCase();

    const result = strA.localeCompare(strB);
    return order === "desc" ? -result : result;
  });
}



// import { useState } from "react";
// import { useAuth } from "../context/AuthContext";
// import { useNavigate } from "react-router-dom";

// export default function Login() {
//   const [form, setForm] = useState({
//     email: "",
//     password: "",
//     rememberMe: false,
//   });

//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const { login } = useAuth();
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;

//     setForm((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     try {
//       if (!form.email || !form.password) {
//         throw new Error("Email and password are required");
//       }

//       const response = await fetch(
//         `${import.meta.env.VITE_API_URL}/api/login`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             email: form.email,
//             password: form.password,
//           }),
//         }
//       );

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || "Login failed");
//       }

//       login(data);
//       navigate("/app", { replace: true });
//     } catch (err) {
//       setError(err.message || "Login failed. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
//       <div className="max-w-md w-full space-y-8">
//         <h2 className="text-center text-3xl font-bold text-gray-900">
//           Sign in to your account
//         </h2>

//         {error && (
//           <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md">
//             {error}
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* Email */}
//           <div>
//             <input
//               type="email"
//               name="email"
//               placeholder="Email address"
//               value={form.email}
//               onChange={handleChange}
//               className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
//               required
//             />
//           </div>

//           {/* Password */}
//           <div>
//             <input
//               type="password"
//               name="password"
//               placeholder="Password"
//               value={form.password}
//               onChange={handleChange}
//               className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
//               required
//             />
//           </div>

//           {/* Remember Me */}
//           <div className="flex items-center justify-between">
//             <label className="flex items-center gap-2 text-sm text-gray-700">
//               <input
//                 type="checkbox"
//                 name="rememberMe"
//                 checked={form.rememberMe}
//                 onChange={handleChange}
//                 className="h-4 w-4 text-blue-600"
//               />
//               Remember me
//             </label>

//             <a className="text-sm text-blue-600 hover:text-blue-500 cursor-pointer">
//               Forgot your password?
//             </a>
//           </div>

//           {/* Submit */}
//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-70"
//           >
//             {loading ? "Signing in..." : "Sign in"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }