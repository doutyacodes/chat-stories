import './globals.css'; // Import global CSS
import { Inter } from 'next/font/google'; 
import NavBar from './components/NavBar'  // Make sure this matches your file name exactly
import { Toaster } from "sonner"

const inter = Inter({ subsets: ['latin'] }); 

export const metadata = {
  title: {
    default: "Qatha — Interactive Chat Stories & Audio Books",
    template: "%s | Qatha",
  },
  description:
    "Experience interactive chat stories, immersive audio tales, and visual narratives on Qatha.",
  keywords: ["Qatha", "chat stories", "audio stories", "interactive stories", "reading"],
  authors: [{ name: "Qatha" }],
  creator: "Qatha",
  publisher: "ByRoice",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Qatha — Interactive Chat Stories & Audio Books",
    description:
      "Experience interactive chat stories, immersive audio tales, and visual narratives on Qatha.",
    siteName: "Qatha",
    images: [
      {
        url: "/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "Qatha Icon",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className={inter.className}>
        {/* Global layout elements like header, footer can go here */}
        <header>
          <nav>
            {/* Navigation items */}
            <NavBar />
          </nav>
        </header>
        <main>
          {children}
        </main>
        <Toaster richColors />
      </body>
    </html>
  );
}
