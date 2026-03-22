import { useState } from "react"

type Props = {
  open: boolean
  onClose: () => void
  onUpload: (file: File, title: string, date: string) => Promise<void>
  type: "image" | "video" | "audio"
}

export function UploadModal({ open, onClose, onUpload, type }: Props) {
  const getToday = () => new Date().toISOString().split("T")[0]

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState("")
  const [title, setTitle] = useState("")
  const [date, setDate] = useState(getToday())
  const [loading, setLoading] = useState(false)

  if (!open) return null

  const acceptTypes = {
    image: "image/*",
    video: "video/*",
    audio: "audio/*",
  }

  const labels = {
    image: "Selecionar imagem",
    video: "Selecionar vídeo",
    audio: "Selecionar áudio (MP3)",
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end md:items-center justify-center">
      <div className="bg-gray-900 w-full md:w-96 p-5 rounded-t-2xl md:rounded-2xl space-y-4">

        <h2 className="text-lg font-bold">Adicionar {type}</h2>

        {/* PREVIEW */}
        {preview ? (
          type === "image" ? (
            <img src={preview} className="w-full h-40 object-cover rounded" />
          ) : type === "video" ? (
            <video src={preview} controls className="w-full h-40 rounded" />
          ) : (
            <audio src={preview} controls className="w-full" />
          )
        ) : (
          <label className="w-full cursor-pointer mb-2">
            <div className="bg-gray-800 border border-gray-700 p-4 rounded-xl text-center hover:bg-gray-700 transition">
              <p className="text-sm text-gray-300">
                {labels[type]}
              </p>

              {type === "audio" && (
                <p className="text-xs text-gray-500 mt-1">
                  Apenas arquivos MP3
                </p>
              )}
            </div>

            <input
              type="file"
              accept={acceptTypes[type]}
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (!f) return

                if (type === "audio" && f.type !== "audio/mpeg") {
                  alert("Apenas arquivos MP3 são permitidos")
                  return
                }

                setFile(f)
                setPreview(URL.createObjectURL(f))
              }}
            />
          </label>
        )}

        <input
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 bg-gray-800 rounded mt-4"
        />

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-3 bg-gray-800 rounded"
        />

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => {
              if (!loading) onClose()
            }}
            className={`w-full p-3 rounded-lg transition ${
              loading
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            Cancelar
          </button>

          <button
            disabled={loading}
            onClick={async () => {
              if (!file || loading) return

              setLoading(true)

              try {
                await onUpload(file, title, date)

                setFile(null)
                setPreview("")
                setTitle("")
                setDate(getToday())
              } finally {
                setLoading(false)
              }
            }}
            className={`w-full p-3 rounded-lg font-semibold transition ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Enviando..." : "Enviar"}
          </button>
        </div>
      </div>
    </div>
  )
}