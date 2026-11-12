import React, { useState, useRef } from "react";
import { message } from "antd";
import {
  FaFileExcel,
  FaCloudUploadAlt,
  FaDownload,
  FaTrash,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSearch,
  FaTimes,
  FaSpinner,
  FaBoxOpen,
} from "react-icons/fa";
import api from "../../api";
import {
  parseExcelFile,
  normalizeProductRow,
  buildBackendProductImportWorkbook,
  downloadProductsExcelTemplate,
} from "../../utils/excelUtils";
import "../../styles/excelUpload.css";

export default function ProductExcelUpload({ categories = [], brands = [], onUploadSuccess }) {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [rows, setRows] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [backendErrors, setBackendErrors] = useState([]);

  // Check if file is strictly .xlsx or .xls
  const validateExcelFile = (selectedFile) => {
    if (!selectedFile) return false;
    const fileName = selectedFile.name.toLowerCase();
    const isExcel = fileName.endsWith(".xlsx") || fileName.endsWith(".xls");
    if (!isExcel) {
      message.error("Only Excel files (.xlsx, .xls) are allowed.");
      return false;
    }
    return true;
  };

  const handleFileProcess = async (selectedFile) => {
    if (!validateExcelFile(selectedFile)) return;

    try {
      setIsParsing(true);
      setBackendErrors([]);
      const parsedData = await parseExcelFile(selectedFile);

      if (!parsedData.rows || parsedData.rows.length === 0) {
        message.warning("The Excel file contains no data rows.");
        return;
      }

      // Map rows with normalizeProductRow
      const normalized = parsedData.rows.map((row, idx) =>
        normalizeProductRow(row, idx, parsedData.embeddedImages || [])
      );

      setFile(selectedFile);
      setRows(normalized);
      message.success(`Loaded ${normalized.length} products from ${selectedFile.name}`);
    } catch (err) {
      console.error("Excel parse error:", err);
      message.error(err.message || "Failed to parse Excel file.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileInputChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      handleFileProcess(selected);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFileProcess(droppedFile);
    }
  };

  const handleClear = () => {
    setFile(null);
    setRows([]);
    setBackendErrors([]);
    setSearchQuery("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveRow = (rowId) => {
    setRows((prev) => prev.filter((r) => r._rowId !== rowId));
  };

  // Upload to backend
  const handleImportSubmit = async () => {
    if (!rows || rows.length === 0) {
      return message.warning("No products to import.");
    }

    const validRows = rows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      return message.error("Please fix invalid products before uploading.");
    }

    try {
      setIsUploading(true);
      setUploadProgress(25);
      setBackendErrors([]);

      // Build structured backend-compatible Excel workbook
      const structuredFile = await buildBackendProductImportWorkbook(validRows);
      setUploadProgress(50);

      const formData = new FormData();
      formData.append("file", structuredFile);

      const res = await api.post("/products/bulk-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 40) / progressEvent.total) + 50;
          setUploadProgress(Math.min(percent, 95));
        },
      });

      setUploadProgress(100);

      if (res.data?.success) {
        const count = res.data.insertedCount || validRows.length;
        message.success(`🎉 Successfully imported ${count} products to your store!`);

        // Cache products locally so they immediately appear in catalog
        try {
          const existing = JSON.parse(localStorage.getItem("importedProducts") || "[]");
          const newProducts = validRows.map((r, i) => {
            const matchedCat = categories.find(
              (c) => c.name?.toLowerCase() === r.category?.toLowerCase() || c._id === r.category
            );
            const matchedBrand = brands.find(
              (b) => b.name?.toLowerCase() === r.brand?.toLowerCase() || b._id === r.brand
            );

            return {
              _id: `excel_prod_${Date.now()}_${i}`,
              title: r.title,
              price: Number(r.price),
              discountPrice: Number(r.discountPrice || r.price),
              stock: Number(r.stock || 10),
              description: r.description,
              thumbnail: r.imagePreviewUrl || r.thumbnailUrl || "",
              images: r.thumbnailUrl ? [r.thumbnailUrl] : [],
              category: {
                _id: matchedCat?._id || "general-cat",
                name: matchedCat?.name || r.category || "General",
              },
              brand: {
                _id: matchedBrand?._id || "onecart-brand",
                name: matchedBrand?.name || r.brand || "OneCart",
              },
              rating: 4.8,
              numReviews: 14,
              createdAt: new Date().toISOString(),
            };
          });

          localStorage.setItem("importedProducts", JSON.stringify([...newProducts, ...existing]));
        } catch (storageErr) {
          console.warn("Storage sync warning:", storageErr);
        }

        if (onUploadSuccess) {
          setTimeout(onUploadSuccess, 1000);
        }
      } else {
        if (res.data?.errors && res.data.errors.length > 0) {
          setBackendErrors(res.data.errors);
        }
        message.error(res.data?.message || "Bulk product upload failed.");
      }
    } catch (err) {
      console.error("Bulk upload error:", err);
      const respData = err.response?.data;
      if (respData?.errors && respData.errors.length > 0) {
        setBackendErrors(respData.errors);
      }
      message.error(respData?.message || "Server error during Excel upload.");
    } finally {
      setIsUploading(false);
    }
  };

  const validCount = rows.filter((r) => r.isValid).length;
  const invalidCount = rows.length - validCount;

  const filteredRows = rows.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.title?.toLowerCase().includes(q) ||
      r.brand?.toLowerCase().includes(q) ||
      r.category?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="excel-upload-panel">
      {/* Template Download Bar */}
      <div className="excel-template-bar">
        <div className="excel-template-info">
          <div className="excel-template-icon">
            <FaFileExcel />
          </div>
          <div>
            <h4>Need the standard Product Excel Template?</h4>
            <p>Download our pre-structured .xlsx file with ready-to-fill sample products and image links.</p>
          </div>
        </div>
        <button
          type="button"
          className="excel-download-btn"
          onClick={downloadProductsExcelTemplate}
        >
          <FaDownload size={12} /> Download .xlsx Template
        </button>
      </div>

      {/* Drag & Drop Zone */}
      {!file ? (
        <div
          className={`excel-dropzone ${isDragging ? "dragging" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls"
            style={{ display: "none" }}
            onChange={handleFileInputChange}
          />
          <div className="excel-dropzone-icon">
            {isParsing ? <FaSpinner className="spin-icon" /> : <FaCloudUploadAlt />}
          </div>
          <h3 className="excel-dropzone-title">
            {isParsing ? "Reading Spreadsheet Data..." : "Upload Products Excel File"}
          </h3>
          <p className="excel-dropzone-subtitle">
            Drag and drop your spreadsheet here, or click to browse from computer.
          </p>
          <button
            type="button"
            className="excel-browse-btn"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            <FaFileExcel size={15} /> Select Excel Spreadsheet
          </button>
          <span className="excel-formats-chip">EXCEL ONLY (.XLSX, .XLS)</span>
        </div>
      ) : (
        /* File Active Card */
        <div className="excel-file-card">
          <div className="excel-file-left">
            <div className="excel-file-avatar">
              <FaFileExcel />
            </div>
            <div>
              <h4 className="excel-file-name">{file.name}</h4>
              <p className="excel-file-meta">
                {(file.size / 1024).toFixed(1)} KB • {rows.length} Products detected
              </p>
            </div>
          </div>
          <div className="excel-file-actions">
            <button
              type="button"
              className="excel-clear-btn"
              onClick={handleClear}
              disabled={isUploading}
            >
              <FaTimes size={12} style={{ marginRight: 4 }} /> Remove File
            </button>
          </div>
        </div>
      )}

      {/* Rows Preview & Verification */}
      {rows.length > 0 && (
        <>
          {/* Stats Bar */}
          <div className="excel-stats-strip">
            <div className="excel-stat-box">
              <span className="excel-stat-label">Total Rows</span>
              <span className="excel-stat-number">{rows.length}</span>
            </div>
            <div className="excel-stat-box valid">
              <span className="excel-stat-label">Ready to Import</span>
              <span className="excel-stat-number">{validCount}</span>
            </div>
            <div className={`excel-stat-box ${invalidCount > 0 ? "invalid" : ""}`}>
              <span className="excel-stat-label">Incomplete</span>
              <span className="excel-stat-number">{invalidCount}</span>
            </div>
          </div>

          {/* Backend error callout if any */}
          {backendErrors.length > 0 && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#991b1b", fontWeight: 700, marginBottom: 6 }}>
                <FaExclamationTriangle />
                <span>Validation Errors from Backend:</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: 20, color: "#b91c1c", fontSize: 13 }}>
                {backendErrors.map((err, idx) => (
                  <li key={idx}>
                    Row {err.row || idx + 1}: {err.message || JSON.stringify(err)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Table Header with Search */}
          <div className="excel-preview-header">
            <h3 className="excel-preview-title">
              <FaBoxOpen color="#2563eb" /> Live Product Preview ({filteredRows.length})
            </h3>
            <div className="excel-search-box">
              <FaSearch color="#94a3b8" size={13} />
              <input
                type="text"
                placeholder="Search parsed products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Scrollable Preview Table */}
          <div className="excel-table-scroll">
            <table className="excel-table">
              <thead>
                <tr>
                  <th style={{ width: 44 }}>#</th>
                  <th style={{ width: 56 }}>Image</th>
                  <th>Title & Description</th>
                  <th>Brand</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Pickup Hub</th>
                  <th>Status</th>
                  <th style={{ width: 40 }}></th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row, index) => (
                  <tr key={row._rowId} className={!row.isValid ? "has-error" : ""}>
                    <td style={{ color: "#94a3b8", fontWeight: 700 }}>{index + 1}</td>
                    <td>
                      {row.imagePreviewUrl ? (
                        <img
                          src={row.imagePreviewUrl}
                          alt={row.title}
                          className="excel-table-thumb"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="excel-thumb-placeholder">
                          <FaBoxOpen size={16} />
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="excel-table-title" title={row.title}>
                        {row.title}
                      </div>
                      <div style={{ fontSize: 11.5, color: "#64748b", maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {row.description}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: "#334155" }}>{row.brand || "—"}</span>
                    </td>
                    <td>
                      <span style={{ background: "#f1f5f9", padding: "2px 8px", borderRadius: 6, fontSize: 11.5, fontWeight: 700, color: "#475569" }}>
                        {row.category || "General"}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 800, color: "#0f172a" }}>₹{row.price}</div>
                      {row.discountPrice && row.discountPrice < row.price && (
                        <div style={{ fontSize: 11, color: "#16a34a", fontWeight: 700 }}>
                          Offer: ₹{row.discountPrice}
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{ fontWeight: 700 }}>{row.stock}</span>
                    </td>
                    <td>
                      <div style={{ fontSize: 12, color: "#475569" }}>
                        {row.pickUpaddresses?.city || "New Delhi"}, {row.pickUpaddresses?.state || "Delhi"}
                      </div>
                    </td>
                    <td>
                      {row.isValid ? (
                        <span className="excel-status-badge valid">
                          <FaCheckCircle size={10} /> Ready
                        </span>
                      ) : (
                        <span className="excel-status-badge error">
                          <FaExclamationTriangle size={10} /> {row.validationError || "Incomplete"}
                        </span>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="excel-row-del-btn"
                        title="Remove row"
                        onClick={() => handleRemoveRow(row._rowId)}
                      >
                        <FaTrash size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Import Action Bar */}
          <div className="excel-import-actions">
            <div>
              <p style={{ margin: 0, fontSize: 13.5, color: "#475569" }}>
                Ready to upload <strong>{validCount}</strong> verified products directly to your catalog.
              </p>
              {invalidCount > 0 && (
                <p style={{ margin: "2px 0 0 0", fontSize: 12, color: "#b45309" }}>
                  ⚠️ {invalidCount} rows have missing titles or prices and will be skipped.
                </p>
              )}
            </div>

            <button
              type="button"
              className="excel-import-btn"
              disabled={isUploading || validCount === 0}
              onClick={handleImportSubmit}
            >
              {isUploading ? (
                <>
                  <FaSpinner className="spin-icon" /> Uploading to Store...
                </>
              ) : (
                <>
                  <FaCloudUploadAlt size={18} /> Import {validCount} Products
                </>
              )}
            </button>
          </div>

          {/* Progress Tracker */}
          {isUploading && (
            <div className="excel-progress-wrap">
              <div className="excel-progress-bar-bg">
                <div
                  className="excel-progress-bar-fill"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <div className="excel-progress-text">
                <span>Processing Excel workbook and catalog sync...</span>
                <span>{uploadProgress}%</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
