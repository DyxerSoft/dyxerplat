import Header from "@/components/public/Header.jsx";
import Footer from "@/components/public/Footer.jsx";

export default function ProductsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <><Header />{children}<Footer /></>;
}
