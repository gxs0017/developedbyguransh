import { BrowserRouter, Routes, Route } from 'react-router-dom'
import WorkInProgress from './pages/WorkInProgress'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/404-work-in-progress" element={<WorkInProgress />} />
        <Route path="*" element={<WorkInProgress />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App