import Link from "next/link"
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Sparkles } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-900 py-12 text-gray-300">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Masterin</h3>
            <p className="mb-4">Transforming education through technology and expert guidance.</p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-400 transition-colors duration-200 hover:text-emerald-500">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-gray-400 transition-colors duration-200 hover:text-emerald-500">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-gray-400 transition-colors duration-200 hover:text-emerald-500">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-gray-400 transition-colors duration-200 hover:text-emerald-500">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
              <Link href="#" className="text-gray-400 transition-colors duration-200 hover:text-emerald-500">
                <Youtube className="h-5 w-5" />
                <span className="sr-only">YouTube</span>
              </Link>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/courses" className="transition-colors duration-200 hover:text-emerald-500">
                  Courses
                </Link>
              </li>
              <li>
                <Link href="/educators" className="transition-colors duration-200 hover:text-emerald-500">
                  Educators
                </Link>
              </li>
              <li>
                <Link
                  href="/ai-tutor"
                  className="flex items-center text-emerald-400 transition-colors duration-200 hover:text-emerald-300"
                >
                  <Sparkles className="mr-1 h-3 w-3" />
                  AI Tutor
                  <span className="ml-1 rounded-full bg-emerald-800 px-1.5 py-0.5 text-xs font-medium text-emerald-200">
                    New
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/community" className="transition-colors duration-200 hover:text-emerald-500">
                  Community
                </Link>
              </li>
              <li>
                <Link href="/about" className="transition-colors duration-200 hover:text-emerald-500">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/blog" className="transition-colors duration-200 hover:text-emerald-500">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/help" className="transition-colors duration-200 hover:text-emerald-500">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/faq" className="transition-colors duration-200 hover:text-emerald-500">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/testimonials" className="transition-colors duration-200 hover:text-emerald-500">
                  Testimonials
                </Link>
              </li>
              <li>
                <Link href="/careers" className="transition-colors duration-200 hover:text-emerald-500">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Contact</h3>
            <ul className="space-y-2">
              <li>Email: info@masterin.edu</li>
              <li>Phone: +1 (555) 123-4567</li>
              <li>
                <Link href="/contact" className="transition-colors duration-200 hover:text-emerald-500">
                  Contact Form
                </Link>
              </li>
              <li>
                <Link href="/support" className="transition-colors duration-200 hover:text-emerald-500">
                  Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-800 pt-8 text-center">
          <p>&copy; {new Date().getFullYear()} Masterin. All rights reserved.</p>
          <div className="mt-2 flex justify-center space-x-4 text-sm">
            <Link href="/terms" className="transition-colors duration-200 hover:text-emerald-500">
              Terms of Service
            </Link>
            <Link href="/privacy" className="transition-colors duration-200 hover:text-emerald-500">
              Privacy Policy
            </Link>
            <Link href="/cookies" className="transition-colors duration-200 hover:text-emerald-500">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
