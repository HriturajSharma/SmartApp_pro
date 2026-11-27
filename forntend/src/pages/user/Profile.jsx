import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const Profile = () => {
  const { user } = useAuth();
  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-500 text-2xl font-bold text-white">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <h1 className="mt-4 text-2xl font-bold">{user?.name}</h1>
        <p className="text-slate-500">{user?.email}</p>
        <p className="mt-1 text-sm capitalize text-slate-400">{user?.role}</p>
        <Link to="/my-orders" className="mt-6 inline-block rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">
          My orders
        </Link>
      </div>
    </div>
  );
};

export default Profile;
