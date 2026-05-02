import { Link, useLocation, useNavigate } from "react-router-dom";
import { clearAuth, getUser } from "@/lib/auth";
import { logout } from "@/api/auth";
import { useTheme } from "@/hooks/useTheme";
import {
  ChartBarIcon,
  BuildingLibraryIcon,
  ArrowsRightLeftIcon,
  CalculatorIcon,
  ArrowRightStartOnRectangleIcon,
  SunIcon,
  MoonIcon,
} from "@heroicons/react/24/outline";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: ChartBarIcon },
  { label: "Accounts", path: "/accounts", icon: BuildingLibraryIcon },
  { label: "Transactions", path: "/transactions", icon: ArrowsRightLeftIcon },
  { label: "Budgets", path: "/budgets", icon: CalculatorIcon },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getUser();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      clearAuth();
      navigate("/login");
    }
  };

  return (
    <aside className="w-64 min-h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          FinancePlanner
        </h1>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-700 space-y-1">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          {theme === "light" ? (
            <>
              <MoonIcon className="w-5 h-5" />
              <span>Dark mode</span>
            </>
          ) : (
            <>
              <SunIcon className="w-5 h-5" />
              <span>Light mode</span>
            </>
          )}
        </button>

        <div className="px-3 py-2">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {user?.displayName}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {user?.email}
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowRightStartOnRectangleIcon className="w-5 h-5" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
