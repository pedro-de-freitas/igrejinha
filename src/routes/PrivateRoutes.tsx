import { Navigate } from "react-router-dom"

export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const user = localStorage.getItem("user")

  if (!user) {
    return <Navigate to="/" />
  }

  return children
}