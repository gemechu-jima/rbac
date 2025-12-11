// src/components/UserForm.jsx
import { useForm } from "react-hook-form";
import { ROLES } from "../../../shares/role";
import { TextInput, SelectInput, Checkbox } from "./custom/CustomInput.jsx";
// const ROLES = [
//   { value: 'guest', label: 'Guest (View only)' },
//   { value: 'user', label: 'User (Standard)' },
//   { value: 'moderator', label: 'Moderator (Content)' },
//   { value: 'manager', label: 'Manager (Team)' },
//   { value: 'admin', label: 'Admin (Full access)' },
//   { value: 'super_admin', label: 'Super Admin (System owner)' },
// ];

export default function UserForm({ initialData = null }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: initialData || {
      name: "",
      email: "",
      role: "user",
    },
  });

  const handleFormSubmit = async (data) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    console.log("User created:", result);
    if (!initialData) {
      reset({ name: "", email: "", role: "user" });
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">
        {initialData ? "Edit User" : "Create New User"}
      </h2>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Full Name *
          </label>
          <input
            id="name"
            type="text"
            {...register("name", { required: "Name is required" })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email *
          </label>
          <input
            id="email"
            type="email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Invalid email address",
              },
            })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-gray-700"
          >
            Role *
          </label>
          <select
            id="role"
            {...register("role", { required: "Role is required" })}
            className="mt-1 block w-full px-3 py-2 border  rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            {ROLES.map((role) =>
              role.value === "guest" ? (
                <option key={role.value} value={role.value} disabled>
                  {role.label} (Not assignable)
                </option>
              ) : (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              )
            )}
          </select>
          {errors.role && (
            <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-blue-600 py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting
              ? "Saving..."
              : initialData
              ? "Update User"
              : "Create User"}
          </button>

          <button
            type="button"
            onClick={() => reset()}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
