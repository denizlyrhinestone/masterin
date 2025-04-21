export function StatisticsSection() {
  return (
    <section className="bg-emerald-700 py-16 text-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-10 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Transforming Education</h2>
          <p className="mx-auto max-w-2xl text-lg text-emerald-100">
            Join thousands of students and educators already benefiting from our platform.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="text-center">
            <div className="mb-2 text-4xl font-bold lg:text-5xl">10,000+</div>
            <div className="text-emerald-100">Active Students</div>
          </div>
          <div className="text-center">
            <div className="mb-2 text-4xl font-bold lg:text-5xl">500+</div>
            <div className="text-emerald-100">Verified Educators</div>
          </div>
          <div className="text-center">
            <div className="mb-2 text-4xl font-bold lg:text-5xl">1,200+</div>
            <div className="text-emerald-100">Courses Available</div>
          </div>
          <div className="text-center">
            <div className="mb-2 text-4xl font-bold lg:text-5xl">95%</div>
            <div className="text-emerald-100">Satisfaction Rate</div>
          </div>
        </div>
      </div>
    </section>
  )
}
