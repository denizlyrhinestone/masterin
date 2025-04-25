"use client"

import type React from "react"

import { useRef, useState, useEffect, useCallback } from "react"
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

// Minimum dimensions to ensure canvas is never invalid
const MIN_CANVAS_WIDTH = 300
const MIN_CANVAS_HEIGHT = 200

export default function DrawingCanvas({ onSend, onClose }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState("#000000")
  const [brushSize, setBrushSize] = useState(5)
  const [tool, setTool] = useState<DrawingTool>("brush")
  const [shape, setShape] = useState<ShapeType>("freehand")
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null)
  const [canvasInitialized, setCanvasInitialized] = useState(false)
  const [canvasDimensions, setCanvasDimensions] = useState({ width: MIN_CANVAS_WIDTH, height: MIN_CANVAS_HEIGHT })
  const [initializationAttempts, setInitializationAttempts] = useState(0)
  const [canvasError, setCanvasError] = useState<string | null>(null)
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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

  // Verify canvas is in a valid state
  const verifyCanvasState = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return false

    // Check if canvas dimensions are valid
    if (canvas.width <= 0 || canvas.height <= 0) {
      console.warn("Canvas has invalid dimensions", { width: canvas.width, height: canvas.height })
      return false
    }

    // Check if context is available
    const context = canvas.getContext("2d")
    if (!context) {
      console.warn("Canvas context is not available")
      return false
    }

    return true
  }, [])

  // Initialize canvas with guaranteed valid dimensions
  const initializeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      console.error("Canvas element not found during initialization")
      return false
    }

    try {
      // Always set to minimum dimensions first to ensure canvas is valid
      canvas.width = Math.max(MIN_CANVAS_WIDTH, canvasDimensions.width)
      canvas.height = Math.max(MIN_CANVAS_HEIGHT, canvasDimensions.height)

      // Get context
      const context = canvas.getContext("2d")
      if (!context) {
        console.error("Failed to get canvas context during initialization")
        return false
      }

      // Set context properties
      context.lineCap = "round"
      context.lineJoin = "round"
      setCtx(context)

      // Initialize with white background
      context.fillStyle = "#ffffff"
      context.fillRect(0, 0, canvas.width, canvas.height)

      console.log("Canvas initialized successfully", {
        width: canvas.width,
        height: canvas.height,
        context: !!context,
      })

      return true
    } catch (error) {
      console.error("Error during canvas initialization:", error)
      setCanvasError(`Initialization error: ${error instanceof Error ? error.message : "Unknown error"}`)
      return false
    }
  }, [canvasDimensions.width, canvasDimensions.height])

  // Effect for initial canvas setup with retry mechanism
  useEffect(() => {
    // Maximum number of initialization attempts
    const MAX_ATTEMPTS = 3

    if (initializationAttempts >= MAX_ATTEMPTS) {
      console.error(`Failed to initialize canvas after ${MAX_ATTEMPTS} attempts`)
      setCanvasError(`Failed to initialize canvas after ${MAX_ATTEMPTS} attempts`)
      return
    }

    const initTimer = setTimeout(
      () => {
        const success = initializeCanvas()

        if (!success) {
          // Retry initialization with incremented attempt counter
          setInitializationAttempts((prev) => prev + 1)
          return
        }

        // Delay the resize to ensure the container is rendered
        const resizeTimer = setTimeout(() => {
          resizeCanvas()

          // Verify canvas state after resize
          if (verifyCanvasState()) {
            setCanvasInitialized(true)
            console.log("Canvas fully initialized and ready")
          } else {
            // If verification fails, retry initialization
            console.warn("Canvas verification failed after resize, retrying...")
            setInitializationAttempts((prev) => prev + 1)
          }
        }, 300) // Increased timeout for better reliability

        return () => clearTimeout(resizeTimer)
      },
      100 * (initializationAttempts + 1),
    ) // Increasing delay for each retry

    return () => clearTimeout(initTimer)
  }, [initializeCanvas, verifyCanvasState, initializationAttempts])

  // Effect to save initial state after canvas is properly sized
  useEffect(() => {
    if (canvasInitialized && ctx && canvasRef.current) {
      // Verify canvas has valid dimensions before saving initial state
      const canvas = canvasRef.current
      if (canvas.width > 0 && canvas.height > 0) {
        try {
          // Save initial state to history
          saveToHistory(ctx)
          console.log("Initial canvas state saved to history")
        } catch (error) {
          console.error("Error saving initial canvas state:", error)
          setCanvasError(`Error saving initial state: ${error instanceof Error ? error.message : "Unknown error"}`)
        }
      } else {
        console.warn("Cannot save initial state: Canvas has invalid dimensions", {
          width: canvas.width,
          height: canvas.height,
        })
      }
    }
  }, [canvasInitialized, ctx])

  // Debounced resize handler
  const debouncedResize = useCallback(() => {
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current)
    }

    resizeTimeoutRef.current = setTimeout(() => {
      if (canvasInitialized) {
        resizeCanvas()
      }
    }, 150) // Debounce delay
  }, [canvasInitialized])

  // Separate effect for resizing with improved event handling
  useEffect(() => {
    const handleResize = () => debouncedResize()

    const handleOrientationChange = () => {
      // For orientation changes, we use a longer delay
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current)
      }

      // First immediate resize to prevent blank canvas
      resizeCanvas()

      // Then a delayed resize to adjust after orientation change completes
      resizeTimeoutRef.current = setTimeout(() => {
        resizeCanvas()
        // Verify canvas state after orientation change
        if (!verifyCanvasState()) {
          console.warn("Canvas verification failed after orientation change, attempting recovery")
          recoverCanvas()
        }
      }, 500)
    }

    window.addEventListener("resize", handleResize)
    window.addEventListener("orientationchange", handleOrientationChange)

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("orientationchange", handleOrientationChange)

      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current)
      }
    }
  }, [canvasInitialized, debouncedResize, verifyCanvasState])

  // Canvas recovery function
  const recoverCanvas = useCallback(() => {
    console.log("Attempting canvas recovery")
    const canvas = canvasRef.current
    if (!canvas || !ctx) return false

    try {
      // Re-initialize with minimum dimensions
      canvas.width = MIN_CANVAS_WIDTH
      canvas.height = MIN_CANVAS_HEIGHT

      // Restore context properties
      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      // Fill with white background
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Try to restore from history if available
      if (historyIndex >= 0 && history[historyIndex]) {
        try {
          // Only restore if the history dimensions are valid
          const historyData = history[historyIndex]
          if (historyData.width > 0 && historyData.height > 0) {
            // Create a temporary canvas to scale the history data if needed
            const tempCanvas = document.createElement("canvas")
            tempCanvas.width = historyData.width
            tempCanvas.height = historyData.height
            const tempCtx = tempCanvas.getContext("2d")

            if (tempCtx) {
              tempCtx.putImageData(historyData, 0, 0)

              // Draw the scaled image to our main canvas
              ctx.drawImage(tempCanvas, 0, 0, historyData.width, historyData.height, 0, 0, canvas.width, canvas.height)
            }
          }
        } catch (e) {
          console.error("Error restoring history during recovery:", e)
          // Continue with recovery even if history restoration fails
        }
      }

      // Force a resize to get proper dimensions
      setTimeout(() => {
        resizeCanvas()
      }, 100)

      console.log("Canvas recovery completed")
      setCanvasError(null)
      return true
    } catch (error) {
      console.error("Canvas recovery failed:", error)
      setCanvasError(`Recovery failed: ${error instanceof Error ? error.message : "Unknown error"}`)
      return false
    }
  }, [ctx, history, historyIndex])

  // Resize canvas function with improved error handling and validation
  const resizeCanvas = () => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container || !ctx) {
      console.warn("Cannot resize: Missing canvas, container, or context")
      return
    }

    try {
      // Get container dimensions, ensuring they're valid
      const rect = container.getBoundingClientRect()
      const containerWidth = Math.max(MIN_CANVAS_WIDTH, Math.floor(rect.width))
      const containerHeight = Math.max(MIN_CANVAS_HEIGHT, Math.floor(rect.height))

      console.log("Resizing canvas", { containerWidth, containerHeight })

      // Get current image data (if any)
      let imageData: ImageData | null = null
      try {
        if (canvas.width > 0 && canvas.height > 0) {
          imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        }
      } catch (e) {
        console.error("Error getting image data during resize:", e)
      }

      // Set canvas size to match container with minimum dimensions
      const newWidth = Math.max(MIN_CANVAS_WIDTH, containerWidth)
      const newHeight = Math.max(MIN_CANVAS_HEIGHT, containerHeight)

      // Update state to track dimensions
      setCanvasDimensions({ width: newWidth, height: newHeight })

      // Set canvas dimensions
      canvas.width = newWidth
      canvas.height = newHeight

      // Restore context properties
      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      // Restore the image if we had one
      if (imageData) {
        try {
          // Fill with white first
          ctx.fillStyle = "#ffffff"
          ctx.fillRect(0, 0, canvas.width, canvas.height)

          // Draw the previous image centered
          const x = Math.max(0, (canvas.width - imageData.width) / 2)
          const y = Math.max(0, (canvas.height - imageData.height) / 2)
          ctx.putImageData(imageData, x, y)
        } catch (e) {
          console.error("Error restoring image data after resize:", e)

          // If restoration fails, at least ensure we have a white background
          ctx.fillStyle = "#ffffff"
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        }
      } else {
        // If no previous image, just fill with white
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      // Clear any previous error state
      setCanvasError(null)
    } catch (error) {
      console.error("Error during canvas resize:", error)
      setCanvasError(`Resize error: ${error instanceof Error ? error.message : "Unknown error"}`)

      // Attempt recovery
      recoverCanvas()
    }
  }

  // Save current canvas state to history with improved validation
  const saveToHistory = (context: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Ensure canvas has valid dimensions
    if (canvas.width <= 0 || canvas.height <= 0) {
      console.warn("Cannot save history: Canvas has invalid dimensions", {
        width: canvas.width,
        height: canvas.height,
      })
      return
    }

    try {
      // Get current canvas state
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)

      // If we're not at the end of the history, remove future states
      if (historyIndex < history.length - 1) {
        setHistory(history.slice(0, historyIndex + 1))
      }

      // Add current state to history
      setHistory((prev) => [...prev, imageData])
      setHistoryIndex((prev) => prev + 1)
    } catch (error) {
      console.error("Error saving canvas state to history:", error)
      setCanvasError(`History error: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  // Undo last action with improved error handling
  const handleUndo = () => {
    if (historyIndex <= 0 || !ctx || !canvasRef.current) return

    try {
      const canvas = canvasRef.current
      // Verify canvas has valid dimensions
      if (canvas.width <= 0 || canvas.height <= 0) {
        console.warn("Cannot undo: Canvas has invalid dimensions", {
          width: canvas.width,
          height: canvas.height,
        })
        return
      }

      setHistoryIndex((prev) => prev - 1)
      const newIndex = historyIndex - 1

      if (newIndex >= 0 && history[newIndex]) {
        ctx.putImageData(history[newIndex], 0, 0)
      }
    } catch (error) {
      console.error("Error during undo operation:", error)
      setCanvasError(`Undo error: ${error instanceof Error ? error.message : "Unknown error"}`)

      // Attempt recovery
      recoverCanvas()
    }
  }

  // Redo last undone action with improved error handling
  const handleRedo = () => {
    if (historyIndex >= history.length - 1 || !ctx || !canvasRef.current) return

    try {
      const canvas = canvasRef.current
      // Verify canvas has valid dimensions
      if (canvas.width <= 0 || canvas.height <= 0) {
        console.warn("Cannot redo: Canvas has invalid dimensions", {
          width: canvas.width,
          height: canvas.height,
        })
        return
      }

      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      if (history[newIndex]) {
        ctx.putImageData(history[newIndex], 0, 0)
      }
    } catch (error) {
      console.error("Error during redo operation:", error)
      setCanvasError(`Redo error: ${error instanceof Error ? error.message : "Unknown error"}`)

      // Attempt recovery
      recoverCanvas()
    }
  }

  // Start drawing with validation
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!ctx || !canvasRef.current) return

    // Verify canvas state before drawing
    if (!verifyCanvasState()) {
      console.warn("Cannot start drawing: Canvas in invalid state")
      recoverCanvas()
      return
    }

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

  // Draw with validation
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !ctx || !canvasRef.current) return

    // Verify canvas state during drawing
    if (!verifyCanvasState()) {
      console.warn("Cannot continue drawing: Canvas in invalid state")
      stopDrawing()
      recoverCanvas()
      return
    }

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
      try {
        const canvas = canvasRef.current
        // Verify canvas has valid dimensions
        if (canvas.width <= 0 || canvas.height <= 0) {
          console.warn("Cannot draw shape: Canvas has invalid dimensions", {
            width: canvas.width,
            height: canvas.height,
          })
          return
        }

        // For shapes, we need to redraw on the canvas each time
        // First, restore the canvas to its state before starting the shape
        if (historyIndex >= 0 && history[historyIndex]) {
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
      } catch (error) {
        console.error("Error during shape drawing:", error)
        setCanvasError(`Drawing error: ${error instanceof Error ? error.message : "Unknown error"}`)
        stopDrawing()
        recoverCanvas()
      }
    }
  }

  // Stop drawing with validation
  const stopDrawing = () => {
    if (!isDrawing || !ctx) return

    if (shape !== "freehand" && startPoint) {
      // For shapes, we've already drawn the final shape in the draw function
      setStartPoint(null)
    }

    ctx.closePath()
    setIsDrawing(false)

    // Save the current state to history if canvas is valid
    if (verifyCanvasState()) {
      saveToHistory(ctx)
    } else {
      console.warn("Cannot save drawing state: Canvas in invalid state")
      recoverCanvas()
    }
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

  // Clear canvas with validation
  const clearCanvas = () => {
    if (!ctx || !canvasRef.current) return

    try {
      const canvas = canvasRef.current
      // Verify canvas has valid dimensions
      if (canvas.width <= 0 || canvas.height <= 0) {
        console.warn("Cannot clear canvas: Canvas has invalid dimensions", {
          width: canvas.width,
          height: canvas.height,
        })
        recoverCanvas()
        return
      }

      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Save the cleared state to history
      saveToHistory(ctx)
    } catch (error) {
      console.error("Error clearing canvas:", error)
      setCanvasError(`Clear error: ${error instanceof Error ? error.message : "Unknown error"}`)
      recoverCanvas()
    }
  }

  // Send drawing with improved error handling and validation
  const sendDrawing = () => {
    if (!canvasRef.current) return

    try {
      const canvas = canvasRef.current
      // Verify canvas has valid dimensions
      if (canvas.width <= 0 || canvas.height <= 0) {
        console.warn("Cannot send drawing: Canvas has invalid dimensions", {
          width: canvas.width,
          height: canvas.height,
        })

        // Attempt recovery before sending
        if (recoverCanvas()) {
          // Retry sending after recovery
          setTimeout(() => sendDrawing(), 100)
        } else {
          // Fallback to closing without sending if recovery fails
          onClose()
        }
        return
      }

      const imageData = canvas.toDataURL("image/png")
      onSend(imageData)
    } catch (error) {
      console.error("Error sending drawing:", error)
      setCanvasError(`Send error: ${error instanceof Error ? error.message : "Unknown error"}`)
      // Provide fallback or error message
      onClose()
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-2 border-b">
        <div className="text-lg font-semibold">Drawing Canvas</div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {canvasError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative" role="alert">
          <span className="block sm:inline">{canvasError}</span>
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-0 right-0 mt-1 mr-1"
            onClick={() => {
              setCanvasError(null)
              recoverCanvas()
            }}
          >
            Retry
          </Button>
        </div>
      )}

      <div
        className="flex-1 relative overflow-hidden"
        ref={containerRef}
        style={{ minHeight: MIN_CANVAS_HEIGHT }}
        data-testid="drawing-container"
      >
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
          data-testid="drawing-canvas"
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
