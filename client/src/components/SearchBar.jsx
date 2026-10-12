import { useState } from "react";
import { Search } from "lucide-react";

export default function SearchBar({ onPick }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setResults([]);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Search failed.");
      if (body.length === 0) setMessage("No city found. Check the spelling and try again.");
      setResults(body);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  }

  function choose(place) {
    onPick(place);
    setResults([]);
    setMessage("");
    setQuery("");
  }

  return (
    <div className="search">
      <form onSubmit={handleSubmit} role="search">
        <Search size={18} aria-hidden="true" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a city"
          aria-label="Search a city"
        />
        <button type="submit" disabled={busy || query.trim().length < 2}>
          {busy ? "Searching" : "Search"}
        </button>
      </form>

      {(results.length > 0 || message) && (
        <ul className="results">
          {message && <li className="results-note">{message}</li>}
          {results.map((p) => (
            <li key={p.id}>
              <button type="button" onClick={() => choose(p)}>
                <strong>{p.name}</strong>
                <span>{[p.region, p.country].filter(Boolean).join(", ")}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
