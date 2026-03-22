import { useEffect, useState } from "react"
import { supabase } from "../../services/supabase"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { LessonForm } from "../../components/lessons/LessonsForm"

type Props = {
  department: string
}

export function Lessons({ department }: Props) {
  const [lessons, setLessons] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [search, setSearch] = useState("")
  const [monthFilter, setMonthFilter] = useState("")

  const [deleteId, setDeleteId] = useState<string | null>(null)

  const getMonthName = (date: string) => {
    return new Date(date).toLocaleString("pt-BR", {
      month: "long",
      year: "numeric",
    })
  }

  const fetchLessons = async () => {
    const { data } = await supabase
      .from("lessons")
      .select("*")
      .eq("department", department)
      .order("date", { ascending: false })

    if (data) setLessons(data)
  }

  useEffect(() => {
    fetchLessons()
  }, [])

  const handleSave = async (title: string, content: string, date: string) => {
    if (editing) {
      await supabase
        .from("lessons")
        .update({ title, content, date })
        .eq("id", editing.id)
    } else {
      await supabase.from("lessons").insert({
        title,
        content,
        date,
        department,
        month: getMonthName(date),
      })
    }

    setEditing(null)
    setOpen(false)
    fetchLessons()
  }

  const handleDelete = async () => {
    if (!deleteId) return

    await supabase.from("lessons").delete().eq("id", deleteId)

    setDeleteId(null)
    fetchLessons()
  }

  const exportPDF = async (lesson: any) => {
    const div = document.createElement("div")

    div.innerHTML = `
      <h1>${lesson.title}</h1>
      <p>${lesson.date}</p>
      <div>${lesson.content}</div>
    `

    document.body.appendChild(div)

    const canvas = await html2canvas(div)
    const img = canvas.toDataURL("image/png")

    const pdf = new jsPDF()
    pdf.addImage(img, "PNG", 10, 10, 180, 0)
    pdf.save(`${lesson.title}.pdf`)

    document.body.removeChild(div)
  }

  const filtered = lessons.filter((l) =>
    l.title.toLowerCase().includes(search.toLowerCase()) &&
    (monthFilter ? l.month === monthFilter : true)
  )

  return (
    <div className="p-4 space-y-6">

      {/* BUSCA + FILTRO */}
      <div className="flex gap-2">
        <input
          placeholder="Buscar aula..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 bg-gray-800 rounded text-white"
        />

        <select
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          className="p-3 bg-gray-800 rounded text-white"
        >
          <option value="">Todos</option>
          {[...new Set(lessons.map(l => l.month))].map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
      </div>

      <button
        onClick={() => {
          setEditing(null)
          setOpen(true)
        }}
        className="fixed bottom-6 right-6 bg-blue-600 w-14 h-14 rounded-full text-2xl"
      >
        +
      </button>

      <div className="space-y-4">
        {filtered.map((lesson) => (
          <div key={lesson.id} className="bg-gray-800 p-4 rounded-xl">

            <h3 className="font-bold text-lg">{lesson.title}</h3>
            <p className="text-gray-400 text-sm">{lesson.date}</p>

            <div
              className="text-gray-300 mt-2"
              dangerouslySetInnerHTML={{ __html: lesson.content }}
            />

            <div className="flex gap-2 mt-3 flex-wrap">

              <button
                onClick={() => {
                  setEditing(lesson)
                  setOpen(true)
                }}
                className="bg-gray-700 px-3 py-1 rounded text-sm"
              >
                Editar
              </button>

              <button
                onClick={() => setDeleteId(lesson.id)}
                className="bg-red-600 hover:bg-red-700 transition px-3 py-1 rounded text-sm text-white"
              >
                Excluir
              </button>

              <button
                onClick={() => exportPDF(lesson)}
                className="bg-blue-600 px-3 py-1 rounded text-sm"
              >
                Salvar PDF
              </button>

            </div>
          </div>
        ))}
      </div>

      {open && (
        <LessonForm
          onClose={() => {
            setOpen(false)
            setEditing(null)
          }}
          onSave={handleSave}
          initialData={editing}
        />
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-xl w-80 space-y-4">

            <h2 className="text-lg font-bold text-white">
              Confirmar exclusão
            </h2>

            <p className="text-gray-400 text-sm">
              Tem certeza que deseja excluir esta aula?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="w-full bg-gray-700 p-2 rounded"
              >
                Cancelar
              </button>

              <button
                onClick={handleDelete}
                className="w-full bg-red-600 hover:bg-red-700 p-2 rounded text-white"
              >
                Excluir
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}