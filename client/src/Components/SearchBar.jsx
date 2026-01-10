import React, { useState, useEffect, useRef, useMemo } from "react";
import { useSelector } from "react-redux";

const SearchBar = ({ setQueryBarTitle, onSearch, width, TopMargin }) => {
  const [query, setQuery] = useState(setQueryBarTitle || "");
  const [show, setShow] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const products = useSelector((state) => state.product.product);
  const dropdownRef = useRef(null);
  const memoizedProducts = useMemo(() => products, [products]);

  useEffect(() => {
    setQuery(setQueryBarTitle || "");
  }, [setQueryBarTitle]);

  const fetchSuggestions = () => {
    setLoading(true);
    if (!query.trim()) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    if (!isNaN(query)) {
      const filteredSuggestions = memoizedProducts.filter(
        (product) => product.price === parseInt(query, 10)
      );
      setSuggestions(filteredSuggestions || []);
    } else {
      const regex = new RegExp(query, "i");
      const filteredSuggestions = memoizedProducts.filter((product) =>
        regex.test(product.name)
      );
      setSuggestions(filteredSuggestions || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    const debounceTimeout = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimeout);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShow(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchClick = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setShow(false);
      setSuggestions([]);
      onSearch(query.trim());
    }
  };

  return (
    <div
      className={`relative flex ${
        width || "w-full"
      } mx-auto justify-center ${TopMargin || ""}`}
    >
      <label htmlFor="defaultSearch" className="sr-only">
        Search
      </label>
      <div className={`relative ${width || "w-full sm:w-1/2"}`}>
        <form onSubmit={handleSearchClick}>
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-400 dark:text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          </div>
          <input
            type="search"
            id="defaultSearch"
            className="w-full p-4 pl-10 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg outline-none dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search..."
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShow(true)}
          />
        </form>
        <button
          type="submit"
          onClick={handleSearchClick}
          className="absolute right-2.5 bottom-2.5 bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 focus:ring-2 focus:ring-blue-500"
        >
          Search
        </button>
      </div>

      {show && query && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute w-full bg-white border rounded-lg shadow-md max-h-40 mt-14 overflow-y-auto z-10 dark:bg-gray-700 dark:text-white"
          aria-live="polite"
        >
          {loading ? (
            <div className="px-4 py-2 text-gray-500">Loading...</div>
          ) : suggestions.length === 0 ? (
            <div className="px-4 py-2 text-gray-500">No suggestions found</div>
          ) : (
            suggestions.map((suggestion) => (
              <div
                key={suggestion._id}
                className="px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer"
                onClick={() => {
                  setQuery(`${suggestion.name} under ₹${suggestion.price}`);
                  setSuggestions([]);
                  setShow(false);
                  onSearch(`${suggestion.name} under ${suggestion.price}`);
                }}
              >
                {suggestion.name} under ₹{suggestion.price}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
