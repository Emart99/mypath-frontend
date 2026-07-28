"use client"

import { useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ImagePlus } from "lucide-react"
import { updateMyProfile } from "@/lib/profile"
import { uploadImage } from "@/lib/upload-image"
import { CropModal } from "@/components/profile/crop-modal"

export function BannerUpload({ bannerUrl }: { bannerUrl: string | null }) {
  const [preview, setPreview] = useState(bannerUrl)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    setError(null)
    setPendingFile(file)
  }

  function handleCropConfirm(blob: Blob) {
    setPendingFile(null)
    startTransition(async () => {
      try {
        const publicUrl = await uploadImage(blob, "banner")
        await updateMyProfile({ bannerUrl: publicUrl })
        setPreview(publicUrl)
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed, try again")
      }
    })
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
        className="group relative flex aspect-[6/1] w-full items-center justify-center overflow-hidden rounded-[28px] bg-muted"
        title={preview ? "Change banner" : "Add banner"}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <ImagePlus className="h-4 w-4" />
            Add banner
          </span>
        )}
        <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 bg-[rgba(0,0,0,0.5)]">
          <ImagePlus className="h-5 w-5 text-white" />
        </span>
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      {error && <p className="mt-1 text-[11px] font-medium text-destructive">{error}</p>}
      {pendingFile && (
        <CropModal
          file={pendingFile}
          title="Crop banner"
          description="Drag to reposition, use the slider to zoom."
          frameWidth={480}
          frameHeight={80}
          exportWidth={1440}
          exportHeight={240}
          rounded="rounded-[28px]"
          onCancel={() => setPendingFile(null)}
          onConfirm={handleCropConfirm}
        />
      )}
    </div>
  )
}
