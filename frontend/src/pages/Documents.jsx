import { useEffect, useState } from "react";
import api, { fileUrl } from "../api.js";
import DocumentUploadForm from "../components/DocumentUploadForm.jsx";
import DataTable from "../components/DataTable.jsx";
import { money } from "../helpers.js";

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [creditCards, setCreditCards] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDocuments() {
    setLoading(true);
    setError("");
    try {
      const [documentsResponse, categoriesResponse, creditCardsResponse, bankAccountsResponse] = await Promise.all([
        api.get("/documents"),
        api.get("/categories"),
        api.get("/credit-cards"),
        api.get("/banks")
      ]);
      setDocuments(documentsResponse.data);
      setCategories(categoriesResponse.data);
      setCreditCards(creditCardsResponse.data);
      setBankAccounts(bankAccountsResponse.data);
    } catch (err) {
      setError("Unable to load documents.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDocuments();
  }, []);

  async function uploadDocument(data) {
    await api.post("/documents/upload", data, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    loadDocuments();
  }

  async function deleteDocument(id) {
    await api.delete(`/documents/${id}`);
    loadDocuments();
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h2>Documents</h2>
          <p>Upload bills and spending receipts so amounts update your budget.</p>
        </div>
      </div>
      {error ? <p className="error">{error}</p> : null}
      <section className="panel">
        <h3>Upload Bill Or Spend</h3>
        <DocumentUploadForm
          categories={categories}
          creditCards={creditCards}
          bankAccounts={bankAccounts}
          onSubmit={uploadDocument}
        />
      </section>
      <section className="panel">
        {loading ? (
          <p className="notice">Loading documents...</p>
        ) : (
          <DataTable
            columns={[
              { key: "title", label: "Title" },
              { key: "vendor", label: "Vendor" },
              { key: "category", label: "Category" },
              { key: "document_type", label: "Type" },
              { key: "due_date", label: "Date" },
              { key: "amount", label: "Amount", render: (row) => money(row.amount) },
              { key: "status", label: "Status" },
              {
                key: "file_path",
                label: "File",
                render: (row) => (
                  <div className="link-group">
                    <a href={fileUrl(row.file_path)} target="_blank" rel="noreferrer">
                      View
                    </a>
                    <a href={fileUrl(row.file_path)} download>
                      Download
                    </a>
                  </div>
                )
              }
            ]}
            rows={documents}
            actions={(row) => (
              <button className="small danger-button" onClick={() => deleteDocument(row.id)}>
                Delete
              </button>
            )}
          />
        )}
      </section>
    </section>
  );
}
