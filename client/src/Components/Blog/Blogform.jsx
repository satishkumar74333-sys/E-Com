import React from "react";

export function BlogForm({ blog, onSubmit, onChange }) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">title</label>
        <input
          label="Title"
          type="text"
          name="title"
          value={blog.title}
          onChange={onChange}
          placeholder="Enter an amazing title"
          required
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 
        focus:ring-blue-200 transition-all duration-200 dark:bg-[#111827]/80 bg-white/50 backdrop-blur-sm dark:text-white text-black "
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          label="Description"
          name="description"
          value={blog.description}
          onChange={onChange}
          placeholder="Write your blog post description..."
          required
          className="w-full px-4 py-3 rounded-lg border dark:bg-[#111827]/80 dark:text-white text-black  border-gray-200 focus:border-blue-500 focus:ring-2 
        focus:ring-blue-200 transition-all duration-200 min-h-[150px] bg-white/50 backdrop-blur-sm"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-medium 
      hover:opacity-90 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
      >
        Save Changes
      </button>
    </form>
  );
}
