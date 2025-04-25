"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Paintbrush, Eraser, Trash2, Send, X, Circle, Square, Minus, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DrawingCanvasProps {
  onSend: (imageData: string) => void
  onClose: () => void
}

type DrawingTool = "brush" | "eraser"
type ShapeType = "freehand" | "line" | "circle" | "rectangle"

export default function DrawingCanvas({ onSend, onClose }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState("#000000")
  const [brushSize, setBrushSize] = useState(5)
  const [tool, setTool] = useState<DrawingTool>("brush")
  const [shape, setShape] = useState<ShapeType>("freehand")
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null)

  // Store drawing history for undo functionality
  const [history, setHistory] = useState<ImageData[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  // Available colors
  const colors = [
    "#000000",
    "#ffffff",
    "#ff0000",
    "#00ff00",
    "#0000ff",
    "#ffff00",
    "#ff00ff",
    "#00ffff",
    "#ff9900",
    "#9900ff",
  ]

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Set canvas size to match container
    const resizeCanvas = () => {
      const container = canvas.parentElement
      if (container) {
        canvas.width = container.clientWidth
        canvas.height = container.clientHeight
      }
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Get context
    const context = canvas.getContext("2d")
    if (context) {
      context.lineCap = "round"
      context.lineJoin = "round"
      setCtx(context)

      // Initialize with white background
      context.fillStyle = "#ffffff"
      context.fillRect(0, 0, canvas.width, canvas.height)

      // Save initial state to history
      saveToHistory(context)
    }

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  // Save current canvas state to history
  const saveToHistory = (context: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Get current canvas state
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)

    // If we're not at the end of the history, remove future states
    if (historyIndex < history.length - 1) {
      setHistory(history.slice(0, historyIndex + 1))
    }

    // Add current state to history
    setHistory((prev) => [...prev, imageData])
    setHistoryIndex((prev) => prev + 1)
  }

  // Undo last action
  const handleUndo = () => {
    if (historyIndex <= 0 || !ctx || !canvasRef.current) return

    setHistoryIndex((prev) => prev - 1)
    const newIndex = historyIndex - 1

    if (newIndex >= 0) {
      ctx.putImageData(history[newIndex], 0, 0)
    }
  }

  // Redo last undone action
  const handleRedo = () => {
    if (historyIndex >= history.length - 1 || !ctx || !canvasRef.current) return

    const newIndex = historyIndex + 1
    setHistoryIndex(newIndex)
    ctx.putImageData(history[newIndex], 0, 0)
  }

  // Start drawing
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!ctx || !canvasRef.current) return

    setIsDrawing(true)

    // Get coordinates
    const { x, y } = getCoordinates(e)

    if (shape === "freehand") {
      ctx.beginPath()
      ctx.moveTo(x, y)
    } else {
      // For shapes, store the starting point
      setStartPoint({ x, y })
    }
  }

  // Draw
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !ctx || !canvasRef.current) return

    // Get coordinates
    const { x, y } = getCoordinates(e)

    // Set drawing properties
    ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color
    ctx.lineWidth = brushSize

    if (shape === "freehand") {
      // Freehand drawing
      ctx.lineTo(x, y)
      ctx.stroke()
    } else if (startPoint) {
      // For shapes, we need to redraw on the canvas each time
      // First, restore the canvas to its state before starting the shape
      if (historyIndex >= 0) {
        ctx.putImageData(history[historyIndex], 0, 0)
      }

      // Then draw the shape
      ctx.beginPath()
      ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color
      ctx.lineWidth = brushSize

      if (shape === "line") {
        ctx.moveTo(startPoint.x, startPoint.y)
        ctx.lineTo(x, y)
      } else if (shape === "circle") {
        const radius = Math.sqrt(Math.pow(x - startPoint.x, 2) + Math.pow(y - startPoint.y, 2))
        ctx.arc(startPoint.x, startPoint.y, radius, 0, 2 * Math.PI)
      } else if (shape === "rectangle") {
        ctx.rect(startPoint.x, startPoint.y, x - startPoint.x, y - startPoint.y)
      }

      ctx.stroke()
    }
  }

  // Stop drawing
  const stopDrawing = () => {
    if (!isDrawing || !ctx) return

    if (shape !== "freehand" && startPoint) {
      // For shapes, we've already drawn the final shape in the draw function
      setStartPoint(null)
    }

    ctx.closePath()
    setIsDrawing(false)

    // Save the current state to history
    saveToHistory(ctx)
  }

  // Helper to get coordinates from mouse or touch event
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    let x, y

    if ("touches" in e) {
      // Touch event
      const rect = canvas.getBoundingClientRect()
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      // Mouse event
      x = e.nativeEvent.offsetX
      y = e.nativeEvent.offsetY
    }

    return { x, y }
  }

  // Clear canvas
  const clearCanvas = () => {
    if (!ctx || !canvasRef.current) return

    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)

    // Save the cleared state to history
    saveToHistory(ctx)
  }

  // Send drawing
  const sendDrawing = () => {
    if (!canvasRef.current) return

    const imageData = canvasRef.current.toDataURL("image/png")
    onSend(imageData)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-2 border-b">
        <div className="text-lg font-semibold">Drawing Canvas</div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 relative overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full cursor-crosshair touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>

      <div className="p-2 border-t bg-gray-50 dark:bg-gray-800">
        <div className="flex flex-wrap gap-2 mb-2">
          {/* Drawing tools */}
          <Button
            variant={tool === "brush" ? "default" : "outline"}
            size="icon"
            onClick={() => setTool("brush")}
            title="Brush"
          >
            <Paintbrush className="h-4 w-4" />
          </Button>
          <Button
            variant={tool === "eraser" ? "default" : "outline"}
            size="icon"
            onClick={() => setTool("eraser")}
            title="Eraser"
          >
            <Eraser className="h-4 w-4" />
          </Button>

          {/* Shape selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                {shape === "freehand" && <Paintbrush className="h-4 w-4" />}
                {shape === "line" && <Minus className="h-4 w-4" />}
                {shape === "circle" && <Circle className="h-4 w-4" />}
                {shape === "rectangle" && <Square className="h-4 w-4" />}
                <ChevronDown className="h-3 w-3 absolute bottom-0.5 right-0.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuRadioGroup value={shape} onValueChange={(value) => setShape(value as ShapeType)}>
                <DropdownMenuRadioItem value="freehand">
                  <Paintbrush className="h-4 w-4 mr-2" /> Freehand
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="line">
                  <Minus className="h-4 w-4 mr-2" /> Line
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="circle">
                  <Circle className="h-4 w-4 mr-2" /> Circle
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="rectangle">
                  <Square className="h-4 w-4 mr-2" /> Rectangle
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Undo/Redo */}
          <Button variant="outline" size="icon" onClick={handleUndo} disabled={historyIndex <= 0} title="Undo">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M7.59 11.58c-2.5 0-4.58-1.92-4.58-4.29 0-2.37 2.08-4.3 4.58-4.3 2.51 0 4.58 1.93 4.58 4.3 0 2.37-2.07 4.3-4.58 4.3zm.33-1.26c1.98 0 3.26-1.37 3.26-3.03 0-1.66-1.28-3.03-3.26-3.03-1.98 0-3.26 1.37-3.26 3.03 0 1.66 1.28 3.03 3.26 3.03z"
                fill="currentColor"
              />
              <path
                d="M3.5 6.5l-3-3m0 0l3-3m-3 3h11"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            title="Redo"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ transform: "scaleX(-1)" }}
            >
              <path
                d="M7.59 11.58c-2.5 0-4.58-1.92-4.58-4.29 0-2.37 2.08-4.3 4.58-4.3 2.51 0 4.58 1.93 4.58 4.3 0 2.37-2.07 4.3-4.58 4.3zm.33-1.26c1.98 0 3.26-1.37 3.26-3.03 0-1.66-1.28-3.03-3.26-3.03-1.98 0-3.26 1.37-3.26 3.03 0 1.66 1.28 3.03 3.26 3.03z"
                fill="currentColor"
              />
              <path
                d="M3.5 6.5l-3-3m0 0l3-3m-3 3h11"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Button>

          {/* Clear canvas */}
          <Button variant="outline" size="icon" onClick={clearCanvas} title="Clear">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-4 mb-2">
          {/* Color picker */}
          <div className="flex gap-1">
            {colors.map((c) => (
              <button
                key={c}
                className={`w-6 h-6 rounded-full ${color === c ? "ring-2 ring-offset-2 ring-blue-500" : ""}`}
                style={{ backgroundColor: c, border: c === "#ffffff" ? "1px solid #ccc" : "none" }}
                onClick={() => setColor(c)}
                title={c}
              />
            ))}
          </div>

          {/* Brush size */}
          <div className="flex items-center gap-2 flex-1">
            <span className="text-xs">Size:</span>
            <Slider
              value={[brushSize]}
              min={1}
              max={30}
              step={1}
              onValueChange={(value) => setBrushSize(value[0])}
              className="w-24"
            />
            <span className="text-xs">{brushSize}px</span>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={sendDrawing}>
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}
