"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Camera, ImagePlus, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CropModal } from "@/components/profile/crop-modal"
import { updateMyProfile } from "@/lib/profile"
import { updatePrivacySettings } from "@/lib/privacy"
import { uploadImage } from "@/lib/upload-image"
import { getSubscriptionStatus } from "@/lib/subscription"

const BANNER_SUPPORTER_MESSAGE = "Profile banners are a supporter perk. Upgrade to use one."

function initial(username: string) {
  return username.charAt(0).toUpperCase()
}

export function EditProfileModal({
  username,
  initialImageUrl,
  initialBannerUrl,
  initialBio,
  initialBirthDate,
  initialLocation,
  initialWebsite,
  initialShowAge,
}: {
  username: string
  initialImageUrl: string | null
  initialBannerUrl: string | null
  initialBio: string | null
  initialBirthDate: string | null
  initialLocation: string | null
  initialWebsite: string | null
  initialShowAge: boolean
}) {
  const [open, setOpen] = useState(false)
  const [bio, setBio] = useState(initialBio ?? "")
  const [birthDate, setBirthDate] = useState(initialBirthDate ?? "")
  const [location, setLocation] = useState(initialLocation ?? "")
  const [website, setWebsite] = useState(initialWebsite ?? "")
  const [showAge, setShowAge] = useState(initialShowAge)

  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState(initialImageUrl)
  const [avatarBlob, setAvatarBlob] = useState<Blob | null>(null)
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const [bannerPreviewUrl, setBannerPreviewUrl] = useState(initialBannerUrl)
  const [bannerBlob, setBannerBlob] = useState<Blob | null>(null)
  const [pendingBannerFile, setPendingBannerFile] = useState<File | null>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  const [isSupporter, setIsSupporter] = useState<boolean | null>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    getSubscriptionStatus().then((status) => setIsSupporter(status.supporter)).catch(() => {})
  }, [])

  function resetFields() {
    setBio(initialBio ?? "")
    setBirthDate(initialBirthDate ?? "")
    setLocation(initialLocation ?? "")
    setWebsite(initialWebsite ?? "")
    setShowAge(initialShowAge)
    setAvatarBlob(null)
    setAvatarPreviewUrl((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev)
      return initialImageUrl
    })
    setBannerBlob(null)
    setBannerPreviewUrl((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev)
      return initialBannerUrl
    })
    setError(null)
  }

  function startEditing() {
    resetFields()
    setOpen(true)
  }

  function closeAndReset() {
    resetFields()
    setOpen(false)
  }

  function handleAvatarFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    setPendingAvatarFile(file)
  }

  function handleAvatarCropConfirm(blob: Blob) {
    setPendingAvatarFile(null)
    setAvatarBlob(blob)
    setAvatarPreviewUrl((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev)
      return URL.createObjectURL(blob)
    })
  }

  function handleBannerClick() {
    if (isSupporter === false) {
      setError(BANNER_SUPPORTER_MESSAGE)
      return
    }
    bannerInputRef.current?.click()
  }

  function handleBannerFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    if (file.type === "image/gif") {
      setError("Animated GIF banners are not supported.")
      return
    }
    setPendingBannerFile(file)
  }

  function handleBannerCropConfirm(blob: Blob) {
    setPendingBannerFile(null)
    setBannerBlob(blob)
    setBannerPreviewUrl((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev)
      return URL.createObjectURL(blob)
    })
  }

  function handleSave() {
    if (isPending || !birthDate) return
    setError(null)
    startTransition(async () => {
      try {
        const fields: Parameters<typeof updateMyProfile>[0] = {
          bio: bio.trim(),
          birthDate,
          location: location.trim(),
          website: website.trim(),
        }
        if (avatarBlob) fields.imageUrl = await uploadImage(avatarBlob, "avatar")
        if (bannerBlob) fields.bannerUrl = await uploadImage(bannerBlob, "banner")

        const tasks: Promise<unknown>[] = [updateMyProfile(fields)]
        if (showAge !== initialShowAge) {
          tasks.push(updatePrivacySettings({ showAge }))
        }
        await Promise.all(tasks)
        setOpen(false)
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't save, try again")
      }
    })
  }

  return (
    <>
      <Button type="button" variant="outline" onClick={startEditing}>
        <Pencil className="h-3.5 w-3.5" />
        Edit profile
      </Button>

      <Dialog open={open} onOpenChange={(next) => !next && closeAndReset()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
          </DialogHeader>

          <div className="relative -mx-6 -mt-2 mb-12">
            <button
              type="button"
              onClick={handleBannerClick}
              disabled={isPending}
              className="group relative flex aspect-[6/1] w-full items-center justify-center overflow-hidden rounded-[28px] bg-muted"
              title={bannerPreviewUrl ? "Change banner" : "Add banner"}
            >
              {bannerPreviewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={bannerPreviewUrl} alt="" className="h-full w-full object-cover" />
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
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleBannerFileChange}
            />

            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={isPending}
              className="group absolute left-1/2 -bottom-12 flex h-24 w-24 -translate-x-1/2 items-center justify-center overflow-hidden rounded-full bg-primary text-[34px] font-medium font-display text-primary-foreground ring-4 ring-background"
              title="Change avatar"
            >
              {avatarPreviewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarPreviewUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                initial(username)
              )}
              <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 bg-[rgba(0,0,0,0.5)]">
                <Camera className="h-5 w-5 text-white" />
              </span>
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarFileChange}
            />

            {error && (
              <p className="absolute inset-x-3 top-2 z-20 rounded-md bg-black/60 px-2 py-1 text-center text-[11px] font-medium text-white">
                {error}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-profile-bio">Bio</Label>
              <Textarea
                id="edit-profile-bio"
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                rows={3}
                maxLength={255}
                placeholder="Tell people a bit about yourself"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-profile-birthdate">Date of birth</Label>
              <Input
                id="edit-profile-birthdate"
                type="date"
                value={birthDate}
                onChange={(event) => setBirthDate(event.target.value)}
                required
              />
              <div className="flex items-center justify-between pt-1">
                <span className="text-[13px] text-muted-foreground">Show my age on my public profile</span>
                <Switch checked={showAge} onCheckedChange={setShowAge} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-profile-location">Location</Label>
              <Input
                id="edit-profile-location"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Optional"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-profile-website">Website</Label>
              <Input
                id="edit-profile-website"
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
                placeholder="Optional"
              />
            </div>

            {error && (
              <span className="text-xs font-medium text-destructive">{error}</span>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeAndReset} disabled={isPending}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} disabled={isPending || !birthDate}>
              {isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {pendingAvatarFile && (
        <CropModal
          file={pendingAvatarFile}
          title="Crop avatar"
          description="Drag to reposition, use the slider to zoom."
          frameWidth={320}
          frameHeight={320}
          exportWidth={256}
          exportHeight={256}
          rounded="rounded-full"
          onCancel={() => setPendingAvatarFile(null)}
          onConfirm={handleAvatarCropConfirm}
        />
      )}
      {pendingBannerFile && (
        <CropModal
          file={pendingBannerFile}
          title="Crop banner"
          description="Drag to reposition, use the slider to zoom."
          frameWidth={480}
          frameHeight={80}
          exportWidth={1440}
          exportHeight={240}
          rounded="rounded-[28px]"
          onCancel={() => setPendingBannerFile(null)}
          onConfirm={handleBannerCropConfirm}
        />
      )}
    </>
  )
}
