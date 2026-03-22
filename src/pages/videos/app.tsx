import { useEffect, useState } from "react"
import { supabase } from "../../services/supabase"
import { UploadModal } from "../../components/uploads/UploadModal"

type Video = {
  id: string
  title: string
  date: string
  month: string
  video_url: string
  user_name: string
}

export function Videos() {
  const user = JSON.parse(localStorage.getItem("user") || "{}")

  const [videos, setVideos] = useState<Video[]>([])
  const [openModal, setOpenModal] = useState(false)

  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [search, setSearch] = useState("")

  const getMonthName = (date: string) => {
    return new Date(date).toLocaleString("pt-BR", {
      month: "long",
      year: "numeric",
    })
  }

  const handleUpload = async (file: File, title: string, date: string) => {
    if (!file || !title || !date) return

    const fileName = `${Date.now()}-${file.name}`

    const { error } = await supabase.storage
      .from("videos")
      .upload(fileName, file)

    if (error) {
      console.error(error.message)
      return
    }

    const { data } = supabase.storage
      .from("videos")
      .getPublicUrl(fileName)

    await supabase.from("videos").insert({
      title,
      date,
      month: getMonthName(date),
      video_url: data.publicUrl,
      user_name: user.name,
    })

    setOpenModal(false)
    fetchVideos()
  }

  const handleDelete = async (video: Video) => {
    if (video.user_name !== user.name) return

    await supabase.from("videos").delete().eq("id", video.id)
    fetchVideos()
  }

  const fetchVideos = async () => {
    const { data } = await supabase
      .from("videos")
      .select("*")
      .order("date", { ascending: false })

    if (data) setVideos(data)
  }

  useEffect(() => {
    fetchVideos()
  }, [])

  const filtered = videos.filter((video) =>
    video.title.toLowerCase().includes(search.toLowerCase())
  )

  const grouped = filtered.reduce((acc: any, video) => {
    if (!acc[video.month]) acc[video.month] = []
    acc[video.month].push(video)
    return acc
  }, {})

  return (
    <div className="p-4 space-y-6">

      <input
        placeholder="Buscar vídeos..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-3 bg-gray-800 rounded-xl text-white"
      />

      <button
        onClick={() => setOpenModal(true)}
        className="fixed bottom-6 right-6 bg-blue-600 w-14 h-14 rounded-full text-2xl cursor-pointer"
      >
        +
      </button>

      {Object.keys(grouped).map((month) => (
        <div key={month}>
          <h2 className="text-lg font-bold mb-3">{month}</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {grouped[month].map((video: Video) => (
              <div key={video.id} className="relative group">

                <video
                  src={video.video_url}
                  onClick={() => setSelectedVideo(video)}
                  className="w-full h-40 object-cover rounded-xl cursor-pointer"
                />

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition rounded-xl flex flex-col justify-end p-2 pointer-events-none">
                  <p className="text-sm">{video.title}</p>
                  <p className="text-xs text-gray-300">{video.date}</p>

                  {video.user_name === user.name && (
                    <button
                      onClick={() => handleDelete(video)}
                      className="text-red-400 text-xs pointer-events-auto cursor-pointer"
                    >
                      Excluir
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {selectedVideo && (
        <div
          className="fixed inset-0 bg-black flex items-center justify-center z-50"
          onClick={() => setSelectedVideo(null)}
        >
          <video
            src={selectedVideo.video_url}
            controls
            autoPlay
            className="max-w-full max-h-full"
          />
        </div>
      )}

      <UploadModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        type="video"
        onUpload={(file, title, date) => handleUpload(file, title, date)}
      />
    </div>
  )
}