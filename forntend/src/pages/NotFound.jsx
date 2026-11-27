import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
    <p className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-8xl font-extrabold text-transparent">404</p>
    <h1 className="mt-4 text-2xl font-bold">Page not found</h1>
    <p className="mt-2 text-slate-500">The page you’re looking for doesn’t exist or was moved.</p>
    <Link to="/" className="mt-8 rounded-full bg-brand-500 px-7 py-3 font-semibold text-white hover:bg-brand-600">
      Back to home
    </Link>
  </div>
);

export default NotFound;
