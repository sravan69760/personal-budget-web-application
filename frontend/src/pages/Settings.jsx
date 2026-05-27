import { useEffect, useState } from "react";
import api from "../api.js";

export default function Settings() {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/categories")
      .then((response) => setCategories(response.data))
      .catch(() => setError("Unable to load categories."));
  }, []);

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h2>Settings</h2>
          <p>Reference data for this local budget tracker.</p>
        </div>
      </div>
      {error ? <p className="error">{error}</p> : null}
      <section className="panel">
        <h3>Default Categories</h3>
        <div className="tag-list">
          {categories.map((category) => (
            <span key={category.id}>{category.name}</span>
          ))}
        </div>
      </section>
      <section className="panel">
        <h3>Local Storage</h3>
        <p className="settings-copy">
          Data is saved in the backend SQLite database at <code>backend/budget.sqlite</code>. Uploaded files are stored
          in <code>backend/uploads</code>.
        </p>
      </section>
    </section>
  );
}
