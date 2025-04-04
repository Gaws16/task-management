import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Board from './components/Board'
import Header from './components/Header'
import { TaskProvider } from './context/TaskContext'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <TaskProvider>
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <Board />
          </main>
        </div>
      </TaskProvider>
    </DndProvider>
  )
}

export default App
