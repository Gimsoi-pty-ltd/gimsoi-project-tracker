import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboardStore } from "../../store/dashboardStore";
import { resourceAPI } from "../../api/api";
import ImportButton from "../../Components/Buttons/ImportButton";
import ExportButton from "../../Components/Buttons/exportButton";


const USER_CSV_HEADERS = ["email", "fullName", "role", "password"];
const USER_ROLES = new Set(["ADMIN", "PM", "INTERN", "CLIENT"]);

const parseCsv = (text) => {
  const rows = [];
  let row = [];
  let field = "";
  let insideQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '"') {
      if (insideQuotes && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (character === "," && !insideQuotes) {
      row.push(field);
      field = "";
    } else if ((character === "\n" || character === "\r") && !insideQuotes) {
      row.push(field);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      field = "";
      if (character === "\r" && text[index + 1] === "\n") index += 1;
    } else {
      field += character;
    }
  }

  if (insideQuotes) throw new Error("The CSV contains an unclosed quoted field.");
  row.push(field);
  if (row.some((value) => value.trim())) rows.push(row);
  return rows;
};

const SectionCard = ({ section }) => {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(section.route)}
      className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group"
    >
      {/* Content - Centered */}
      <h3 className="text-xl font-semibold text-gray-800 mb-2 text-center">{section.label}</h3>
      <p className="text-gray-600 text-sm mb-6 text-center">{section.description}</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {section.stats.map((stat, idx) => (
          <div key={idx} className="text-center">
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Action Button */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          navigate(section.route);
        }}
        className="w-full py-2 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        Manage {section.label} →
      </button>
    </div>
  );
};

