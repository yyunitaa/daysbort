import "./globals.css";

export const metadata = {
  title: "Audience Intelligence — Bupati Kolaka (AJD)",
  description: "Dashboard sentimen, topik & konten sosial media untuk Amri Jamaluddin (AJD), sumber Kanalytics SPI.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
