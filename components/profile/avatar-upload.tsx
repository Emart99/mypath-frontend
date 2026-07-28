"use client"

import { useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Camera } from "lucide-react"
import { updateMyProfile } from "@/lib/profile"
import { uploadImage } from "@/lib/upload-image"
import { CropModal } from "@/components/profile/crop-modal"

function initial(username: string) {
  return username.charAt(0).toUpperCase()
}

export function AvatarUpload({ username, imageUrl }: { username: string; imageUrl: string | null }) {
  const [preview, setPreview] = useState(imageUrl)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  function uploadAvatar(blob: Blob) {
    startTransition(async () => {
      try {
        const publicUrl = await uploadImage(blob, "avatar")
        await updateMyProfile({ imageUrl: publicUrl })
        setPreview(publicUrl)
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed, try again")
      }
    })
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    setError(null)
    setPendingFile(file)
  }

  function handleCropConfirm(blob: Blob) {
    setPendingFile(null)
    uploadAvatar(blob)
  }

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
        className="group relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-primary text-[34px] font-medium font-display text-primary-foreground ring-4 ring-background"
        title="Change avatar"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="h-full w-full object-cover" />
        ) : (
          initial(username)
        )}
        <span
          className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 bg-[rgba(0,0,0,0.5)]"
        >
          <Camera className="h-5 w-5 text-white" />
        </span>
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      {error && (
        <span
          className="absolute left-0 top-full mt-1 max-w-[220px] text-[11px] font-medium text-destructive"
        >
          {error}
        </span>
      )}
      {pendingFile && (
        <CropModal
          file={pendingFile}
          title="Crop avatar"
          description="Drag to reposition, use the slider to zoom."
          frameWidth={320}
          frameHeight={320}
          exportWidth={256}
          exportHeight={256}
          rounded="rounded-full"
          onCancel={() => setPendingFile(null)}
          onConfirm={handleCropConfirm}
        />
      )}
    </div>
  )
}
