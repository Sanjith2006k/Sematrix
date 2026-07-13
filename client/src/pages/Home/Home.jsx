import Navbar from "../../components/Navbar/Navbar";
import Hero from "../../components/Hero/Hero";
import Features from "../../components/Features/Features";
import WhySematrix from "../../components/WhySematrix/WhySematrix";
import Footer from "../../components/Footer/Footer";
import Aurora from "../../components/Aurora/Aurora";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#1A1A1B] overflow-x-hidden">
      <div className="fixed inset-0 z-0">
        <Aurora
          colorStops={["#06B6D4","#B497CF","#37AA9C"]}
          blend={0.5}
          amplitude={1.0}
          speed={0.9}
        />
      </div>
      <div className="fixed inset-0 z-0 bg-black/60 pointer-events-none" />

      <div className="relative z-10">
        <Navbar />
        <Hero />
        <Features />
        <WhySematrix />
        <Footer />
      </div>
    </main>
  );
}
