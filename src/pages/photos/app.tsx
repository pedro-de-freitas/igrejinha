import { useEffect, useState } from "react"
import { supabase } from "../../services/supabase"
import { UploadModal } from "../../components/uploads/UploadModal"

type Photo = {
  id: string
  title: string
  date: string
  month: string
  image_url: string
  user_name: string
}

export function Fotos() {
  const user = JSON.parse(localStorage.getItem("user") || "{}")

  const [photos, setPhotos] = useState<Photo[]>([])
  const [openModal, setOpenModal] = useState(false)

  const [selectedImage, setSelectedImage] = useState<Photo | null>(null)
  const [search, setSearch] = useState("")

  const getMonthName = (date: string) => {
    return new Date(date).toLocaleString("pt-BR", {
      month: "long",
      year: "numeric",
    })
  }

  // 🔥 NOVO HANDLE
  const handleUpload = async (file: File, title: string, date: string) => {
    if (!file || !title || !date) return

    const fileName = `${Date.now()}-${file.name}`

    const { error: uploadError } = await supabase.storage
      .from("photos")
      .upload(fileName, file)

    if (uploadError) return

    const { data } = supabase.storage
      .from("photos")
      .getPublicUrl(fileName)

    const { error: insertError } = await supabase.from("photos").insert({
      title,
      date,
      month: getMonthName(date),
      image_url: data.publicUrl,
      user_name: user.name,
    })

    if (insertError) return

    setOpenModal(false)
    fetchPhotos()
  }

  const handleDelete = async (photo: Photo) => {
    if (photo.user_name !== user.name) return

    await supabase.from("photos").delete().eq("id", photo.id)
    fetchPhotos()
  }

  const fetchPhotos = async () => {
    const { data } = await supabase
      .from("photos")
      .select("*")
      .order("date", { ascending: false })

    if (data) setPhotos(data)
  }

  useEffect(() => {
    fetchPhotos()
  }, [])

  const filteredPhotos = photos.filter((photo) =>
    photo.title.toLowerCase().includes(search.toLowerCase())
  )

  const grouped = filteredPhotos.reduce((acc: any, photo) => {
    if (!acc[photo.month]) acc[photo.month] = []
    acc[photo.month].push(photo)
    return acc
  }, {})

  return (
    <div className="p-4 space-y-6">

      <input
        placeholder="Buscar fotos..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-3 bg-gray-800 rounded-xl text-white outline-none"
      />

      <button
        onClick={() => setOpenModal(true)}
        className="fixed bottom-6 right-6 bg-blue-600 w-14 h-14 rounded-full text-2xl cursor-pointer shadow-lg hover:bg-blue-700"
      >
        +
      </button>

      {Object.keys(grouped).map((month) => (
        <div key={month}>
          <h2 className="text-lg font-bold mb-3">{month}</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {grouped[month].map((photo: Photo) => (
              <div key={photo.id} className="relative group">
                
                <img
                  src={photo.image_url}
                  onClick={() => setSelectedImage(photo)}
                  className="w-full h-40 object-cover rounded-xl cursor-pointer"
                />

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition rounded-xl flex flex-col justify-end p-2 pointer-events-none">
                  <p className="text-sm">{photo.title}</p>
                  <p className="text-xs text-gray-300">{photo.date}</p>

                  {photo.user_name === user.name && (
                    <button
                      onClick={() => handleDelete(photo)}
                      className="text-red-400 text-xs mt-1 cursor-pointer pointer-events-auto"
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

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage.image_url}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}

      <UploadModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        type="image"
        onUpload={(file, title, date) => handleUpload(file, title, date)}
      />
    </div>
  )
}