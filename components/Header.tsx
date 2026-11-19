import Link from "next/link";

export default function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="brand">Weather App</Link>
        <nav className="main-nav" aria-label="Navegação principal">
          <Link href="/" className="nav-link">Buscar cidade</Link>
          <Link href="/favorites" className="nav-link">Favoritos</Link>
        </nav>
      </div>
    </header>
  );
}
