import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ProjectPage from "./pages/ProjectPage";
import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";

function App() {
  return (
    <MantineProvider>
      <Routes>
        <Route index path="/" element={<Home />} />
        <Route path="/project/:projectId" element={<ProjectPage />} />
      </Routes>
    </MantineProvider>
  );
}

export default App;
