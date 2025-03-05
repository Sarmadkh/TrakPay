let currentSearchTerm = '';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize elements
    const uploadBox = document.querySelector('.upload-box');
    const imageUpload = document.getElementById('image-upload');
    const modal = document.getElementById('tableModal');
    const closeModal = document.querySelector('.close');
    const loadingOverlay = document.getElementById('loadingOverlay');
    let currentInvoiceId = null;

    // Navigation handling
    document.querySelectorAll('.nav-item').forEach(button => {
        button.addEventListener('click', () => {
            const viewId = button.dataset.view;
            showView(viewId);
            document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
            if(viewId !== 'addView') button.classList.add('active');
        });
    });

    // Image upload triggers
    document.querySelector('.fab').addEventListener('click', () => imageUpload.click());
    uploadBox.addEventListener('click', () => imageUpload.click());
    
    // Modal handling
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
        currentInvoiceId = null;
    });
    
    window.addEventListener('click', (e) => {
        if(e.target === modal) {
            modal.style.display = 'none';
            currentInvoiceId = null;
        }
    });

    // Image upload handler
    imageUpload.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        loadingOverlay.style.display = 'flex';
        
        try {
            const base64Image = await convertToBase64(file);
            const instructions = `This is an invoice.

Don't add any of your own words. 
Don't add the \`\`\` on start or end.

Amount should not be Comma or Thousand separated. 
Date should only be in DD-MMM-YYYY.

Reproduce the invoice in a proper JSON format. Use only following keys,
1. StoreName
2. DateTime
3. InvoiceNumber
4. Currency (Symbol only)
5. Items (Serial, Product, Price, Quantity, Amount)
6. Sum (Figures, Words)`;

            const response = await puter.ai.chat(instructions, `data:image/jpeg;base64,${base64Image}`);
            const jsonString = response.message.content.replace(/```json/g, '').replace(/```/g, '').trim();
            const jsonData = JSON.parse(jsonString);
            
            saveInvoice(jsonData);
            updateHomeView();
        } catch (error) {
            alert(`Error processing image: ${error.message}`);
        } finally {
            loadingOverlay.style.display = 'none';
        }
    });

    // Search functionality
    document.getElementById('searchInput').addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        filterInvoices(searchTerm);
    });

    // Initial load
    updateHomeView();

    // Global edit handler
    document.getElementById('table-container').addEventListener('blur', handleEdit, true);
    document.getElementById('table-container').addEventListener('keydown', (e) => {
        if(e.key === 'Enter') {
            e.preventDefault();
            e.target.blur();
        }
    });
});

// Helper functions
async function convertToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
    });
}

function saveInvoice(data) {
    const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    data.id = Date.now();
    invoices.push(data);
    localStorage.setItem('invoices', JSON.stringify(invoices));
}

function truncateStoreName(name, maxLength = 20) {
    if (name.length > maxLength) {
        return name.substring(0, maxLength) + '...';
    }
    return name;
}

function updateHomeView() {
    const homeView = document.getElementById('homeView');
    homeView.innerHTML = '';
    
    const invoices = JSON.parse(localStorage.getItem('invoices')) || [];
    
    invoices.forEach((invoice, index) => {
        const card = document.createElement('div');
        card.className = 'data-card';
        
        // Truncate store name to ensure consistent width
        const storeName = truncateStoreName(invoice.StoreName || 'Unknown Store');
        
        card.innerHTML = `
            <button class="delete-btn" data-index="${index}">
                <span class="material-icons">delete</span>
            </button>
            <div class="data-card-content">
                <h3>${storeName}</h3>
                <div class="invoice-info">
                    <p>${formatDate(invoice.DateTime)}</p>
                    <p>${invoice.Currency || ''} ${formatAmount(invoice.Sum?.Figures || 0)}</p>
                </div>
            </div>
        `;
        card.addEventListener('click', () => showInvoiceDetails(invoice));
        card.querySelector('.delete-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteInvoice(index);
        });
        homeView.appendChild(card);
    });
}

function deleteInvoice(index) {
    const invoices = JSON.parse(localStorage.getItem('invoices'));
    invoices.splice(index, 1);
    localStorage.setItem('invoices', JSON.stringify(invoices));
    updateHomeView();
}

