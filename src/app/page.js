import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Feature from "./components/Feature";
import Activity from "./components/Activity";
import Footer from "./components/Footer";
import Photo from "./components/Photo";
import Location from "./components/Location";

export default function Home() {
  return (
    <>
      <div className="relative">
        <Navbar className="absolute top-0 left-0 right-0 z-10" />
        <Hero className="pt-20 md:pt-20 lg:pt-24" />
      </div>
      <main>
        <Feature />
        <Activity />
        <Photo />
        <Location />
      </main>
      <footer>
        <Footer />
      </footer>
    </>
  );
}
