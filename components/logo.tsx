import Image from "next/image"
import Link from "next/link"

interface LogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
  showText?: boolean
}

export function Logo({ className = "", size = "md", showText = true }: LogoProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  }

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  }

  return (
    <Link href="/" className={`flex items-center space-x-2 ${className}`}>
      <div className={`${sizeClasses[size]} relative`}>
        <Image src="/masterinFavicon.png" alt="Masterin Logo" fill className="object-contain" priority />
      </div>
      {showText && <span className={`font-bold text-gray-900 dark:text-white ${textSizeClasses[size]}`}>Masterin</span>}
    </Link>
  )
}
