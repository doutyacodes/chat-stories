import './globals.css';

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
        {/* Navbar with modern UI */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-4 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            {/* Logo or App Title */}
            <h1 className="text-2xl font-bold">Fictional Chats</h1>
            {/* Navigation Links */}
            <nav>
              <ul className="flex gap-6 text-sm md:text-base">
                <li className="hover:text-gray-300 cursor-pointer">Home</li>
                <li className="hover:text-gray-300 cursor-pointer">Stories</li>
                <li className="hover:text-gray-300 cursor-pointer">Profile</li>
              </ul>
            </nav>
          </div>
        </div>
        {children}
      </body>
    </html>
  );
}
