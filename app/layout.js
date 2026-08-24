import "./globals.css";

export const metadata = {
  title: "Kanalytics",
  description: "Dashboard intelijen media sosial — sentimen, topik, radar risiko, dan audiens dalam satu tempat.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
