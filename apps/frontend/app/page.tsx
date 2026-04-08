"use client";

import Link from "next/link";

export default function Page() {
  return (
    <div className="min-h-screen bg-[#111111] text-white">

      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-5 border-b border-gray-800">
        <h1 className="text-xl font-bold">Drawit</h1>

        <div className="flex gap-6 items-center">
          <Link href="/signin" className="hover:text-gray-300">
            Sign In
          </Link>
          <Link
            href="/signup"
            className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-200 transition"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-24 gap-6">

        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
          Build Ideas <br /> Faster Than Ever
        </h1>

        <p className="text-gray-400 max-w-xl">
          A modern platform to create, collaborate, and launch projects
          quickly. Simple, fast, and powerful.
        </p>

        <div className="flex gap-4 mt-4">
          <Link
            href="/signup"
            className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
          >
            Start Free
          </Link>

          <button className="border border-gray-500 px-6 py-3 rounded-lg hover:bg-gray-800 transition">
            Learn More
          </button>
        </div>

      </section>

      {/* Features */}
      <section className="px-8 py-20 grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">

        <div className="bg-[#1a1a1a] p-6 rounded-xl hover:scale-105 transition">
          <h3 className="text-xl font-semibold mb-2">Fast Development</h3>
          <p className="text-gray-400">
            Build and deploy applications quickly with modern tools.
          </p>
        </div>

        <div className="bg-[#1a1a1a] p-6 rounded-xl hover:scale-105 transition">
          <h3 className="text-xl font-semibold mb-2">Secure</h3>
          <p className="text-gray-400">
            Authentication and protected APIs with JWT security.
          </p>
        </div>

        <div className="bg-[#1a1a1a] p-6 rounded-xl hover:scale-105 transition">
          <h3 className="text-xl font-semibold mb-2">Scalable</h3>
          <p className="text-gray-400">
            Designed to grow with your product and team.
          </p>
        </div>

      </section>

      {/* CTA Section */}
      <section className="text-center py-20 border-t border-gray-800">

        <h2 className="text-3xl font-bold mb-4">
          Ready to build something amazing?
        </h2>

        <p className="text-gray-400 mb-6">
          Join thousands of developers already using our platform.
        </p>

        <Link
          href="/signup"
          className="bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
        >
          Create Your Account
        </Link>

      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-500 border-t border-gray-800">
        © 2026 Drawit. All rights reserved.
      </footer>

    </div>
  );
}