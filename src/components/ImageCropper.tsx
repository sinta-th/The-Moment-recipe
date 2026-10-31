'use client'

import { useState, useCallback } from 'react'
import Cropper, { Area } from 'react-easy-crop'

interface ImageCropperProps {
  imageSrc: string
  onCropDone: (croppedBlob: Blob) => void
  onCancel: () => void
  confirmLabel: string
  cancelLabel: string
}

export default function ImageCropper({ imageSrc, onCropDone, onCancel, confirmLabel, cancelLabel }: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels)
  }, [])

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return

    const canvas = document.createElement('canvas')
    const image = new Image()
    image.crossOrigin = 'anonymous'

    await new Promise<void>((resolve) => {
      image.onload = () => resolve()
      image.src = imageSrc
    })

    canvas.width = croppedAreaPixels.width
    canvas.height = croppedAreaPixels.height
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    )

    canvas.toBlob((blob) => {
      if (blob) onCropDone(blob)
    }, 'image/jpeg', 0.9)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col">
      <div className="flex-1 relative">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
        />
      </div>

      {/* Zoom slider */}
      <div className="px-8 py-3 flex items-center gap-3 bg-black/60">
        <span className="text-white text-xs">-</span>
        <input
          type="range"
          min={1}
          max={3}
          step={0.1}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="flex-1 accent-white"
        />
        <span className="text-white text-xs">+</span>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 p-4 bg-black/60">
        <button
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl font-medium text-white border border-white/30 hover:bg-white/10 transition-colors"
        >
          {cancelLabel}
        </button>
        <button
          onClick={handleConfirm}
          className="flex-1 py-3 rounded-xl font-medium text-white bg-accent hover:bg-accent-hover transition-colors"
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  )
}
