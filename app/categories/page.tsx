"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CategoryExplorer from "@/components/category-explorer"
import { BookOpen, Sparkles, ChevronRight } from "lucide-react"

export default function CategoriesPage() {
  const [activeTab, setActiveTab] = useState("all")

  return (
    <main className="flex flex-col min-h-screen" id="main-content">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">Explore Our Course Categories</h1>
              <p className="text-lg md:text-xl text-blue-100 mb-8">
                Discover a world of knowledge across diverse subjects, taught by expert instructors and designed for
                effective learning
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-blue-50"
                  onClick={() => setActiveTab("trending")}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Trending Categories
                </Button>
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Browse All Courses
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold">Course Categories</h2>
              <TabsList className="grid grid-cols-2 md:grid-cols-4">
                <TabsTrigger value="all">All Categories</TabsTrigger>
                <TabsTrigger value="trending">Trending</TabsTrigger>
                <TabsTrigger value="featured">Featured</TabsTrigger>
                <TabsTrigger value="popular">Popular</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="mt-6">
              <CategoryExplorer variant="expanded" showSearch={true} showFilters={true} />
            </TabsContent>

            <TabsContent value="trending" className="mt-6">
              <CategoryExplorer
                variant="expanded"
                showSearch={true}
                showFilters={false}
                className="animate-in fade-in-50"
              />
            </TabsContent>

            <TabsContent value="featured" className="mt-6">
              <CategoryExplorer
                variant="featured"
                showSearch={false}
                showFilters={false}
                className="animate-in fade-in-50"
              />
            </TabsContent>

            <TabsContent value="popular" className="mt-6">
              <CategoryExplorer
                variant="expanded"
                showSearch={true}
                showFilters={false}
                className="animate-in fade-in-50"
              />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Category Benefits */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Why Explore Our Categories?</h2>
            <p className="text-gray-600">
              Our carefully curated categories make it easy to find exactly what you're looking for and discover new
              areas of interest
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white p-6 rounded-lg shadow-sm border"
            >
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Curated Content</h3>
              <p className="text-gray-600">
                Each category features hand-picked courses selected by experts in the field to ensure quality and
                relevance
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white p-6 rounded-lg shadow-sm border"
            >
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Diverse Learning Paths</h3>
              <p className="text-gray-600">
                Explore multiple related topics within each category to build comprehensive skills and knowledge
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white p-6 rounded-lg shadow-sm border"
            >
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Stay Current</h3>
              <p className="text-gray-600">
                Our trending categories highlight the most in-demand skills so you can stay ahead of industry trends
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Start Learning?</h2>
            <p className="text-blue-100 mb-8">
              Join thousands of students already learning on our platform. Find your perfect course and start your
              learning journey today.
            </p>
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
              Browse All Courses <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
