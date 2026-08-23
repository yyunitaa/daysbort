import "./globals.css";

export const metadata = {
  title: "Laporan Media Sosial Kabupaten Kolaka",
  description: "Dashboard sentimen, topik & konten sosial media untuk Amri Jamaluddin, Bupati Kabupaten Kolaka, sumber Kanalytics SPI.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
