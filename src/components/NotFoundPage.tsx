import React from "react";
import { Link } from "react-router-dom";
import { Translate } from "@biqpod/app/ui/components";

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex justify-center items-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 min-h-screen">
      <div className="w-full max-w-lg text-center">
        {/* Animated 404 */}
        <div className="relative mb-8">
          <div className="bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 font-bold text-transparent text-8xl md:text-9xl animate-pulse">
            404
          </div>
          <div className="absolute inset-0 font-bold text-indigo-200 text-8xl md:text-9xl animate-bounce">
            404
          </div>
        </div>

        {/* Floating Elements */}
        <div className="relative mb-8 overflow-hidden">
          <div className="top-0 left-1/4 absolute bg-indigo-300 rounded-full w-4 h-4 animate-float-slow"></div>
          <div className="top-8 right-1/4 absolute bg-purple-300 rounded-full w-3 h-3 animate-float-medium"></div>
          <div className="bottom-0 left-1/3 absolute bg-pink-300 rounded-full w-2 h-2 animate-float-fast"></div>

          {/* Main Illustration */}
          <div className="z-10 relative">
            <div className="relative mx-auto mb-6 w-32 h-32">
              {/* Magnifying Glass */}
              <div className="absolute inset-0 rotate-12 animate-swing transform">
                <div className="relative border-4 border-indigo-400 rounded-full w-20 h-20">
                  <div className="-right-2 -bottom-2 absolute bg-indigo-400 rounded-full w-8 h-1 rotate-45 transform"></div>
                </div>
              </div>

              {/* Question Mark */}
              <div className="top-6 right-6 absolute text-purple-400 text-4xl animate-bounce-slow">
                ?
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-4 mb-8">
          <h1 className="font-bold text-gray-800 text-3xl md:text-4xl animate-fade-in">
            <Translate content="page not found" />
          </h1>
          <p className="text-gray-600 text-lg animate-fade-in-delayed">
            <Translate content="oops! the page you're looking for doesn't exist" />
          </p>
          <p className="text-gray-500 text-sm animate-fade-in-delayed-2">
            <Translate content="it might have been moved, deleted, or you entered the wrong url" />
          </p>
        </div>

        {/* Action Buttons */}
        <div className="sm:flex sm:justify-center sm:space-x-4 space-y-4 sm:space-y-0 animate-slide-up">
          <Link
            to="/"
            className="group inline-flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg hover:shadow-xl px-6 py-3 rounded-lg font-semibold text-white hover:scale-105 transition-all duration-300 transform"
          >
            <svg
              className="mr-2 w-5 h-5 group-hover:animate-pulse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <Translate content="go home" />
          </Link>

          <button
            onClick={() => window.history.back()}
            className="group inline-flex items-center bg-white shadow-md hover:shadow-lg px-6 py-3 border-2 border-gray-300 hover:border-indigo-300 rounded-lg font-semibold text-gray-700 hover:scale-105 transition-all duration-300 transform"
          >
            <svg
              className="mr-2 w-5 h-5 group-hover:animate-pulse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <Translate content="go back" />
          </button>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-gray-200 border-t animate-fade-in-delayed-3">
          <p className="mb-4 text-gray-500 text-sm">
            <Translate content="looking for something specific?" />
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link
              to="/search"
              className="text-indigo-600 hover:text-indigo-800 hover:underline transition-colors duration-200"
            >
              <Translate content="search" />
            </Link>
            <Link
              to="/products"
              className="text-indigo-600 hover:text-indigo-800 hover:underline transition-colors duration-200"
            >
              <Translate content="products" />
            </Link>
            <Link
              to="/brands"
              className="text-indigo-600 hover:text-indigo-800 hover:underline transition-colors duration-200"
            >
              <Translate content="brands" />
            </Link>
            <Link
              to="/contact-us"
              className="text-indigo-600 hover:text-indigo-800 hover:underline transition-colors duration-200"
            >
              <Translate content="contact us" />
            </Link>
          </div>
        </div>
      </div>

      {/* Background Animation Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="top-1/4 left-0 absolute bg-gradient-to-r from-indigo-100 to-transparent opacity-70 blur-xl rounded-full w-64 h-64 animate-blob mix-blend-multiply filter"></div>
        <div className="top-1/3 right-0 absolute bg-gradient-to-l from-purple-100 to-transparent opacity-70 blur-xl rounded-full w-64 h-64 animate-blob animation-delay-2000 mix-blend-multiply filter"></div>
        <div className="bottom-1/4 left-1/2 absolute bg-gradient-to-t from-pink-100 to-transparent opacity-70 blur-xl rounded-full w-64 h-64 -translate-x-1/2 animate-blob animation-delay-4000 transform mix-blend-multiply filter"></div>
      </div>
    </div>
  );
};

export default NotFoundPage;
