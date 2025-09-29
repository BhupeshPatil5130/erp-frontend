import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/** ------------------------------------------------------------
 *  exportStaffToPDF(data) – converts staff array to PDF table
 * ------------------------------------------------------------ */
export function exportStaffToPDF(data) {
  if (!data.length) return;

  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "A4" });

  // Table columns
  const columns = [
    { header: "ID",         dataKey: "id" },
    { header: "Name",       dataKey: "name" },
    { header: "Department", dataKey: "department" },
    { header: "Designation",dataKey: "designation" },
    { header: "Email",      dataKey: "email" },
    { header: "Phone",      dataKey: "phone" },
    { header: "Join Date",  dataKey: "joiningDate" },
    { header: "Status",     dataKey: "status" },
  ];

  // Map data rows
  const rows = data.map((r) => ({
    ...r,
    joiningDate: new Date(r.joiningDate).toISOString().split("T")[0],
  }));

  // Title
  doc.setFontSize(18);
  doc.text("Staff List", 40, 40);

  // Auto-generate table
  autoTable(doc, {
    startY: 60,
    headStyles: { fillColor: [100, 149, 237] }, // cornflower blue
    columns,
    body: rows,
    styles: { fontSize: 8 }
  });

  doc.save(`staff-${Date.now()}.pdf`);
}
