import { Link, useLocation } from "react-router-dom";

const navLinks = [
  { to: "/", label: "Dashboard" },
  { to: "/compliance", label: "Compliance" },
  { to: "/schedule", label: "Schedule Risk" },
  { to: "/rfi", label: "RFI Intelligence" },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="bg-slate-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-8">
        <div className="font-bold text-lg text-teal-400 tracking-wide">
          DCPI
          <span className="ml-2 text-xs font-normal text-slate-400 hidden sm:inline">
            Data Centre Project Intelligence
          </span>
        </div>
        <div className="flex gap-1">
          {navLinks.map((link) => {
            const isActive =
              location.pathname === link.to ||
              (link.to !== "/" && location.pathname.startsWith(link.to));
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-teal-600 text-white"
                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
