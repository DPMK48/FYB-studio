import Link from "next/link";
import PixelLogo25 from "./PixelLogo25";

export default function SiteNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-[#f4f4ee]/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
        <Link href="/home" className="flex items-center gap-3">
          <PixelLogo25 size={9} color="#0c0c0c" label={false} />
          <div>
            <div className="font-display text-lg leading-none">
              25BITS <span className="text-[#009444]">FYB</span>
            </div>
            <div className="text-[10px] uppercase tracking-widest text-black/50">
              Class of 2025 • ATBU
            </div>
          </div>
        </Link>
        <nav className="gap-1 sm:flex">
          <NavLink href="/admin/login">Admin</NavLink>
        </nav>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-full px-4 py-2 text-sm font-semibold text-black/80 transition hover:bg-black/5"
    >
      {children}
    </Link>
  );
}
