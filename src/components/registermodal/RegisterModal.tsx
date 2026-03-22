import { useState } from "react"
import { supabase } from "../../services/supabase"

type Props = {
  onClose: () => void
}

export function RegisterModal({ onClose }: Props) {
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [department, setDepartment] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const handleRegister = async () => {
    setLoading(true)
    setErrorMsg("")

    if (!name || !password || !department) {
      setErrorMsg("Preencha todos os campos")
      setLoading(false)
      return
    }

    const { error } = await supabase.from("users").insert({
      name,
      password,
      department,
    })

    if (error) {
      if (error.message.includes("duplicate")) {
        setErrorMsg("Nome já existe")
      } else {
        setErrorMsg("Erro ao criar usuário")
      }
      setLoading(false)
      return
    }

    // limpa campos
    setName("")
    setPassword("")
    setDepartment("")

    // fecha modal
    onClose()

    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      
      {/* CARD */}
      <div className="bg-gray-900 w-96 p-6 rounded-2xl border border-gray-700 shadow-2xl">
        
        <h2 className="text-white text-xl font-bold mb-4">
          Criar conta
        </h2>

        {/* ERRO */}
        {errorMsg && (
          <p className="text-red-400 text-sm mb-3">{errorMsg}</p>
        )}

        {/* NOME */}
        <input
          type="text"
          placeholder="Nome"
          className="w-full mb-3 p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-green-500 outline-none"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* SENHA */}
        <input
          type="password"
          placeholder="Senha"
          className="w-full mb-3 p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-green-500 outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* DEPARTAMENTO */}
        <select
          className="w-full mb-4 p-3 rounded-lg bg-gray-800 text-white border border-gray-700 outline-none focus:border-green-500"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        >
          <option value="">Selecione o departamento</option>
          <option value="Infantil">Infantil</option>
          <option value="Adolescentes">Adolescentes</option>
          <option value="Adultos">Adultos</option>
        </select>

        {/* BOTÕES */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="w-full bg-gray-700 hover:bg-gray-600 transition p-3 rounded-lg text-white"
          >
            Cancelar
          </button>

          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 transition p-3 rounded-lg text-white font-semibold"
          >
            {loading ? "Criando..." : "Criar"}
          </button>
        </div>
      </div>
    </div>
  )
}