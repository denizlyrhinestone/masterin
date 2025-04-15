"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"

export default function HeroAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      const devicePixelRatio = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()

      canvas.width = rect.width * devicePixelRatio
      canvas.height = rect.height * devicePixelRatio

      ctx.scale(devicePixelRatio, devicePixelRatio)
    }

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)

    // Create particles
    const particlesArray: Particle[] = []
    const numberOfParticles = 50
    const colors = ["#3B82F6", "#8B5CF6", "#EC4899", "#10B981", "#F59E0B", "#6366F1"]

    class Particle {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      color: string
      opacity: number

      constructor() {
        this.x = (Math.random() * canvas.width) / devicePixelRatio
        this.y = (Math.random() * canvas.height) / devicePixelRatio
        this.size = Math.random() * 6 + 1
        this.speedX = Math.random() * 1.5 - 0.75
        this.speedY = Math.random() * 1.5 - 0.75
        this.color = colors[Math.floor(Math.random() * colors.length)]
        this.opacity = Math.random() * 0.5 + 0.5
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY

        if (this.x > canvas.width / devicePixelRatio) this.x = 0
        if (this.x < 0) this.x = canvas.width / devicePixelRatio
        if (this.y > canvas.height / devicePixelRatio) this.y = 0
        if (this.y < 0) this.y = canvas.height / devicePixelRatio
      }

      draw() {
        ctx.globalAlpha = this.opacity
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
      }
    }

    function init() {
      for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle())
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw connections
      for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
          const dx = particlesArray[a].x - particlesArray[b].x
          const dy = particlesArray[a].y - particlesArray[b].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 120) {
            const opacity = 0.3 - distance / 400
            ctx.strokeStyle = `rgba(100, 100, 255, ${opacity})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(particlesArray[a].x, particlesArray[a].y)
            ctx.lineTo(particlesArray[b].x, particlesArray[b].y)
            ctx.stroke()
          }
        }
      }

      // Update and draw particles
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update()
        particlesArray[i].draw()
      }

      requestAnimationFrame(animate)
    }

    init()
    animate()

    return () => {
      window.removeEventListener("resize", setCanvasDimensions)
    }
  }, [])

  return (
    <div className="relative aspect-video w-full bg-white">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ width: "100%", height: "100%" }} />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-24 h-24 md:w-32 md:h-32 bg-white/80 rounded-full p-2 backdrop-blur-sm shadow-lg">
          <Image
            src="/placeholder.svg?height=128&width=128&text=LearnWise"
            alt="LearnWise Logo"
            width={128}
            height={128}
            className="object-contain"
            crossOrigin="anonymous"
          />
        </div>
      </div>
    </div>
  )
}
