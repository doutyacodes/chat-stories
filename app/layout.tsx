import './globals.css';

import Navbar from './_components/NavBar'

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
        <Navbar/>
        {children}
      </body>
    </html>
  );
}
