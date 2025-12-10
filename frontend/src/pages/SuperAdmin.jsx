
import UserForm from "../components/UserForm";
export default function SuperAdmin() {
  return (
      <div className="p-6">
        <header className="mb-4 ">
          <h2 className="text-3xl font-semibold">Super Admin Header</h2>
          <button className="mt-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">create </button>
          <button className="mt-2 ml-2 px-4 py-2 bg-green-600 rounded hover:bg-green-700"> update</button>
          </header>
      
        <UserForm/>
      </div>

  );
}