import { Link } from "react-router-dom";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-200">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-6 text-sm md:flex-row md:items-center md:justify-between">
        <p className="text-xs uppercase tracking-widest text-slate-400">RBA Care</p>
        <p className="text-xs text-slate-400">© {year} RBA Care. All rights reserved.</p>
        <nav className="flex items-center gap-4 text-xs">
          <Link to="/" className="transition-colors hover:text-white">
            Home
          </Link>
          <a
            href="mailto:support@rbacare.com"
            className="transition-colors hover:text-white"
          >
            Contact
          </a>
          <a
            href="https://example.com/privacy"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-white"
          >
            Privacy
          </a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;