export default function UserManagement() {
  const { activities, isLoading, error, fetchOverview, getCounts } = useDashboardStore((state) => state);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const handleImport = async (file) => {
    setImporting(true);
    setImportResult(null);

    try {
      const rows = parseCsv((await file.text()).replace(/^\uFEFF/, ""));
      if (rows.length < 2) throw new Error("The CSV must include a header row and at least one user.");
      if (rows.length > 101) throw new Error("Import is limited to 100 users per file.");

      const headers = rows[0].map((header) => header.trim());
      const headerIndexes = Object.fromEntries(
        USER_CSV_HEADERS.map((header) => [header, headers.indexOf(header)]),
      );
      const missingHeaders = USER_CSV_HEADERS.filter((header) => headerIndexes[header] < 0);
      if (missingHeaders.length) {
        throw new Error(`Missing required CSV columns: ${missingHeaders.join(", ")}.`);
      }

      let created = 0;
      const failedRows = [];

      for (const [index, values] of rows.slice(1).entries()) {
        const rowNumber = index + 2;
        const user = {
          email: (values[headerIndexes.email] ?? "").trim(),
          fullName: (values[headerIndexes.fullName] ?? "").trim(),
          role: (values[headerIndexes.role] ?? "").trim().toUpperCase(),
          password: values[headerIndexes.password] ?? "",
        };
        let validationError = "";

        if (!user.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
          validationError = "Invalid email";
        } else if (!user.fullName) {
          validationError = "Full name is required";
        } else if (!USER_ROLES.has(user.role)) {
          validationError = "Role must be ADMIN, PM, INTERN, or CLIENT";
        } else if (user.password.length < 8) {
          validationError = "Password must be at least 8 characters";
        }

        if (validationError) {
          failedRows.push({ row: rowNumber, message: validationError });
          continue;
        }

        try {
          await resourceAPI.post("/users", user);
          created += 1;
        } catch (requestError) {
          failedRows.push({
            row: rowNumber,
            message: requestError.response?.data?.message || "Could not create user",
          });
        }
      }

      setImportResult({ created, failedRows });
      if (created > 0) await fetchOverview();
    } catch (importError) {
      setImportResult({ error: importError.message || "Could not read this CSV file." });
    } finally {
      setImporting(false);
    }
  };

  const downloadCsvTemplate = () => {
    const blob = new Blob([`${USER_CSV_HEADERS.join(",")}\n`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "users_import_template.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    const users = [];
    let cursor = null;

    do {
      const params = new URLSearchParams({ limit: "100" });
      if (cursor) params.set("cursor", cursor);
      const response = await resourceAPI.get(`/users?${params.toString()}`);
      const page = response.data?.data;
      if (!Array.isArray(page)) throw new Error("The users response was not in the expected format.");
      users.push(...page);
      cursor = response.data?.nextCursor || null;
    } while (cursor);

    if (users.length === 0) throw new Error("There are no users to export.");

    const columns = [
      ["Full name", "fullName"],
      ["Email", "email"],
      ["Role", "role"],
      ["Verified", "isVerified"],
      ["Job title", "jobTitle"],
      ["Phone", "phone"],
      ["Created at", "createdAt"],
      ["Last login", "lastLogin"],
    ];
    const escapeCsvValue = (value) => {
      let safeValue = value == null ? "" : String(value);
      if (/^[\s]*[=+@\-]/.test(safeValue)) safeValue = `'${safeValue}`;
      return `"${safeValue.replace(/"/g, '""')}"`;
    };
    const csv = [
      columns.map(([label]) => escapeCsvValue(label)).join(","),
      ...users.map((user) => columns.map(([, key]) => {
        const value = key === "isVerified"
          ? (user[key] ? "Yes" : "No")
          : key === "createdAt" || key === "lastLogin"
            ? (user[key] ? new Date(user[key]).toISOString() : "")
            : user[key];
        return escapeCsvValue(value);
      }).join(",")),
    ].join("\r\n");

    return {
      content: `\uFEFF${csv}`,
      filename: `users_report_${new Date().toISOString().slice(0, 10)}.csv`,
    };
  };

  const counts = getCounts();

  const SECTIONS = [
    {
      id: "users",
      label: "Users",
      description: "Manage user accounts, roles, and permissions",
      route: "/users-list", 
      stats: [
        { label: "Total Users", value: counts.usersTotal },
        { label: "Verified", value: counts.usersVerified },
        { label: "Unverified", value: counts.usersUnverified },
      ],
    },
    {
      id: "clients",
      label: "Clients",
      description: "Manage client companies, contacts, and relationships",
      route: "/clients",
      stats: [
        { label: "Total Clients", value: counts.clientsTotal },
        { label: "New This Month", value: counts.clientsNewThisMonth },
        { label: "Active Projects", value: counts.projectsActive },
      ],
    },
    {
      id: "teams",
      label: "Teams",
      description: "Organize project teams, assignments, and workflows",
      route: "/teams", 
      stats: [
        { label: "Total Projects", value: counts.projectsTotal },
        { label: "Active", value: counts.projectsActive },
        { label: "Archived", value: counts.projectsArchived },
      ],
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-8">
      <div className="mx-auto">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
            User Management
          </h1>
          <p className="text-gray-600">
            Overview and quick access to clients, teams, and user administration
          </p>
        </div>

        {/* Quick Actions Bar */}
        <div className="flex flex-wrap gap-3 mb-8">
          {/* <button 
            onClick={() => alert("Add New action triggered - this would open the user creation modal.")}
            className="px-4 py-2 bg-[#002D62] text-white text-sm font-medium rounded-lg hover:bg-[#001f44] transition-colors flex items-center gap-2"
          >
            + Add New
          </button> */}
          <ImportButton onFileSelect={handleImport} disabled={importing} label={importing ? "Importing..." : "Import users"} />
          <button
            onClick={downloadCsvTemplate}
            className="px-4 py-2 border text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            template
          </button>
         
          <ExportButton
            onExport={handleExport}
            label="Export"
            loadingLabel="Preparing report..."
          />
        </div>

        {importResult && (
          <div className={`mb-6 p-4 rounded-lg text-sm ${importResult.error ? "bg-red-50 text-red-700" : "bg-green-50 text-green-800"}`}>
            {importResult.error ? (
              <p>{importResult.error}</p>
            ) : (
              <>
                <p>Import complete: {importResult.created} user{importResult.created === 1 ? "" : "s"} created, {importResult.failedRows.length} row{importResult.failedRows.length === 1 ? "" : "s"} skipped or failed.</p>
                {importResult.failedRows.length > 0 && (
                  <ul className="mt-2 list-disc pl-5">
                    {importResult.failedRows.map((failure) => (
                      <li key={failure.row}>Row {failure.row}: {failure.message}</li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        )}

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
        )}

        {/* Section Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading && SECTIONS.every((s) => s.stats.every((st) => !st.value)) ? (
            <p className="text-gray-400 col-span-full text-center py-8">Loading overview…</p>
          ) : (
            SECTIONS.map((section) => (
              <SectionCard key={section.id} section={section} />
            ))
          )}
        </div>

        {/* Recent Activity / Footer */}
        <div className="mt-12 bg-white border rounded-2xl p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Recent Activity</h3>
          <div className="space-y-3 text-sm text-gray-600">
            {activities && activities.length > 0 ? (
              activities.slice(0, 5).map((act) => (
                <p key={act.id}>
                  • {act.action} - <span className="text-gray-400 text-xs">{act.createdAt ? new Date(act.createdAt).toLocaleString() : ""}</span>
                </p>
              ))
            ) : (
              <p className="text-gray-400">No recent activities logged.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}