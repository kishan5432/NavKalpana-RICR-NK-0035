export default function Footer() {
  return (
    <footer className="bg-black text-white py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold mb-4">Join now and get Rides</h3>
            <p className="text-gray-400 text-sm">Become a part of our community</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>Help Center</li>
              <li>Safety</li>
              <li>T & C Help ticket</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">About</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>About us</li>
              <li>Blog</li>
              <li>Press</li>
              <li>Contact us</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Find Carpoolers in</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>Mumbai</li>
              <li>Delhi</li>
              <li>Bangalore</li>
              <li>Chennai</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>© 2025 - RideShareX. All Rights Reserved</p>
        </div>
      </div>
    </footer>
  );
}
