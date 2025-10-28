const form = document.getElementById("invoice-form");
const requiredFields = form.querySelectorAll("[required]");
const downloadPdf = document.getElementById("downloadPdf");

const checkFields = () => {
  let allFilled = true;
  requiredFields.forEach((field) => {
    if (!field.value.trim()) {
      allFilled = false;
    }
  });
  downloadPdf.disabled = !allFilled;
};

// Run check on every input event
requiredFields.forEach((field) => {
  field.addEventListener("input", checkFields);
});

// Run once on page load
checkFields();

function generatePdf() {
  const theme = document.getElementById("theme");
  if (theme.value === "slate") {
    generateSlateInvoice();
  } else if (theme.value === "classic") {
    generateClassicInvoice();
  }
}

// convenience alias for jsPDF UMD build
const { jsPDF } = window.jspdf;

// ---------- Slate style invoice ----------
const generateSlateInvoice = () => {
  const invoiceNumber = document.getElementById("invoiceNumber").value;
  const senderName = document.getElementById("senderName").value;
  const billTo = document.getElementById("billTo").value;
  const shipTo = document.getElementById("shipTo").value;
  const invoiceDate = document.getElementById("invoiceDate").value;
  const paymentTerms = document.getElementById("paymentTerms").value;
  const dueDate = document.getElementById("dueDate").value;
  const poNumber = document.getElementById("poNumber").value;
  const notes = document.getElementById("notes").value;
  const terms = document.getElementById("terms").value;
  const lineItems = document.querySelectorAll(".item");
  const items = Array.from(lineItems).map((item) => {
    const description = item.querySelector(".description").value;
    const quantity = item.querySelector(".quantity").value;
    const rate = item.querySelector(".rate").value;
    const amount = item.querySelector(".amount").innerText;
    return { description, quantity, rate, amount };
  });
  const subtotal = document.getElementById("subtotal").innerText;
  const discount = document.getElementById("discount").value;
  const discountBase = document.getElementById("discount").placeholder;
  const tax = document.getElementById("tax").value;
  const taxBase = document.getElementById("tax").placeholder;
  const shipping = document.getElementById("shipping").value;
  const currency = document.getElementById("shipping").placeholder;
  const total = document.getElementById("total").innerText;
  const amountPaid = document.getElementById("amountPaid").value;
  const balanceDue = document.getElementById("balanceDue").innerText;

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Colors & metrics for "slate" style
  const slateBg = "#ffffff"; // dark slate header
  const accent = "#000000";
  const margin = 40;
  let y = margin;

  // Header background block
  doc.setFillColor(slateBg);
  doc.rect(0, 0, pageWidth, 110, "F");
  if (window.uploadedImageBase64) {
    // x=margin, y=20 (a bit lower so it’s centered vertically),
    // width/height = scale to ~60px tall
    doc.addImage(window.uploadedImageBase64, "PNG", margin, 20, 60, 60);
  }

  // Company name (left, light text)
  doc.setFontSize(20);
  doc.setTextColor(accent);
  doc.setFont("helvetica", "bold");
  const companyX = window.uploadedImageBase64 ? margin + 70 : margin;
  doc.text(String(senderName || ""), companyX, 45);

  // Invoice big title (right)
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", pageWidth - margin, 45, { align: "right" });

  // secondary header info (white text)
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`# ${String(invoiceNumber || "")}`, pageWidth - margin, 65, {
    align: "right",
  });

  y = 140;

  // Bill to / Ship to block (two columns)
  doc.setTextColor(20, 20, 20);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("BILL TO", margin, y);
  doc.text("SHIP TO", pageWidth / 2 - 40, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(String(billTo || ""), margin, y + 16, { maxWidth: 200 });
  doc.text(String(shipTo || ""), pageWidth / 2 - 40, y + 16, {
    maxWidth: 200,
  });

  // Right-side small meta box
  const metaX = pageWidth - 220;
  const metaY = y;
  doc.setDrawColor(200);
  doc.rect(metaX, metaY - 6, 200, 70); // border box
  doc.setFontSize(10);
  doc.text(`Invoice Date: ${String(invoiceDate || "")}`, metaX + 8, metaY + 10);
  doc.text(
    `Payment Terms: ${String(paymentTerms || "")}`,
    metaX + 8,
    metaY + 26
  );
  doc.text(`Due Date: ${String(dueDate || "")}`, metaX + 8, metaY + 42);
  doc.text(`PO Number: ${String(poNumber || "")}`, metaX + 8, metaY + 58);

  y += 90;

  // Items table using AutoTable
  doc.autoTable({
    startY: y,
    theme: "grid",
    head: [["Item", "Quantity", "Rate", "Amount"]],
    body: items.map(({ description, quantity, rate, amount }) => [
      String(description || ""),
      String(quantity || ""),
      String(rate || ""),
      String(amount),
    ]),
    styles: { fontSize: 10, cellPadding: 6 },
    headStyles: { fillColor: [47, 54, 64], textColor: 255, halign: "center" },
    margin: { left: margin, right: margin },
  });

  // After table, add totals on right
  const finalY = doc.lastAutoTable.finalY + 10;
  const rightColX = pageWidth - margin - 200;

  doc.setFontSize(10);
  doc.text("Subtotal:", rightColX, finalY + 18);
  doc.text(String(subtotal), pageWidth - margin - 8, finalY + 18, {
    align: "right",
  });

  doc.text("Discount:", rightColX, finalY + 36);
  doc.text(
    String(`${discountBase} ${discount || "0.00"}`),
    pageWidth - margin - 8,
    finalY + 36,
    {
      align: "right",
    }
  );

  doc.text("Tax:", rightColX, finalY + 54);
  doc.text(
    String(`${taxBase} ${tax || "0.00"}`),
    pageWidth - margin - 8,
    finalY + 54,
    {
      align: "right",
    }
  );

  doc.text("Shipping:", rightColX, finalY + 72);
  doc.text(
    String(`${currency} ${shipping || "0.00"}`),
    pageWidth - margin - 8,
    finalY + 72,
    {
      align: "right",
    }
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Total:", rightColX, finalY + 100);
  doc.text(String(total), pageWidth - margin - 8, finalY + 100, {
    align: "right",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(
    `Amount Paid: ${String(`${currency} ${amountPaid || "0.00"}`)}`,
    margin,
    finalY + 110
  );
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(
    `Balance Due: ${String(`${balanceDue || "0.00"}`)}`,
    margin,
    finalY + 125
  );

  // Notes & terms
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("NOTES", margin, finalY + 140);
  doc.setFont("helvetica", "normal");
  doc.text(String(notes || ""), margin, finalY + 156, { maxWidth: 200 });

  doc.setFont("helvetica", "bold");
  doc.text("TERMS", pageWidth / 2 + margin / 2, finalY + 140);
  doc.setFont("helvetica", "normal");
  doc.text(String(terms || ""), pageWidth / 2 + margin / 2, finalY + 156, {
    maxWidth: 200,
  });

  // Save
  doc.save(`invoice_slate_${String(invoiceNumber || "draft")}.pdf`);
};

function generateClassicInvoice() {
  const invoiceNumber = document.getElementById("invoiceNumber").value;
  const senderName = document.getElementById("senderName").value;
  const billTo = document.getElementById("billTo").value;
  const shipTo = document.getElementById("shipTo").value;
  const invoiceDate = document.getElementById("invoiceDate").value;
  const paymentTerms = document.getElementById("paymentTerms").value;
  const dueDate = document.getElementById("dueDate").value;
  const poNumber = document.getElementById("poNumber").value;
  const notes = document.getElementById("notes").value;
  const terms = document.getElementById("terms").value;
  const lineItems = document.querySelectorAll(".item");
  const items = Array.from(lineItems).map((item) => {
    const description = item.querySelector(".description").value;
    const quantity = item.querySelector(".quantity").value;
    const rate = item.querySelector(".rate").value;
    const amount = item.querySelector(".amount").innerText;
    return { description, quantity, rate, amount };
  });
  const subtotal = document.getElementById("subtotal").innerText;
  const discount = document.getElementById("discount").value;
  const discountBase = document.getElementById("discount").placeholder;
  const tax = document.getElementById("tax").value;
  const taxBase = document.getElementById("tax").placeholder;
  const shipping = document.getElementById("shipping").value;
  const currency = document.getElementById("shipping").placeholder;
  const total = document.getElementById("total").innerText;
  const amountPaid = document.getElementById("amountPaid").value;
  const balanceDue = document.getElementById("balanceDue").innerText;

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  let y = margin;

  // Top left: Company & invoice number
  doc.setFont("times", "bold");
  doc.setFontSize(20);
  doc.text(senderName, margin, y);

  // Right: Invoice big & number under it (classic layout)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.text("INVOICE", pageWidth - margin, y, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`# ${invoiceNumber}`, pageWidth - margin, y + 18, {
    align: "right",
  });

  y += 30;

  // Meta lines (Date, Payment Terms, Due Date)
  const metaLeftX = margin;
  const metaRightX = pageWidth / 2 + 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  doc.text(`Date: ${invoiceDate}`, metaLeftX, y);
  doc.text(`Payment Terms:`, metaLeftX, y + 14);
  doc.text(`Due Date: ${dueDate}`, metaLeftX, y + 28);

  doc.text(`Bill To: ${billTo}`, metaRightX, y);
  doc.text(`Ship To: ${shipTo}`, metaRightX, y + 14);
  doc.text(`PO Number: ${poNumber}`, metaRightX, y + 28);

  y += 48;

  // Items table (classic numeric alignment)
  doc.autoTable({
    startY: y,
    theme: "plain",
    head: [["Item", "Quantity", "Rate", "Amount"]],
    body: items.map(({ description, quantity, rate, amount }) => [
      description,
      String(quantity),
      rate,
      amount,
    ]),
    styles: { fontSize: 10, cellPadding: 6 },
    headStyles: { fillColor: [230, 230, 230], textColor: 10, halign: "center" },
    margin: { left: margin, right: margin },
  });

  const afterTableY = doc.lastAutoTable.finalY + 8;

  // Totals area (left aligned labels, right aligned amounts)
  const totalsX = pageWidth - margin - 220;
  doc.setFontSize(10);
  doc.text("Subtotal:", totalsX, afterTableY + 20);
  doc.text(subtotal, pageWidth - margin - 8, afterTableY + 20, {
    align: "right",
  });

  doc.text("Discount (10%):", totalsX, afterTableY + 36);
  doc.text(discount, pageWidth - margin - 8, afterTableY + 36, {
    align: "right",
  });

  doc.text("Shipping:", totalsX, afterTableY + 52);
  doc.text(shipping, pageWidth - margin - 8, afterTableY + 52, {
    align: "right",
  });

  doc.setFont("helvetica", "bold");
  doc.text("Total:", totalsX, afterTableY + 76);
  doc.text(total, pageWidth - margin - 8, afterTableY + 76, {
    align: "right",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Notes:", margin, afterTableY + 110);
  doc.text(notes, margin, afterTableY + 126);

  doc.text("Terms:", pageWidth / 2 + 10, afterTableY + 110);
  doc.text(terms, pageWidth / 2 + 10, afterTableY + 126);

  doc.save(`invoice_classic_${invoiceNumber}.pdf`);
}
