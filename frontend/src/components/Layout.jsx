import Navbar from './Navbar';
import Footer from './Footer';
import Snowfall from './Snowfall';

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Snowfall />
      <Navbar />
      <main className="flex-grow pt-[73px] lg:pt-[105px] pb-20">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
