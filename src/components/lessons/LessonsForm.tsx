import { useEffect, useRef, useState } from "react"

type Props = {
  onSave: (title: string, content: string, date: string) => void
  onClose: () => void
  initialData?: any
}

export function LessonForm({ onSave, onClose, initialData }: Props) {

  const editorRef = useRef<HTMLDivElement>(null)

  // ✅ REGRA CORRETA DA SEXTA
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

    return friday.toLocaleDateString("sv-SE")
  }

  // ✅ FORMATAR DATA SEM BUG
  const formatDateBR = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-")
    const date = new Date(Number(year), Number(month) - 1, Number(day))

    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [date, setDate] = useState("")

  useEffect(() => {
    if (initialData && editorRef.current) {
      setTitle(initialData.title)
      setDate(initialData.date)
      editorRef.current.innerHTML = initialData.content
    } else {
      setDate(getNextFriday())
    }
  }, [initialData])

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-900 w-full max-w-lg p-6 rounded-2xl space-y-4">

        <h2 className="text-xl font-bold">
          {initialData ? "Editar Aula" : "Nova Aula"}
        </h2>

        {/* TÍTULO */}
        <input
          placeholder="Título da aula"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 bg-gray-800 rounded"
        />

        {/* TOOLBAR */}
        <div className="flex gap-2 flex-wrap">

          <button
            onClick={() => document.execCommand("bold")}
            className="px-3 py-1 bg-gray-700 rounded"
          >
            B
          </button>

          <button
            onClick={() => document.execCommand("italic")}
            className="px-3 py-1 bg-gray-700 rounded"
          >
            I
          </button>

          <button
            onClick={() => document.execCommand("underline")}
            className="px-3 py-1 bg-gray-700 rounded"
          >
            U
          </button>

          <select
            onChange={(e) =>
              document.execCommand("fontSize", false, e.target.value)
            }
            className="bg-gray-700 px-2 rounded"
          >
            <option value="3">Normal</option>
            <option value="4">Grande</option>
            <option value="5">Maior</option>
            <option value="6">Título</option>
          </select>
        </div>

        {/* ✍️ EDITOR */}
        <div>
          <p className="text-sm text-gray-400 mb-1">Conteúdo da aula</p>

          <div
            ref={editorRef}
            contentEditable
            className="w-full p-3 bg-gray-800 rounded h-40 overflow-auto outline-none"
            onInput={() =>
              setContent(editorRef.current?.innerHTML || "")
            }
          />
        </div>

        {/* 📅 DATA */}
        <div className="bg-gray-800 p-3 rounded text-gray-300">
          Próxima aula:{" "}
          <span className="font-semibold">
            {date && formatDateBR(date)}
          </span>
        </div>

        {/* BOTÕES */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="w-full bg-gray-700 p-3 rounded"
          >
            Cancelar
          </button>

          <button
            onClick={() =>
              onSave(
                title,
                editorRef.current?.innerHTML || "",
                date
              )
            }
            className="w-full bg-blue-600 p-3 rounded"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  )
}