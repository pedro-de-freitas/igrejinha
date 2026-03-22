import { useState } from "react"
import { supabase } from "../../services/supabase"
import { useNavigate } from "react-router-dom"
import { RegisterModal } from "../../components/registermodal/RegisterModal"

export function Login() {
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [openModal, setOpenModal] = useState(false)

  const navigate = useNavigate()

  const handleLogin = async () => {
    setLoading(true)
    setErrorMsg("")

    if (!name || !password) {
      setErrorMsg("Preencha todos os campos")
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("name", name)
      .eq("password", password)
      .single()

    if (error || !data) {
      setErrorMsg("Nome ou senha inválidos")
      setLoading(false)
      return
    }

    // salva sessão
    localStorage.setItem("user", JSON.stringify(data))

    navigate("/dashboard")
    setLoading(false)
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
      
      <div className="bg-gray-900/80 backdrop-blur-lg p-8 rounded-2xl w-96 shadow-2xl border border-gray-700">
        <h1 className="text-white text-3xl font-bold text-center mb-2">
          A Igrejinha
        </h1>

        <p className="text-gray-400 text-center mb-6">
          Acesse o sistema
        </p>

        {/* ERRO */}
        {errorMsg && (
          <p className="text-red-400 text-sm mb-4 text-center">
            {errorMsg}
          </p>
        )}

        <input
          type="text"
          placeholder="Nome"
          className="w-full mb-4 p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-blue-500 outline-none"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="password"
          placeholder="Senha"
          className="w-full mb-6 p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-blue-500 outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 transition p-3 rounded-lg text-white font-semibold"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <button
          onClick={() => setOpenModal(true)}
          className="w-full mt-3 text-gray-400 hover:text-white transition"
        >
          Criar conta
        </button>
      </div>

      {openModal && (
        <RegisterModal onClose={() => setOpenModal(false)} />
      )}
    </div>
  )
}