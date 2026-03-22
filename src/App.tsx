import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Login } from "./pages/login/app"
import { Dashboard } from "./pages/dashboard/app"
import { PrivateRoute } from "./routes/PrivateRoutes"
import { MainLayout } from "./components/layout/Layout"
import { Fotos } from "./pages/photos/app"
import { Videos } from "./pages/videos/app"
import { Audios } from "./pages/audio/app"
import { Lessons } from "./pages/lessons/app"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/fotos" element={<Fotos />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/audios" element={<Audios />} />
          <Route path="/aulas/infantil" element={<Lessons department="Infantil" />} />
          <Route path="/aulas/adolescentes" element={<Lessons department="Adolescentes" />} />
          <Route path="/aulas/adultos" element={<Lessons department="Adultos" />} />
        </Route>

      </Routes>
    </BrowserRouter>
  )
}

export default App