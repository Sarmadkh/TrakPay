// Process the image as soon as it's uploaded
document.getElementById('image-upload').addEventListener('change', async (event) => {
  const instructions = document.getElementById('instructions').value;
  const responseDiv = document.getElementById('response');
  const loadingDiv = document.getElementById('loading');
  const tableContainer = document.getElementById('table-container');
  const fileInput = event.target;

  if (!fileInput.files[0]) {
    return; // No file selected
  }

  // Show loading message
  loadingDiv.style.display = 'block';
  responseDiv.textContent = '';
  tableContainer.innerHTML = '';

  // Convert image to base64
  const file = fileInput.files[0];
  const reader = new FileReader();
  reader.onload = async (event) => {
    const base64Image = event.target.result.split(',')[1];

    // Send request to GPT-4 Vision via Puter.js
    try {
      const response = await puter.ai.chat(
        instructions || 'Extract invoice details in JSON format.',
        `data:image/jpeg;base64,${base64Image}`
      );

      // Extract only the content part from the response
      const jsonContent = response?.message?.content || '';

      // Just for debugging - can be removed in production
      responseDiv.textContent = jsonContent;

      // Parse and display the JSON
      try {
        const parsedData = JSON.parse(jsonContent);
        tableContainer.innerHTML = generateTable(parsedData);
      } catch (error) {
        tableContainer.innerHTML = `<p style="color: red;">Error parsing JSON: ${error.message}</p>`;
      }
    } catch (error) {
      responseDiv.textContent = 'Error: ' + error.message;
    } finally {
      loadingDiv.style.display = 'none';
    }
  };
  reader.readAsDataURL(file);
});

function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'short' }).toUpperCase();
    const year = date.getFullYear();
    const hours = date.getHours() % 12 || 12;
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
    return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
  } catch (error) {
    return dateString;
  }
}

function formatAmount(amount) {
  try {
    return parseFloat(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } catch (error) {
    return amount;
  }
}

function capitalizeWords(str) {
  if (!str) return 'N/A';
  try {
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  } catch (error) {
    return str;
  }
}

function generateTable(data) {
  let tableHtml = '';

  // Display Store Name
  if (data.StoreName) {
    tableHtml += `<div class="store-name">${data.StoreName}</div>`;
  }

  // Display Date & Time
  if (data.DateTime) {
    tableHtml += `<p><strong>Date & Time:</strong> ${formatDate(data.DateTime)}</p>`;
  }

  // Display Invoice Number
  if (data.InvoiceNumber) {
    tableHtml += `<p><strong>Invoice Number:</strong> ${data.InvoiceNumber}</p>`;
  }

  // Display Total Amount with Currency
  if (data.Sum) {
    const totalAmount = data.Sum.Figures || '0';
    const totalAmountWords = capitalizeWords(data.Sum.Words || 'N/A');
    const currency = data.Currency || ''; // Get the currency from the JSON data
    tableHtml += `<p><strong>Total Amount:</strong> ${currency} ${formatAmount(totalAmount)} (${totalAmountWords})</p>`;
  }

  // Display items table if available
  if (data.Items && Array.isArray(data.Items)) {
    let totalQuantity = 0;
    let totalAmountSum = 0;

    tableHtml += `<table>
                   <thead>
                     <tr>
                       <th>Serial</th>
                       <th>Product</th>
                       <th>Price</th>
                       <th>Quantity</th>
                       <th>Amount</th>
                     </tr>
                   </thead>
                   <tbody>`;

    data.Items.forEach(item => {
      const quantity = parseFloat(item.Quantity) || 0;
      const amount = parseFloat(item.Amount) || 0;
      totalQuantity += quantity;
      totalAmountSum += amount;

      tableHtml += `<tr>
                     <td>${item.Serial || 'N/A'}</td>
                     <td>${capitalizeWords(item.Product || 'N/A')}</td>
                     <td>${formatAmount(item.Price || '0')}</td>
                     <td>${quantity}</td>
                     <td>${formatAmount(amount)}</td>
                   </tr>`;
    });

    // Add the total row with currency
    const currency = data.Currency || ''; // Get the currency from the JSON data
    tableHtml += `<tr class="total-row">
                   <td colspan="3"><strong>Total</strong></td>
                   <td><strong>${totalQuantity}</strong></td>
                   <td><strong>${currency} ${formatAmount(totalAmountSum)}</strong></td>
                 </tr>`;

    tableHtml += `</tbody></table>`;
  } else {
    tableHtml += `<p>No items found in the invoice.</p>`;
  }

  return tableHtml;
}