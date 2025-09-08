const { sendInvoiceEmail } = require("../utils/email");

function renderInvoiceHtml(invoice, user) {
  return `
    <h2>Invoice #${invoice.id}</h2>
    <p>Hello ${user.username},</p>
    <p>Thank you for your business. Here are your invoice details:</p>
    <ul>
      ${invoice.lineItems.map(item => `<li><b>${item.description}</b>: $${Number(item.amount).toFixed(2)}</li>`).join('')}
    </ul>
    <p><b>Total:</b> $${Number(invoice.amount).toFixed(2)}</p>
    <p>Status: ${invoice.status}</p>
    <p>Invoice Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}</p>
    <p>Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}</p>
    <hr/>
    <p>If you have any questions, reply to this email.</p>
  `;
}

module.exports = { renderInvoiceHtml };
