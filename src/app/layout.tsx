import "./globals.css";

// Root layout only passes children through; the real <html> shell
// lives in [locale]/layout.tsx (and admin/layout.tsx for the admin area).
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
