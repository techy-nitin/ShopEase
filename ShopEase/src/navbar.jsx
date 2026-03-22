import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// ─── Fonts & Animations ───────────────────────────────────────────────────────
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap');

  .nb-search-input::placeholder { color: #444; }
  .nb-search-input:focus { outline: none; border-color: rgba(18,218,168,0.5) !important; box-shadow: 0 0 0 3px rgba(18,218,168,0.08); }

  .nb-account-btn { transition: color 0.2s; }
  .nb-account-btn:hover { color: #12daa8 !important; }

  .nb-loc-btn { transition: background 0.2s, border-color 0.2s, color 0.2s; }
  .nb-loc-btn:hover { border-color: rgba(18,218,168,0.5) !important; color: #12daa8 !important; background: rgba(18,218,168,0.06) !important; }

  .nb-cart-link { transition: transform 0.2s; display: inline-block; }
  .nb-cart-link:hover { transform: scale(1.1); }

  .nb-logo { transition: color 0.2s; }
  .nb-logo:hover { color: #12daa8 !important; }

  /* Account dropdown */
  .nb-dd-item { transition: background 0.18s, padding-left 0.18s; }
  .nb-dd-item:hover { background: rgba(18,218,168,0.07) !important; padding-left: 22px !important; }
  .nb-dd-item:hover .nb-dd-arrow { color: #12daa8 !important; opacity: 1 !important; }

  /* Sidebar */
  .nb-cat-item { transition: background 0.18s, color 0.18s; }
  .nb-cat-item:hover { background: rgba(18,218,168,0.08) !important; color: #12daa8 !important; }
  .nb-sub-item  { transition: background 0.18s, padding-left 0.18s; }
  .nb-sub-item:hover  { background: rgba(18,218,168,0.1) !important; padding-left: 24px !important; color: #12daa8 !important; }

  /* Sidebar slide-in */
  @keyframes nbSlideIn { from { transform: translateX(-100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  .nb-sidebar { animation: nbSlideIn 0.28s cubic-bezier(0.16,1,0.3,1) both; }

  /* Accordion sub-panel slide down */
  @keyframes nbAccordion { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
  .nb-sidebar li > div + div { animation: nbAccordion 0.22s cubic-bezier(0.16,1,0.3,1) both; }

  /* Dropdown fade */
  @keyframes nbFadeDown { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
  .nb-dropdown { animation: nbFadeDown 0.2s cubic-bezier(0.16,1,0.3,1) both; }

  /* Search bar grow */
  .nb-search-input { transition: border-color 0.2s, box-shadow 0.2s; }

  /* Logout btn */
  .nb-logout { transition: background 0.2s, transform 0.15s; }
  .nb-logout:hover { background: #0fbf93 !important; transform: translateY(-1px); }
  .nb-logout:active { transform: scale(0.97); }
`;

// ─── Main Navbar ──────────────────────────────────────────────────────────────
export default function Navbar() {
  const userName = localStorage.getItem("name");
  const [showAccount, setShowAccount] = useState(false);
  const [showMenu, setShowMenu]       = useState(false);
  const [search, setSearch]           = useState("");
  const navigate = useNavigate();

  const [location, setLocation] = useState({ latitude: null, longitude: null, district: "", pincode: "" });

  function handleSearch(e) {
    e.preventDefault();
    if (!search.trim()) return;
    navigate(`/products?keyword=${encodeURIComponent(search)}`);
    setSearch("");
  }

  async function fallbackIPLocation() {
    try {
      const res  = await fetch("http://localhost:8081/api/location/get");
      const data = await res.json();
      setLocation({ latitude: null, longitude: null, district: data.district, pincode: data.pincode });
    } catch {
      setLocation({ latitude: null, longitude: null, district: "Unknown", pincode: "000000" });
    }
  }

  function getcurrent() {
    if (!navigator.geolocation) { fallbackIPLocation(); return; }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res  = await fetch("http://localhost:8081/api/location/get-accurate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ latitude, longitude }),
          });
          const data = await res.json();
          setLocation({ latitude, longitude, district: data.district, pincode: data.pincode });
        } catch { fallbackIPLocation(); }
      },
      () => fallbackIPLocation(),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <>
      <style>{globalStyles}</style>

      <header style={nb.header}>
        {/* Teal bottom line */}
        <div style={nb.headerLine} />

        <div style={nb.inner}>

          {/* LEFT — Hamburger + Logo */}
          <div style={nb.left}>
            {/* Hamburger */}
            <button style={nb.hamburger} onClick={() => setShowMenu(!showMenu)}>
              <span style={{ ...nb.hamLine, marginBottom: "4px" }} />
              <span style={nb.hamLine} />
              <span style={{ ...nb.hamLine, marginTop: "4px" }} />
            </button>

            {/* Logo */}
            <Link to="/" style={{ textDecoration: "none" }}>
              <span className="nb-logo" style={nb.logo}>
                Shop<span style={nb.logoAccent}>Ease</span>
              </span>
            </Link>
          </div>

          {/* CENTER — Search bar */}
          <form onSubmit={handleSearch} style={nb.searchForm}>
            <div style={nb.searchWrap}>
              <span style={nb.searchIcon}>⌕</span>
              <input
                type="text"
                className="nb-search-input"
                placeholder="Search products, brands & categories…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={nb.searchInput}
              />
              <button type="submit" style={nb.searchBtn}>
                Search
              </button>
            </div>
          </form>

          {/* RIGHT — Location, Account, Cart */}
          <div style={nb.right}>

            {/* Location */}
            <button className="nb-loc-btn" style={nb.locBtn} onClick={getcurrent}>
              <span style={nb.locIcon}>◎</span>
              <span style={nb.locText}>
                {location.district && location.pincode
                  ? `${location.district} ${location.pincode}`
                  : "Location"}
              </span>
            </button>

            {/* Account dropdown */}
            <div
              style={nb.accountWrap}
              onMouseEnter={() => setShowAccount(true)}
              onMouseLeave={() => setShowAccount(false)}
            >
              <button className="nb-account-btn" style={nb.accountBtn}>
                <span style={nb.accountIcon}>◉</span>
                <span>{userName ? userName.split(" ")[0] : "Account"}</span>
                <span style={{ fontSize: "10px", color: "#444", marginLeft: "2px" }}>▾</span>
              </button>

              {showAccount && (
                <div className="nb-dropdown" style={nb.dropdown}>
                  <AccountDropdown />
                </div>
              )}
            </div>

            {/* Cart */}
            <Link to="/cart" className="nb-cart-link" style={{ textDecoration: "none" }}>
              <div style={nb.cartWrap}>
                <span style={nb.cartIcon}>🛒</span>
                <span style={nb.cartBadge}>0</span>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Sidebar overlay */}
      {showMenu && (
        <>
          <div style={nb.overlay} onClick={() => setShowMenu(false)} />
          <ShopeaseNav userName={userName} onClose={() => setShowMenu(false)} />
        </>
      )}
    </>
  );
}

// ─── Account Dropdown ─────────────────────────────────────────────────────────
function AccountDropdown() {
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    window.location.href = "/login";
  };

  const items = [
    { to: "/profile",    icon: "◈", title: "My Profile",     desc: "Edit your basic details"          },
    { to: "/orders",     icon: "◉", title: "My Orders",      desc: "View and track orders"             },
    { to: "/wishlist",   icon: "◎", title: "My Wishlist",    desc: "Your favourite products"           },
    { to: "/mp",         icon: "◆", title: "My Wallet",      desc: "Balance & transactions"            },
    { to: "/seller-reg", icon: "◐", title: "Seller Account", desc: "Start your seller registration"   },
  ];

  return (
    <div style={dd.container}>
      {/* Header */}
      <div style={dd.header}>
        <p style={dd.headerEye}>Account</p>
        <p style={dd.headerGreet}>Welcome back 👋</p>
      </div>

      {/* Menu items */}
      {items.map((item) => (
        <Link key={item.to} to={item.to} style={{ textDecoration: "none" }}>
          <div className="nb-dd-item" style={dd.item}>
            <span style={dd.itemIcon}>{item.icon}</span>
            <div style={{ flex: 1 }}>
              <p style={dd.itemTitle}>{item.title}</p>
              <p style={dd.itemDesc}>{item.desc}</p>
            </div>
            <span className="nb-dd-arrow" style={dd.arrow}>›</span>
          </div>
        </Link>
      ))}

      {/* Logout */}
      <div style={dd.logoutWrap}>
        <button className="nb-logout" style={dd.logoutBtn} onClick={handleLogout}>
          Sign Out
        </button>
      </div>
    </div>
  );
}

// ─── Sidebar Nav ──────────────────────────────────────────────────────────────
function ShopeaseNav({ userName, onClose }) {
  const navigate = useNavigate();
  // Accordion: stores which category is open (click to toggle)
  const [openCat, setOpenCat] = useState(null);

  const categories = [
    {
      name: "Televisions & Accessories",
      icon: "📺",
      sub: [
        { name: "All Televisions",  id: 11 },
        { name: "LED TVs",          id: 11 },
        { name: "Smart TVs",        id: 11 },
        { name: "TV Accessories",   id: 18 },
      ],
    },
    {
      name: "Home Appliances",
      icon: "🏠",
      sub: [
        { name: "Refrigerators",    id: 12 },
        { name: "Washing Machines", id: 13 },
        { name: "Air Conditioners", id: 14 },
      ],
    },
    {
      name: "Phones & Wearables",
      icon: "📱",
      sub: [
        { name: "Mobile Phones",    id: 1  },
        { name: "Smart Watches",    id: 15 },
        { name: "Fitness Bands",    id: 15 },
      ],
    },
    {
      name: "Audio & Video",
      icon: "🎧",
      sub: [
        { name: "Headphones & Earphones", id: 17 },
        { name: "Speakers",               id: 18 },
        { name: "Home Theatre",           id: 29 },
        { name: "Projectors",             id: 29 },
      ],
    },
  ];

  const toggle = (name) => setOpenCat(openCat === name ? null : name);

  return (
    <div className="nb-sidebar" style={sb.container}>

      {/* Header */}
      <div style={sb.header}>
        <div>
          <p style={sb.headerEye}>Welcome</p>
          <p style={sb.headerName}>{userName || "Guest"}</p>
        </div>
        <button style={sb.closeBtn} onClick={onClose}>✕</button>
      </div>

      <div style={sb.accentLine} />

      <p style={sb.catTitle}>Shop by Category</p>

      <ul style={sb.list}>
        {categories.map((cat) => {
          const isOpen = openCat === cat.name;
          return (
            <li key={cat.name}>
              {/* Category row — click toggles accordion */}
              <div
                style={{
                  ...sb.item,
                  background: isOpen ? "rgba(18,218,168,0.06)" : "transparent",
                  borderLeft: isOpen ? "3px solid #12daa8" : "3px solid transparent",
                }}
                onClick={() => toggle(cat.name)}
              >
                <span style={sb.catIcon}>{cat.icon}</span>
                <span style={{ ...sb.catName, color: isOpen ? "#12daa8" : "#bbb" }}>
                  {cat.name}
                </span>
                {/* Chevron rotates when open */}
                <span style={{
                  ...sb.catArrow,
                  transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                  transition: "transform 0.25s cubic-bezier(0.16,1,0.3,1)",
                }}>›</span>
              </div>

              {/* Submenu — expands inline inside sidebar, NO flyout */}
              {isOpen && (
                <div style={sb.subPanel}>
                  {cat.sub.map((sub) => (
                    <div
                      key={sub.name}
                      className="nb-sub-item"
                      style={sb.subItem}
                      onClick={() => { navigate(`/products?categoryId=${sub.id}`); onClose(); }}
                    >
                      <span style={sb.subDot}>›</span>
                      {sub.name}
                    </div>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {/* Bottom links */}
      <div style={sb.bottomLinks}>
        {[
          { to: "/orders",   label: "My Orders"  },
          { to: "/wishlist", label: "Wishlist"   },
          { to: "/profile",  label: "My Profile" },
        ].map((l) => (
          <Link key={l.to} to={l.to} style={sb.bottomLink} onClick={onClose}>
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─── Navbar Styles ────────────────────────────────────────────────────────────
const nb = {
  header: {
    position: "fixed",
    top: 0, left: 0, right: 0,
    zIndex: 999,
    background: "#080808",
    borderBottom: "1px solid #141414",
    fontFamily: "'DM Sans', sans-serif",
  },
  headerLine: {
    height: "2px",
    background: "linear-gradient(to right, #12daa8, transparent)",
    opacity: 0.6,
  },
  inner: {
    maxWidth: "1500px",
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    gap: "20px",
    padding: "0 5%",
    height: "64px",
  },

  left: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    flexShrink: 0,
  },
  hamburger: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "6px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "0",
    borderRadius: "8px",
  },
  hamLine: {
    display: "block",
    width: "20px",
    height: "2px",
    background: "#888",
    borderRadius: "2px",
  },
  logo: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "22px",
    fontWeight: "700",
    color: "#f5f5f2",
    letterSpacing: "-0.5px",
    textDecoration: "none",
  },
  logoAccent: {
    color: "#12daa8",
  },

  searchForm: {
    flex: 1,
    minWidth: 0,
  },
  searchWrap: {
    display: "flex",
    alignItems: "center",
    background: "#111",
    border: "1px solid #1e1e1e",
    borderRadius: "10px",
    overflow: "hidden",
    height: "40px",
  },
  searchIcon: {
    padding: "0 12px",
    fontSize: "18px",
    color: "#444",
    flexShrink: 0,
    lineHeight: 1,
  },
  searchInput: {
    flex: 1,
    background: "transparent",
    border: "none",
    color: "#e5e5e5",
    fontSize: "13px",
    fontFamily: "'DM Sans', sans-serif",
    padding: "0 8px 0 0",
    height: "100%",
    outline: "none",
    minWidth: 0,
  },
  searchBtn: {
    height: "100%",
    padding: "0 18px",
    background: "#12daa8",
    border: "none",
    color: "#000",
    fontWeight: "700",
    fontSize: "12px",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    letterSpacing: "0.3px",
    flexShrink: 0,
    transition: "opacity 0.2s",
  },

  right: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexShrink: 0,
  },
  locBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "transparent",
    border: "1px solid #1e1e1e",
    borderRadius: "8px",
    padding: "0 12px",
    height: "36px",
    color: "#666",
    cursor: "pointer",
    fontSize: "12px",
    fontFamily: "'DM Sans', sans-serif",
    whiteSpace: "nowrap",
    maxWidth: "160px",
    overflow: "hidden",
  },
  locIcon: {
    fontSize: "14px",
    color: "#12daa8",
    flexShrink: 0,
  },
  locText: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  accountWrap: {
    position: "relative",
  },
  accountBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "transparent",
    border: "1px solid #1e1e1e",
    borderRadius: "8px",
    padding: "0 14px",
    height: "36px",
    color: "#aaa",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    fontFamily: "'DM Sans', sans-serif",
  },
  accountIcon: {
    fontSize: "14px",
    color: "#12daa8",
  },
  dropdown: {
    position: "absolute",
    top: "calc(100% + 10px)",
    right: 0,
    zIndex: 1000,
  },

  cartWrap: {
    position: "relative",
    width: "40px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#111",
    border: "1px solid #1e1e1e",
    borderRadius: "8px",
  },
  cartIcon: {
    fontSize: "18px",
    lineHeight: 1,
  },
  cartBadge: {
    position: "absolute",
    top: "-6px",
    right: "-6px",
    background: "#12daa8",
    color: "#000",
    fontSize: "10px",
    fontWeight: "700",
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'DM Sans', sans-serif",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    zIndex: 998,
  },
};

// ─── Account Dropdown Styles ──────────────────────────────────────────────────
const dd = {
  container: {
    width: "280px",
    background: "#0e0e0e",
    border: "1px solid #1a1a1a",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
    fontFamily: "'DM Sans', sans-serif",
  },
  header: {
    padding: "16px 18px 14px",
    borderBottom: "1px solid #141414",
    background: "linear-gradient(135deg, #0e0e0e, #111)",
  },
  headerEye: {
    margin: "0 0 2px",
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "1.5px",
    textTransform: "uppercase",
    color: "#12daa8",
  },
  headerGreet: {
    margin: 0,
    fontSize: "15px",
    fontWeight: "600",
    color: "#f5f5f2",
  },
  item: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 18px",
    borderBottom: "1px solid #111",
    cursor: "pointer",
    background: "transparent",
  },
  itemIcon: {
    fontSize: "16px",
    color: "#12daa8",
    flexShrink: 0,
    width: "20px",
    textAlign: "center",
  },
  itemTitle: {
    margin: "0 0 1px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#e5e5e5",
  },
  itemDesc: {
    margin: 0,
    fontSize: "11px",
    color: "#444",
    fontWeight: "300",
  },
  arrow: {
    fontSize: "16px",
    color: "#1e1e1e",
    opacity: 0,
    transition: "opacity 0.2s, color 0.2s",
    marginLeft: "auto",
  },
  logoutWrap: {
    padding: "12px 16px",
    background: "#0a0a0a",
  },
  logoutBtn: {
    width: "100%",
    height: "38px",
    border: "none",
    borderRadius: "8px",
    background: "#12daa8",
    color: "#000",
    fontWeight: "700",
    fontSize: "13px",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    letterSpacing: "0.3px",
  },
};

// ─── Sidebar Styles ───────────────────────────────────────────────────────────
const sb = {
  container: {
    position: "fixed",
    top: 0, left: 0,
    width: "320px",
    height: "100vh",
    background: "#080808",
    border: "none",
    borderRight: "1px solid #141414",
    zIndex: 999,
    overflowY: "auto",
    overflowX: "hidden",   /* CRITICAL: prevents horizontal scroll */
    fontFamily: "'DM Sans', sans-serif",
    boxShadow: "12px 0 48px rgba(0,0,0,0.7)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 22px",
    borderBottom: "1px solid #141414",
  },
  headerEye: {
    margin: "0 0 2px",
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "1.5px",
    textTransform: "uppercase",
    color: "#12daa8",
  },
  headerName: {
    margin: 0,
    fontFamily: "'Playfair Display', serif",
    fontSize: "20px",
    fontWeight: "700",
    color: "#f5f5f2",
    letterSpacing: "-0.3px",
  },
  closeBtn: {
    background: "none",
    border: "1px solid #1e1e1e",
    color: "#666",
    width: "34px",
    height: "34px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  accentLine: {
    height: "1px",
    background: "linear-gradient(to right, #12daa8, transparent)",
    opacity: 0.35,
  },
  catTitle: {
    margin: "0",
    padding: "14px 22px 10px",
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "2px",
    textTransform: "uppercase",
    color: "#12daa8",
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  item: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px 22px",
    borderBottom: "1px solid #111",
    cursor: "pointer",
    position: "relative",
    color: "#bbb",
    fontSize: "14px",
    fontWeight: "500",
  },
  catIcon: {
    fontSize: "18px",
    flexShrink: 0,
    width: "24px",
    textAlign: "center",
  },
  catName: {
    flex: 1,
  },
  catArrow: {
    fontSize: "18px",
    color: "#12daa8",
    fontWeight: "700",
  },
  subPanel: {
    background: "#0a0a0a",
    borderLeft: "3px solid rgba(18,218,168,0.3)",
    marginLeft: "22px",
    marginRight: "0",
    borderBottom: "1px solid #111",
    overflow: "hidden",
  },
  subItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 20px",
    cursor: "pointer",
    fontSize: "13px",
    color: "#777",
    fontWeight: "400",
    borderBottom: "1px solid #0e0e0e",
    background: "transparent",
  },
  subDot: {
    color: "#12daa8",
    fontSize: "14px",
    flexShrink: 0,
  },
  bottomLinks: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    padding: "20px 22px",
    borderTop: "1px solid #141414",
    marginTop: "8px",
  },
  bottomLink: {
    fontSize: "13px",
    color: "#444",
    textDecoration: "none",
    padding: "8px 0",
    fontWeight: "400",
    borderBottom: "1px solid #111",
    transition: "color 0.2s",
  },
};