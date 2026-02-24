import { Manrope } from "next/font/google";
import "./globals.css";
import LayoutShell from "@/components/LayoutShell";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  variable: '--font-manrope',
});

export const metadata = {
  title: "Nullify",
  description: "Where Waste Stops and Cool Streets Start",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={manrope.variable}>
      <body className={manrope.className}>
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
