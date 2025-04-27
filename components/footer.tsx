import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Facebook, Twitter, Instagram, Linkedin, Github, Mail } from "lucide-react"
import Image from "next/image"

export default function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center">
              <Image src="/masterinLogo.jpg" alt="Masterin Logo" width={40} height={40} className="h-10 w-auto" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Empowering students and educators with AI-enhanced learning experiences.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <Mail className="inline-block mr-1 h-4 w-4" /> admin@masterin.org
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-purple-600">
                <span className="sr-only">Facebook</span>
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-purple-600">
                <span className="sr-only">Twitter</span>
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-purple-600">
                <span className="sr-only">Instagram</span>
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-purple-600">
                <span className="sr-only">LinkedIn</span>
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-purple-600">
                <span className="sr-only">GitHub</span>
                <Github size={20} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">About</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600">
                  Our Mission
                </Link>
              </li>
              <li>
                <Link href="/team" className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600">
                  Our Team
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Learning</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/courses" className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600">
                  All Courses
                </Link>
              </li>
              <li>
                <Link href="/ai" className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600">
                  AI Tutor
                </Link>
              </li>
              <li>
                <Link href="/resources" className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600">
                  Learning Resources
                </Link>
              </li>
              <li>
                <Link href="/certificates" className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600">
                  Certificates
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Subscribe</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Stay updated with our latest news and offers.
            </p>
            <div className="flex space-x-2">
              <Input type="email" placeholder="Your email" className="max-w-[200px]" />
              <Button size="sm">Subscribe</Button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              &copy; {new Date().getFullYear()} Masterin. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-xs text-gray-600 dark:text-gray-400 hover:text-purple-600">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-xs text-gray-600 dark:text-gray-400 hover:text-purple-600">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-xs text-gray-600 dark:text-gray-400 hover:text-purple-600">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
