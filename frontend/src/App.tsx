import { useState } from 'react';
import './App.css';
import { Greet } from "../wailsjs/go/main/App";
import Card from "./components/Card"
import Button from "./components/Button"
import "./styles/header.css"

function App() {
  const handleCreateNewProject = () => {
    console.log("clicked")
  }

  const handleOpenProject = () => {
    console.log("clicked")
  }

  return (
    <div>
      <div className='header'>
        <h1>Hyūga</h1>
        <Button
          label="crear proyecto"
          onClick={handleCreateNewProject}
          type="button"
        />
      </div>
      <Card
        title="Proyecto Uno"
        content={
          <Button
            label="Abrir"
            onClick={handleCreateNewProject}
            type="button"
          />
        }
        footer="" />
    </div>
  )
}

export default App
