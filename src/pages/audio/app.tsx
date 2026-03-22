import { useEffect, useRef, useState } from "react"
import { supabase } from "../../services/supabase"
import { UploadModal } from "../../components/uploads/UploadModal"

type Audio = {
  id: string
  title: string
  date: string
  month: string
  audio_url: string
  user_name: string
}

export function Audios() {
  const user = JSON.parse(localStorage.getItem("user") || "{}")

  const [audios, setAudios] = useState<Audio[]>([])
  const [openModal, setOpenModal] = useState(false)
  const [search, setSearch] = useState("")

  const [playingId, setPlayingId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const getMonthName = (date: string) => {
    return new Date(date).toLocaleString("pt-BR", {
      month: "long",
      year: "numeric",
    })
  }

  const handleUpload = async (file: File, title: string, date: string) => {
    const fileName = `${Date.now()}-${file.name}`

    await supabase.storage.from("audio").upload(fileName, file)

    const { data } = supabase.storage
      .from("audio")
      .getPublicUrl(fileName)

    await supabase.from("audios").insert({
      title,
      date,
      month: getMonthName(date),
      audio_url: data.publicUrl,
      user_name: user.name,
    })

    setOpenModal(false)
    fetchAudios()
  }

  const handleDelete = async (audio: Audio) => {
    if (audio.user_name !== user.name) return

    await supabase.from("audios").delete().eq("id", audio.id)
    fetchAudios()
  }

  const fetchAudios = async () => {
    const { data } = await supabase
      .from("audios")
      .select("*")
      .order("date", { ascending: false })

    if (data) setAudios(data)
  }

  useEffect(() => {
    fetchAudios()
  }, [])

  const filtered = audios.filter((audio) =>
    audio.title.toLowerCase().includes(search.toLowerCase())
  )

  const grouped = filtered.reduce((acc: any, audio) => {
    if (!acc[audio.month]) acc[audio.month] = []
    acc[audio.month].push(audio)
    return acc
  }, {})

  const handlePlay = (audio: Audio) => {
    if (playingId === audio.id) {
      audioRef.current?.pause()
      setPlayingId(null)
      return
    }

    if (audioRef.current) {
      audioRef.current.pause()
    }

    const newAudio = new Audio(audio.audio_url)
    audioRef.current = newAudio

    newAudio.play()
    setPlayingId(audio.id)

    newAudio.onended = () => setPlayingId(null)
  }

  const handleRestart = (audio: Audio) => {
    if (audioRef.current && playingId === audio.id) {
      audioRef.current.currentTime = 0
      audioRef.current.play()
      return
    }

    if (audioRef.current) {
      audioRef.current.pause()
    }

    const newAudio = new Audio(audio.audio_url)
    audioRef.current = newAudio

    newAudio.play()
    setPlayingId(audio.id)

    newAudio.onended = () => setPlayingId(null)
  }

  return (
    <div className="p-4 space-y-6">

      <input
        placeholder="Buscar áudios..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-3 bg-gray-800 rounded-xl text-white"
      />

      <button
        onClick={() => setOpenModal(true)}
        className="fixed bottom-6 right-6 bg-blue-600 w-14 h-14 cursor-pointer rounded-full text-2xl shadow-lg"
      >
        +
      </button>

      {Object.keys(grouped).map((month) => (
        <div key={month}>
          <h2 className="text-lg font-bold mb-3">{month}</h2>

          {/* 📱 MOBILE (cards) */}
          <div className="flex flex-col gap-3 md:hidden">
            {grouped[month].map((audio: Audio) => (
              <div
                key={audio.id}
                className="bg-gray-800 p-4 rounded-xl space-y-2"
              >
                <div>
                  <p className="text-white font-semibold">{audio.title}</p>
                  <p className="text-gray-400 text-sm">{audio.date}</p>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => handlePlay(audio)}
                    className="bg-blue-600 px-3 py-1 rounded text-xs"
                  >
                    {playingId === audio.id ? "Pausar" : "Tocar"}
                  </button>

                  <button
                    onClick={() => handleRestart(audio)}
                    className="bg-gray-700 px-3 py-1 rounded text-xs"
                  >
                    Reiniciar
                  </button>

                  {audio.user_name === user.name && (
                    <button
                      onClick={() => handleDelete(audio)}
                      className="text-red-400 text-xs"
                    >
                      Excluir
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 text-sm border-b border-gray-700">
                  <th className="p-3">Título</th>
                  <th className="p-3">Data</th>
                  <th className="p-3">Ação</th>
                  <th className="p-3"></th>
                </tr>
              </thead>

              <tbody>
                {grouped[month].map((audio: Audio) => (
                  <tr
                    key={audio.id}
                    className="border-b border-gray-800 hover:bg-gray-800/50"
                  >
                    <td className="p-3 text-white">{audio.title}</td>
                    <td className="p-3 text-gray-400">{audio.date}</td>

                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePlay(audio)}
                          className="bg-blue-600 px-3 py-1 rounded text-xs"
                        >
                          {playingId === audio.id ? "Pausar" : "Tocar"}
                        </button>

                        <button
                          onClick={() => handleRestart(audio)}
                          className="bg-gray-700 px-3 py-1 rounded text-xs"
                        >
                          Reiniciar
                        </button>
                      </div>
                    </td>

                    <td className="p-3">
                      {audio.user_name === user.name && (
                        <button
                          onClick={() => handleDelete(audio)}
                          className="text-red-400 text-sm cursor-pointer"
                        >
                          Excluir
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      <UploadModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        type="audio"
        onUpload={(file, title, date) => handleUpload(file, title, date)}
      />
    </div>
  )
}