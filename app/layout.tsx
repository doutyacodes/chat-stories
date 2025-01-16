import './globals.css';
import Navbar from '@/components/custom-components/NavBar'  // Move NavBar to components folder

export const metadata = {
  title: 'Fictional Chats',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
