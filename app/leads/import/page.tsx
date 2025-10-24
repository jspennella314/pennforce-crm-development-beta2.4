"use client";
import { useState } from "react";
import AppLayout from "@/app/components/AppLayout";
import { Upload, FileText, Download } from "lucide-react";

export default function LeadsImportPage() {
  const [text, setText] = useState("");
  const [res, setRes] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!text.trim()) {
      alert("Please paste CSV data");
      return;
    }

    setLoading(true);
    setRes("");

    try {
      const r = await fetch("/api/leads/import", {
        method: "POST",
        headers: { "Content-Type": "text/csv" },
        body: text,
      });
      const j = await r.json();
      setRes(JSON.stringify(j, null, 2));

      if (j.ok) {
        alert(`Import successful! Created: ${j.created}, Updated: ${j.updated}`);
      } else {
        alert(`Import failed: ${j.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Import error:', error);
      setRes(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }, null, 2));
      alert('Import failed. Please check the console for details.');
    } finally {
      setLoading(false);
    }
  }

  const sampleCSV = `firstName,lastName,email,phone,utm_source,utm_medium,utm_campaign,utm_term,utm_content
John,Doe,john.doe@example.com,+1-555-0100,facebook,cpc,spring-sale,charter,ad-1
Jane,Smith,jane.smith@example.com,+1-555-0101,google,cpc,summer-promo,private-jet,ad-2
Bob,Johnson,bob.j@example.com,+1-555-0102,linkedin,organic,,,`;

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* Page Header */}
        <div className="px-6 py-4 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Import Leads</h1>
              <p className="text-sm text-gray-600 mt-1">
                Upload leads from CSV format
              </p>
            </div>
            <button
              onClick={() => setText(sampleCSV)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              <FileText className="w-4 h-4" />
              Load Sample CSV
            </button>
          </div>
        </div>

        {/* Import Form */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Supported Columns</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Required:</strong> At least one of firstName, lastName, or email</p>
                <p><strong>Contact Info:</strong> firstName, lastName, email, phone</p>
                <p><strong>UTM Tracking:</strong> utm_source, utm_medium, utm_campaign, utm_term, utm_content</p>
              </div>
            </div>

            {/* CSV Input */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paste CSV Data
                </label>
                <textarea
                  className="w-full h-64 border border-gray-300 rounded-lg p-3 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="firstName,lastName,email,phone
John,Doe,john@example.com,555-1234
Jane,Smith,jane@example.com,555-5678"
                />
                <p className="text-xs text-gray-500 mt-2">
                  First row must contain column headers. Subsequent rows contain data.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  className="flex items-center gap-2 px-6 py-2 bg-[#0176d3] text-white rounded hover:bg-[#014486] transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={submit}
                  disabled={loading || !text.trim()}
                >
                  <Upload className="w-4 h-4" />
                  {loading ? 'Importing...' : 'Import Leads'}
                </button>
                <button
                  className="px-6 py-2 bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors text-sm font-medium"
                  onClick={() => {
                    setText("");
                    setRes("");
                  }}
                  disabled={loading}
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Results */}
            {res && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Import Results</h3>
                <pre className="text-xs bg-gray-50 p-4 border border-gray-200 rounded overflow-x-auto">
                  {res}
                </pre>
              </div>
            )}

            {/* Sample CSV Download */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Example CSV Format</h3>
              <pre className="text-xs bg-white p-3 border border-gray-200 rounded overflow-x-auto">
                {sampleCSV}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