function showInvoiceDetails(clickedInvoice) {
    const invoices = JSON.parse(localStorage.getItem('invoices'));
    const invoice = invoices.find(i => i.id === clickedInvoice.id);
    const tableContainer = document.getElementById('table-container');
    
    currentInvoiceId = clickedInvoice.id;
    tableContainer.innerHTML = generateTable(invoice);
    document.getElementById('tableModal').style.display = 'block';

    // Scroll to first highlighted row
    const firstHighlighted = tableContainer.querySelector('.highlighted-row');
    if (firstHighlighted) {
        firstHighlighted.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}
function filterInvoices(searchTerm) {
    currentSearchTerm = searchTerm.toLowerCase();
    const invoices = JSON.parse(localStorage.getItem('invoices')) || [];

    document.querySelectorAll('.data-card').forEach((card, index) => {
        const invoice = invoices[index];
        const cardText = card.textContent.toLowerCase();
        const hasMatchingProduct = invoice.Items?.some(item => 
            item.Product.toLowerCase().includes(currentSearchTerm)
        );

        const shouldShow = cardText.includes(currentSearchTerm) || hasMatchingProduct;
        card.style.display = shouldShow ? 'block' : 'none';
    });
}

function showView(viewId) {
    document.querySelectorAll('.content-view').forEach(view => {
        view.style.display = 'none';
    });
    document.getElementById(viewId).style.display = viewId === 'homeView' ? 'grid' : 'block';
}

function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;

        const day = String(date.getDate()).padStart(2, '0');
        const month = date.toLocaleString('default', { month: 'short' }).toUpperCase();
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
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
    return str.toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function generateTable(data) {
    let tableHtml = '<div class="editable-table">';

    // Store information
    tableHtml += `<div class="store-header">
        <h2 contenteditable="true" data-field="StoreName">${data.StoreName || 'Unknown Store'}</h2>
        <div class="invoice-meta">
            <p>Date: <span contenteditable="true" data-field="DateTime">${formatDate(data.DateTime)}</span></p>
            <p>Invoice #: <span contenteditable="true" data-field="InvoiceNumber">${data.InvoiceNumber || 'N/A'}</span></p>
        </div>
    </div>`;

    // Items table
    if (data.Items?.length) {
        tableHtml += `<table>
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>`;

        data.Items.forEach((item, index) => {
            const product = capitalizeWords(item.Product);
            const isHighlighted = currentSearchTerm && 
                product.toLowerCase().includes(currentSearchTerm);
            
            tableHtml += `<tr ${isHighlighted ? 'class="highlighted-row"' : ''}>
                <td contenteditable="true" data-field="Items" data-index="${index}" data-prop="Product">${product}</td>
                <td contenteditable="true" data-field="Items" data-index="${index}" data-prop="Price">${data.Currency || ''} ${formatAmount(item.Price)}</td>
                <td contenteditable="true" data-field="Items" data-index="${index}" data-prop="Quantity">${item.Quantity}</td>
                <td contenteditable="true" data-field="Items" data-index="${index}" data-prop="Amount">${data.Currency || ''} ${formatAmount(item.Amount)}</td>
            </tr>`;
        });

        // Total row
        tableHtml += `<tr class="total-row">
            <td colspan="3"><strong>Total</strong></td>
            <td><strong>${data.Currency || ''} ${formatAmount(data.Sum?.Figures)}</strong></td>
        </tr></tbody></table>`;

        // Amount in words
        tableHtml += `<div class="amount-words-container">
            <span contenteditable="true" data-field="Sum" data-prop="Words">${capitalizeWords(data.Sum?.Words)}</span>
        </div>`;
    } else {
        tableHtml += `<p class="no-items">No items found in invoice</p>`;
    }

    tableHtml += '</div>';
    return tableHtml;
}

function handleEdit(e) {
    if (!e.target.hasAttribute('contenteditable')) return;
    
    const element = e.target;
    const invoices = JSON.parse(localStorage.getItem('invoices'));
    const invoice = invoices.find(i => i.id === currentInvoiceId);
    
    if (!invoice) return;

    const field = element.dataset.field;
    const prop = element.dataset.prop;
    const index = element.dataset.index;
    let newValue = element.textContent.trim();

    // Handle currency fields
    if (prop === 'Price' || prop === 'Amount') {
        newValue = newValue.replace(invoice.Currency, '').trim();
    }

    // Update data structure
    if (field === 'Items') {
        if (prop === 'Product') {
            invoice.Items[index][prop] = newValue;
        } else {
            invoice.Items[index][prop] = parseFloat(newValue) || 0;
        }
    } else if (field === 'Sum') {
        if (prop === 'Words') {
            invoice.Sum[prop] = newValue;
        } else {
            invoice.Sum[prop] = parseFloat(newValue) || 0;
        }
    } else {
        if (field === 'DateTime') {
            if (!/^\d{2}-[A-Z]{3}-\d{4}$/.test(newValue)) {
                element.textContent = invoice[field];
                return alert('Date must be in DD-MMM-YYYY format');
            }
        }
        invoice[field] = field === 'InvoiceNumber' ? newValue : newValue.toUpperCase();
    }

    // Recalculate total if items changed
    if (field === 'Items') {
        invoice.Sum.Figures = invoice.Items.reduce((sum, item) => sum + (item.Amount || 0), 0);
    }

    // Update storage and refresh views
    localStorage.setItem('invoices', JSON.stringify(invoices));
    updateHomeView();
    
    // Refresh modal view
    const tableContainer = document.getElementById('table-container');
    tableContainer.innerHTML = generateTable(invoice);
}
