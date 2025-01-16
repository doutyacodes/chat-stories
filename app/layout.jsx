import './globals.css';
import Navbar from '@/components/NavBar'  // Move NavBar to components folder

export const metadata = {
  title: 'Fictional Chats',
};

export default async function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
          <Navbar />
          {children}
      </body>
    </html>
  );
}

