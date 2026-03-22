import { useState } from "react"
import { Link, Outlet, useLocation } from "react-router-dom"

export function MainLayout() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  const user = JSON.parse(localStorage.getItem("user") || "{}")

  const departmentRoute = user?.department
    ? `/aulas/${user.department.toLowerCase()}`
    : ""

  const isActive = (path: string) =>
    location.pathname === path

  const linkClass = (path: string) =>
    `flex items-center gap-3 p-3 rounded-xl transition ${
      isActive(path)
        ? "bg-blue-600 text-white shadow-lg"
        : "text-gray-300 hover:bg-gray-700 hover:text-white"
    }`

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <aside
        className={`fixed md:static z-50 top-0 left-0 h-full w-64 bg-gradient-to-b from-gray-900 to-gray-800 p-5 transition-transform ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">
            ⛪ Igrejinha
          </h1>
          <p className="text-gray-400 text-sm">
            Painel administrativo
          </p>
        </div>

        <nav className="flex flex-col gap-2">

          <Link to="/dashboard" className={linkClass("/dashboard")}>
             Dashboard
          </Link>

          <Link to="/fotos" className={linkClass("/fotos")}>
             Fotos
          </Link>

          <Link to="/videos" className={linkClass("/videos")}>
             Vídeos
          </Link>

          <Link to="/audios" className={linkClass("/audios")}>
             Audios
          </Link>

          {departmentRoute && (
            <Link to={departmentRoute} className={linkClass(departmentRoute)}>
               Aulas - {user.department}
            </Link>
          )}
        </nav>

        <div className="absolute bottom-5 left-5 right-5">
          <div className="bg-gray-800 p-3 rounded-xl">
            <p className="text-sm text-gray-300">{user.name}</p>
            <button
              onClick={() => {
                localStorage.removeItem("user")
                window.location.href = "/"
              }}
              className="text-red-400 text-sm mt-1 hover:text-red-300"
            >
              Sair
            </button>
          </div>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col">
        <header className="px-6 py-4 flex items-center justify-between">
            <button
                className="md:hidden text-xl"
                onClick={() => setOpen(!open)}
            >
                ☰
            </button>

            <div className="flex items-center gap-3 ml-auto">
                <span className="text-sm text-gray-300">
                {user.name} - {user.department}
                </span>

                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">
                {user.name?.[0]?.toUpperCase()}
                </div>
            </div>
        </header>

        <main className="p-6 flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}