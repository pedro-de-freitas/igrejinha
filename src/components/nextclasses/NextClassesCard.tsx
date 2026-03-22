import { useEffect, useState } from "react"
import { supabase } from "../../services/supabase"

type Aula = {
  id: string
  title: string
  department: string
  date: string
}

export function NextClassesCard() {
  const [aulas, setAulas] = useState<Aula[]>([])
  const [nextFriday, setNextFriday] = useState("")

  // 🔥 MESMA REGRA DO FORM
  const getNextFriday = () => {
    const today = new Date()
    const day = today.getDay()

    let diff = 5 - day

    if (day > 5) {
      diff += 7
    }

    const friday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + diff
    )

    const formatted = friday.toLocaleDateString("sv-SE")

    setNextFriday(formatted)

    return formatted
  }

  // 🔥 CORRIGIR TIMEZONE
  const formatDate = (date: string) => {
    const [year, month, day] = date.split("-")
    return `${day}/${month}/${year}`
  }

  const fetchAulas = async () => {
    const nextFridayDate = getNextFriday()

    const { data } = await supabase
      .from("lessons") // 🔥 AQUI FOI O PRINCIPAL FIX
      .select("*")
      .eq("date", nextFridayDate)

    if (data) setAulas(data)
  }

  useEffect(() => {
    fetchAulas()
  }, [])

  const groupByDept = (dept: string) =>
    aulas.filter((aula) => aula.department === dept)

  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
      
      <h2 className="text-xl font-bold mb-4 flex items-center justify-between">
        <span>📅 Próxima Sexta-feira</span>

        {nextFriday && (
          <span className="text-sm text-gray-400 bg-gray-700 px-2 py-1 rounded">
            {formatDate(nextFriday)}
          </span>
        )}
      </h2>

      <div className="grid md:grid-cols-3 gap-4">
        
        {/* INFANTIL */}
        <div>
          <h3 className="text-blue-400 font-semibold mb-2">
            Infantil
          </h3>
          {groupByDept("Infantil").length ? (
            groupByDept("Infantil").map((aula) => (
              <p key={aula.id} className="text-gray-300 text-sm">
                • {aula.title}
              </p>
            ))
          ) : (
            <p className="text-gray-500 text-sm">Sem aulas</p>
          )}
        </div>

        <div>
          <h3 className="text-green-400 font-semibold mb-2">
            Adolescentes
          </h3>
          {groupByDept("Adolescentes").length ? (
            groupByDept("Adolescentes").map((aula) => (
              <p key={aula.id} className="text-gray-300 text-sm">
                • {aula.title}
              </p>
            ))
          ) : (
            <p className="text-gray-500 text-sm">Sem aulas</p>
          )}
        </div>

        <div>
          <h3 className="text-purple-400 font-semibold mb-2">
            Adultos
          </h3>
          {groupByDept("Adultos").length ? (
            groupByDept("Adultos").map((aula) => (
              <p key={aula.id} className="text-gray-300 text-sm">
                • {aula.title}
              </p>
            ))
          ) : (
            <p className="text-gray-500 text-sm">Sem aulas</p>
          )}
        </div>

      </div>
    </div>
  )
}