import "./globals.css";

export const metadata = {
  title: "ATOB Admin — Control Tower",
  description: "ATOB Transport admin dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
