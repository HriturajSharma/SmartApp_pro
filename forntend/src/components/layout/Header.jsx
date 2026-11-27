import { LayoutDashboard, LogOut, Menu, Search, ShoppingCart, Sparkles, UserRound, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import { useCart } from "../../context/CartContext";
import { useAuth } from "../../hooks/useAuth";

const links = [
    { name: "Home", path: "/" },
    { name: "All Products", path: "/products" },
    { name: "Cooking Appliances", path: "/products?category=cooking-appliances" },
    { name: "Breakfast Essentials", path: "/products?category=breakfast-essentials" },
    { name: "Track Order", path: "/track-order" }
];

const iconBtn =
    "flex items-center gap-2 rounded-full p-2.5 text-slate-700 hover:bg-brand-50 hover:text-brand-600";

const Header = () => {
    const { cartCount } = useCart();
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login", { replace: true });
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const q = query.trim();
        setOpen(false);
        navigate(q ? `/products?search=${encodeURIComponent(q)}` : "/products");
    };

    const searchForm = (cls) => (
        <form onSubmit={handleSearch} className={`relative ${cls}`}>
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search appliances..."
                aria-label="Search products"
                className="w-full rounded-full border border-slate-200 bg-slate-100/70 py-2.5 pl-11 pr-4 text-sm outline-none focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
            />
        </form>
    );

    return (
        <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 shadow-[0_8px_24px_-20px_rgba(15,23,42,0.5)] backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
                <button type="button" className={`${iconBtn} md:hidden`} onClick={() => setOpen((v) => !v)} aria-label="Menu">
                    {open ? <X size={22} /> : <Menu size={22} />}
                </button>

                <Link to="/" className="flex shrink-0 items-center gap-2.5 text-2xl font-extrabold tracking-tight text-ink">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white shadow-md shadow-brand-500/25">
                        <Sparkles size={18} />
                    </span>
                    <span>Smart<span className="text-brand-500">Home</span></span>
                </Link>

                <nav className="ml-3 hidden items-center gap-1 lg:flex">
                    {links.slice(0, 2).concat(links.slice(4)).map((l) => (
                        <NavLink
                            key={l.name}
                            to={l.path}
                            end={l.path === "/"}
                            className={({ isActive }) =>
                                `rounded-full px-3.5 py-2 text-sm font-medium ${
                                    isActive ? "bg-brand-50 text-brand-600" : "text-slate-600 hover:bg-slate-100"
                                }`
                            }
                        >
                            {l.name}
                        </NavLink>
                    ))}
                </nav>

                {searchForm("ml-auto hidden max-w-md flex-1 md:block")}

                <div className="flex items-center gap-1">
                    {isAuthenticated ? (
                        <>
                            <Link to={isAdmin ? "/admin" : "/my-orders"} className={iconBtn} title={user?.name}>
                                {isAdmin ? <LayoutDashboard size={20} /> : <UserRound size={20} />}
                                <span className="hidden text-sm font-medium xl:block">
                                    {isAdmin ? "Dashboard" : user?.name?.split(" ")[0]}
                                </span>
                            </Link>
                            <button type="button" onClick={handleLogout} className={`${iconBtn} hover:!text-red-500`} aria-label="Logout">
                                <LogOut size={20} />
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-600">
                            Login
                        </Link>
                    )}

                    <Link to="/cart" className={`${iconBtn} relative`} aria-label="Cart">
                        <ShoppingCart size={21} />
                        {cartCount > 0 && (
                            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 text-[11px] font-bold text-white">
                                {cartCount > 99 ? "99+" : cartCount}
                            </span>
                        )}
                    </Link>
                </div>
            </div>

            {open && (
                <div className="border-t border-slate-100 bg-white/95 px-4 pb-4 pt-3 shadow-lg md:hidden">
                    {searchForm("mb-3")}
                    <ul className="space-y-1">
                        {links.map((l) => (
                            <li key={l.name}>
                                <Link
                                    to={l.path}
                                    onClick={() => setOpen(false)}
                                    className="block rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                                >
                                    {l.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </header>
    );
};

export default Header;
