import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Dock } from "./components/layout/Dock";
import { Noise } from "./components/ui/Noise";
import { HomeView } from "./components/views/HomeView";
import { ProjectsView } from "./components/views/ProjectsView";
import { AboutView } from "./components/views/AboutView";
import { ContactView } from "./components/views/ContactView";

function App() {
  const [currentView, setCurrentView] = useState("home");

  const renderView = () => {
    switch (currentView) {
      case "home":
        return <HomeView key="home" />;
      case "projects":
        return <ProjectsView key="projects" />;
      case "about":
        return <AboutView key="about" />;
      case "contact":
        return <ContactView key="contact" />;
      default:
        return <HomeView key="home" />;
    }
  };

  return (
    <main className="min-h-screen bg-black text-white selection:bg-purple-500/30 selection:text-purple-200 overflow-x-hidden">
      <Noise />
      
      {/* Main Content Area with Transitions */}
      <AnimatePresence mode="wait">
        {renderView()}
      </AnimatePresence>

      <Dock currentView={currentView} onChangeView={setCurrentView} />
    </main>
  );
}

export default App;
