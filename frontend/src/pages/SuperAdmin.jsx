
import UserForm from "../components/UserForm";
export default function SuperAdmin() {
  return (
 
      <div className="p-6">
        <h1 className="text-2xl font-bold">This page for Super admin</h1>
        <p> Super Admins can see this.</p>
        <UserForm/>
      </div>

  );
}