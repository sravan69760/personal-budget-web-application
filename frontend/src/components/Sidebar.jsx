import { NavLink } from "react-router-dom";
import { BarChart3, Banknote, Building2, CreditCard, FileText, Home, ReceiptText, Settings, WalletCards } from "lucide-react";

const links = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/expenses", label: "Expenses", icon: ReceiptText },
  { to: "/income", label: "Income", icon: Banknote },
  { to: "/budgets", label: "Budgets", icon: WalletCards },
  { to: "/credit-cards", label: "Credit Cards", icon: CreditCard },
  { to: "/banks", label: "Banks", icon: Building2 },
  { to: "/documents", label: "Documents", icon: FileText },
  { to: "/settings", label: "Settings", icon: Settings }
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <BarChart3 size={24} />
        <span>Budget</span>
      </div>
      <nav>
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => (isActive ? "active" : "")}>
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
