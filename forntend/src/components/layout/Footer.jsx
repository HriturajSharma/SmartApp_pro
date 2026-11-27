
import { Link } from "react-router-dom";

import {
    FaFacebookF,
    FaInstagram,
    FaXTwitter,
} from "react-icons/fa6";

const Footer = () => {
  return (
    <footer className="mt-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-300">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:gap-12">

        {/* Brand */}
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">
            Smart<span className="text-brand-400">Home</span>
          </h2>

          <p className="mt-4 max-w-xs text-sm leading-7 text-slate-400">
            Discover smart appliances designed to make everyday living easier.
          </p>

          {/* Social Media */}
          <div className="mt-5 flex gap-3">
            <a href="#" aria-label="Facebook" className="rounded-full border border-white/10 bg-white/5 p-2.5 hover:border-brand-400 hover:bg-brand-500 hover:text-white">
              <FaFacebookF size={16} />
            </a>

            <a href="#" aria-label="Instagram" className="rounded-full border border-white/10 bg-white/5 p-2.5 hover:border-brand-400 hover:bg-brand-500 hover:text-white">
              <FaInstagram size={16} />
            </a>

            <a href="#" aria-label="X" className="rounded-full border border-white/10 bg-white/5 p-2.5 hover:border-brand-400 hover:bg-brand-500 hover:text-white">
              <FaXTwitter size={16} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="mb-4 font-semibold text-white">Quick Links</h3>

          <ul className="space-y-3 text-sm text-slate-400">
            <li className="hover:text-brand-400"><Link to="/">Home</Link></li>
            <li className="hover:text-brand-400"><Link to="/products">Products</Link></li>
            <li className="hover:text-brand-400"><Link to="/cart">My Cart</Link></li>
            <li className="hover:text-brand-400"><Link to="/track-order">Track Order</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="mb-4 font-semibold text-white">Customer Support</h3>

          <ul className="space-y-3 text-sm text-slate-400">
            <li>Help Center</li>
            <li>Shipping Information</li>
            <li>Warranty Support</li>
            <li>Contact Us</li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="mb-4 font-semibold text-white">Contact</h3>

          <p className="text-sm text-slate-400">
            Email: support@smarthome.com
          </p>

          <p className="mt-2 text-sm text-slate-400">
            Phone: +91 98765 43210
          </p>
        </div>

      </div>

      <div className="border-t border-white/10 py-5 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} SmartHome. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
