// Store invoices in localStorage
const STORAGE_KEY = 'invoiceVault_invoices';
let invoices = [];
let filteredInvoices = [];
let selectedFilter = null;
let filterValue = null;
let currentInvoiceData = null;
let visibleInvoices = 6; // Number of invoices to show initially

// Helper functions
const $ = id => document.getElementById(id);
const $$ = selector => document.querySelectorAll(selector);
const formatCurrency = (amount, currency = '') => {
  const value = parseFloat(amount) || 0;
  return `${currency} ${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

const parseDate = dateStr => {
  if (!dateStr) return null;
  const parts = dateStr.split('-');
  const months = {'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5, 
                  'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11};
  const month = months[parts[1].toLowerCase()];
  return `${parts[2]}-${month + 1}-${parts[0]}`;
};

const formatDate = dateStr => {
  if (!dateStr) return 'No date';
  try {
    const date = new Date(parseDate(dateStr));
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch (e) {
    return dateStr;
  }
};

// DOM Elements
const elements = {
  searchInput: $('search-input'),
  searchButton: $('search-button'),
  filterChips: $$('.filter-chip'),
  filterDropdown: $('filter-dropdown'),
  seeMoreBtn: $('see-more-btn'),
  invoicesGrid: $('invoices-grid'),
  emptyState: $('empty-state'),
  loadingState: $('loading-state'),
  addBtn: $('add-btn'),
  invoiceUpload: $('invoice-upload'),
  processingStatus: $('processing-status'),
  invoiceDetailsModal: $('invoice-details-modal'),
  closeDetailsModalBtn: $('close-details-modal-btn'),
  invoiceDetailsContent: $('invoice-details-content'),
  navButtons: $$('.nav-btn'),
  processingInstructions: $('processing-instructions'),
  editInvoiceModal: $('edit-invoice-modal'),
  editInvoiceForm: $('edit-invoice-form'),
  closeEditModalBtn: $('close-edit-modal-btn'),
  saveEditBtn: $('save-edit-btn'),
};

// Initialize app
function initApp() {
  // Load data and setup UI
  loadInvoices();
  renderInvoices();
  setupEventListeners();
  elements.loadingState.style.display = 'none';
}

// Data management functions
function loadInvoices() {
  const storedInvoices = localStorage.getItem(STORAGE_KEY);
  invoices = storedInvoices ? JSON.parse(storedInvoices) : [];
  filteredInvoices = [...invoices];
  updateEmptyState();
}

function saveInvoices() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
}

function saveInvoice() {
  if (!currentInvoiceData) {
    alert('No invoice data to save.');
    return;
  }
  
  // Add timestamp and ID
  const timestamp = Date.now();
  const newInvoice = {
    ...currentInvoiceData,
    id: 'inv_' + timestamp,
    createdAt: timestamp
  };
  
  invoices.unshift(newInvoice);
  filteredInvoices = [...invoices];
  saveInvoices();
  currentInvoiceData = null;
  renderInvoices();
  updateEmptyState();
}

// UI Event Handlers
function setupEventListeners() {
  // Search
  elements.searchButton.addEventListener('click', performSearch);
  elements.searchInput.addEventListener('input', performSearch);

  // Filters
  elements.filterChips.forEach(chip => chip.addEventListener('click', toggleFilter));

  elements.closeEditModalBtn.addEventListener('click', () => 
    elements.editInvoiceModal.classList.remove('visible'));
  
  elements.editInvoiceForm.addEventListener('submit', handleEditFormSubmit);
  
  // Window click to close edit modal
  window.addEventListener('click', e => {
    if (e.target === elements.editInvoiceModal) {
      elements.editInvoiceModal.classList.remove('visible');
    }
  });

  // Add item button in edit form
$('add-item-btn').addEventListener('click', () => {
    addItemRow($('edit-items-container'));
  });

  // See more button
  elements.seeMoreBtn.addEventListener('click', () => {
    visibleInvoices += 6;
    renderInvoices();
  });

  // Add invoice button - directly open file picker
  elements.addBtn.addEventListener('click', () => elements.invoiceUpload.click());

  // Close details modal button
  elements.closeDetailsModalBtn.addEventListener('click', () => 
    elements.invoiceDetailsModal.classList.remove('visible'));

  // File upload handler
  elements.invoiceUpload.addEventListener('change', e => {
    if (e.target.files.length) {
      elements.processingStatus.classList.add('visible');
      handleFileUpload(e.target.files[0]);
    }
  });

  // Navigation buttons
  elements.navButtons.forEach(btn => {
    if (!btn.classList.contains('fab')) {
      btn.addEventListener('click', () => {
        elements.navButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        // You would handle screen changes here
      });
    }
  });

  // Window events for modal closing
  window.addEventListener('click', e => {
    if (e.target === elements.invoiceDetailsModal) {
      elements.invoiceDetailsModal.classList.remove('visible');
    }
  });
}

// Search & Filter Logic
function performSearch() {
  const query = elements.searchInput.value.trim().toLowerCase();
  
  if (!query) {
    filteredInvoices = [...invoices];
  } else {
    filteredInvoices = invoices.filter(invoice => {
      return (invoice.StoreName && invoice.StoreName.toLowerCase().includes(query)) || 
             (invoice.Items && Array.isArray(invoice.Items) && 
              invoice.Items.some(item => item.Product && 
                                 item.Product.toLowerCase().includes(query)));
    });
  }
  
  renderInvoices();
  updateFilterDropdown();
  visibleInvoices = 6;
}

String.prototype.toProperCase = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

// Edit

function showEditInvoiceForm(invoice) {
    // Hide the details modal and show edit modal
    elements.invoiceDetailsModal.classList.remove('visible');
    
    // Populate the form with invoice data
    const form = elements.editInvoiceForm;
    form.reset();
    
    // Set form fields
    form.querySelector('#edit-invoice-id').value = invoice.id;
    form.querySelector('#edit-store-name').value = invoice.StoreName || '';
    form.querySelector('#edit-date').value = formatDateForInput(invoice.Dated) || '';
    form.querySelector('#edit-invoice-number').value = invoice.InvoiceNumber || '';
    form.querySelector('#edit-category').value = invoice.Category || 'Misc';
    
    // Populate items
    const itemsContainer = form.querySelector('#edit-items-container');
    itemsContainer.innerHTML = '';
    
    if (invoice.Items && Array.isArray(invoice.Items)) {
      invoice.Items.forEach((item, index) => {
        addItemRow(itemsContainer, item, index);
      });
    }
    
    // Show edit modal
    elements.editInvoiceModal.classList.add('visible');
  }
  
  function formatDateForInput(dateStr) {
    if (!dateStr) return '';
    try {
      const date = new Date(parseDate(dateStr));
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      return `${date.getFullYear()}-${month}-${day}`;
    } catch (e) {
      return '';
    }
  }
  
  function addItemRow(container, item = {}, index) {
    const row = document.createElement('div');
    row.className = 'edit-item-row';
    row.innerHTML = `
      <input type="text" class="item-product" placeholder="Product" value="${item.Product || ''}">
      <input type="number" class="item-price" placeholder="Price" value="${item.Price || '0'}" step="0.01" min="0">
      <input type="number" class="item-quantity" placeholder="Qty" value="${item.Quantity || '1'}" min="1">
      <input type="text" class="item-amount" placeholder="Amount" value="${item.Amount || '0'}" readonly>
      <button type="button" class="remove-item-btn"><i class="fas fa-times"></i></button>
    `;
    
    // Add event listeners
    const priceInput = row.querySelector('.item-price');
    const qtyInput = row.querySelector('.item-quantity');
    const amountInput = row.querySelector('.item-amount');
    
    // Calculate amount when price or quantity changes
    const calculateAmount = () => {
      const price = parseFloat(priceInput.value) || 0;
      const qty = parseFloat(qtyInput.value) || 0;
      const amount = price * qty;
      amountInput.value = amount.toFixed(2);
      updateTotalAmount();
    };
    
    priceInput.addEventListener('input', calculateAmount);
    qtyInput.addEventListener('input', calculateAmount);
    
    // Remove item button
    row.querySelector('.remove-item-btn').addEventListener('click', () => {
      row.remove();
      updateTotalAmount();
    });
    
    container.appendChild(row);
    calculateAmount();
  }
  
  function updateTotalAmount() {
    const form = elements.editInvoiceForm;
    const itemRows = form.querySelectorAll('.edit-item-row');
    let total = 0;
    
    itemRows.forEach(row => {
      const amount = parseFloat(row.querySelector('.item-amount').value) || 0;
      total += amount;
    });
    
    form.querySelector('#edit-total-amount').value = total.toFixed(2);
  }
  
  function handleEditFormSubmit(e) {
    e.preventDefault();
    
    const form = elements.editInvoiceForm;
    const invoiceId = form.querySelector('#edit-invoice-id').value;
    
    // Find the invoice
    const index = invoices.findIndex(inv => inv.id === invoiceId);
    if (index === -1) return;
    
    // Extract form data
    const storeName = form.querySelector('#edit-store-name').value;
    const date = form.querySelector('#edit-date').value;
    const invoiceNumber = form.querySelector('#edit-invoice-number').value;
    const category = form.querySelector('#edit-category').value;
    
    // Parse date back to DD-MMM-YYYY format
    const formattedDate = formatDateFromInput(date);
    
    // Extract items
    const items = [];
    const itemRows = form.querySelectorAll('.edit-item-row');
    
    itemRows.forEach((row, idx) => {
      const product = row.querySelector('.item-product').value;
      const price = parseFloat(row.querySelector('.item-price').value) || 0;
      const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
      const amount = parseFloat(row.querySelector('.item-amount').value) || 0;
      
      items.push({
        Serial: idx + 1,
        Product: product,
        Price: price,
        Quantity: quantity,
        Amount: amount
      });
    });
    
    // Calculate total
    const totalAmount = parseFloat(form.querySelector('#edit-total-amount').value) || 0;
    
    // Update invoice
    invoices[index] = {
      ...invoices[index],
      StoreName: storeName,
      Dated: formattedDate,
      InvoiceNumber: invoiceNumber,
      Category: category,
      Items: items,
      Sum: {
        Figures: totalAmount,
        Words: '' // Could add number-to-words conversion here
      }
    };
    
    // Save changes
    saveInvoices();
    filteredInvoices = [...invoices];
    elements.editInvoiceModal.classList.remove('visible');
    renderInvoices();
  }
  
  function formatDateFromInput(dateStr) {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const day = String(date.getDate()).padStart(2, '0');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = monthNames[date.getMonth()];
      return `${day}-${month}-${date.getFullYear()}`;
    } catch (e) {
      return dateStr;
    }
  }

function toggleFilter(e) {
  const chip = e.currentTarget;
  const filterType = chip.dataset.filter;
  
  // Toggle active state
  if (selectedFilter === filterType) {
    // Deselect current filter
    chip.classList.remove('active');
    selectedFilter = null;
    filterValue = null;
    elements.filterDropdown.classList.remove('visible');
    filteredInvoices = [...invoices];
    renderInvoices();
  } else {
    // Select new filter
    elements.filterChips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    selectedFilter = filterType;
    showFilterOptions(filterType);
  }
}

function showFilterOptions(filterType) {
  // Get unique values for the selected filter
  const filterOptions = {
    month: getUniqueMonths(),
    category: getUniqueValues('Category'),
    store: getUniqueValues('StoreName')
  };
  
  const options = filterOptions[filterType] || [];
  
  // Populate dropdown
  elements.filterDropdown.innerHTML = '';
  options.forEach(option => {
    const optionEl = document.createElement('div');
    optionEl.classList.add('filter-option');
    optionEl.textContent = option;
    optionEl.addEventListener('click', () => {
      applyFilter(filterType, option);
      elements.filterDropdown.classList.remove('visible');
    });
    elements.filterDropdown.appendChild(optionEl);
  });
  
  // Position and show dropdown
  elements.filterDropdown.classList.add('visible');
}

function getUniqueMonths() {
  const months = invoices.map(invoice => {
    if (invoice.Dated) {
      const date = new Date(parseDate(invoice.Dated));
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    return 'Unknown';
  });
  return [...new Set(months)];
}

function getUniqueValues(property) {
  return [...new Set(invoices.map(invoice => invoice[property] || 'Unknown'))];
}

function applyFilter(filterType, value) {
  filterValue = value;
  
  const filterFunctions = {
    month: invoice => {
      if (invoice.Dated) {
        const date = new Date(parseDate(invoice.Dated));
        const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        return monthYear === value;
      }
      return false;
    },
    category: invoice => invoice.Category === value,
    store: invoice => invoice.StoreName === value
  };
  
  filteredInvoices = invoices.filter(filterFunctions[filterType] || (() => true));
  renderInvoices();
}

function updateFilterDropdown() {
  if (selectedFilter) {
    showFilterOptions(selectedFilter);
  }
}

// Rendering functions
function updateEmptyState() {
  const isEmpty = invoices.length === 0;
  elements.emptyState.style.display = isEmpty ? 'flex' : 'none';
  elements.invoicesGrid.style.display = isEmpty ? 'none' : 'grid';
  elements.seeMoreBtn.style.display = 'none';
}

function renderInvoices() {
  elements.invoicesGrid.innerHTML = '';
  
  // Handle empty state
  if (filteredInvoices.length === 0) {
    elements.invoicesGrid.innerHTML = '<p>No invoices found matching your criteria.</p>';
    elements.seeMoreBtn.style.display = 'none';
    return;
  }
  
  // Get visible slice of invoices
  const visibleSlice = filteredInvoices.slice(0, visibleInvoices);
  
  // Create invoice cards
  visibleSlice.forEach(invoice => {
    const card = createInvoiceCard(invoice);
    elements.invoicesGrid.appendChild(card);
  });
  
  // Show/hide see more button
  elements.seeMoreBtn.style.display = filteredInvoices.length > visibleInvoices ? 'block' : 'none';
}

function createInvoiceCard(invoice) {
  const card = document.createElement('div');
  card.className = 'invoice-card';
  card.dataset.id = invoice.id;
  
  const amount = invoice.Sum?.Figures || '0';
  const formattedDate = formatDate(invoice.Dated);
  
  card.innerHTML = `
    <div class="invoice-header">${(invoice.StoreName).toProperCase() || 'Unknown Store'}</div>
    <div class="invoice-body">
      <div class="invoice-info">${formattedDate}</div>
      <div class="invoice-amount">${formatCurrency(amount, invoice.Currency)}</div>
      <div class="invoice-category ${invoice.Category}">${invoice.Category || 'Misc'}</div>
    </div>
  `;
  
  card.addEventListener('click', () => showInvoiceDetails(invoice));
  return card;
}

// File Processing
async function handleFileUpload(file) {
  if (!file.type.startsWith('image/')) {
    alert('Please upload an image file.');
    elements.processingStatus.classList.remove('visible');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = async (e) => {
    const base64Image = e.target.result.split(',')[1];
    
    try {
      // Send to Puter.js for processing
      const response = await puter.ai.chat(
        elements.processingInstructions.value.trim() || 'Extract invoice details in JSON format.',
        `data:image/jpeg;base64,${base64Image}`
      );
      
      // Extract and parse JSON content
      const jsonContent = response?.message?.content || '';
      
      try {
        currentInvoiceData = JSON.parse(jsonContent);
        saveInvoice();
      } catch (error) {
        console.error('JSON parse error:', error);
        alert('Error parsing invoice data. Please try again.');
      }
    } catch (error) {
      console.error('Processing error:', error);
      alert('Error processing image. Please try again.');
    } finally {
      elements.processingStatus.classList.remove('visible');
    }
  };
  
  reader.readAsDataURL(file);
}

// Invoice Details
function showInvoiceDetails(invoice) {
  if (!invoice) return;
  
  const searchQuery = elements.searchInput.value.trim().toLowerCase();
  elements.invoiceDetailsContent.innerHTML = '';
  
  const detailsView = document.createElement('div');
  
  // Store name
  if (invoice.StoreName) {
    const storeName = document.createElement('div');
    storeName.className = 'store-name';
    storeName.textContent = (invoice.StoreName).toProperCase();
    detailsView.appendChild(storeName);
  }
  
  // Invoice meta info
  const metaInfo = document.createElement('div');
  metaInfo.className = 'invoice-meta';
  metaInfo.innerHTML = `
    <div><strong>Date:</strong> ${invoice.Dated || 'N/A'}</div>
    <div><strong>Invoice #:</strong> ${invoice.InvoiceNumber || 'N/A'}</div>
  `;
  detailsView.appendChild(metaInfo);
  
  // Category badge
  if (invoice.Category) {
    const categoryBadge = document.createElement('div');
    categoryBadge.className = `invoice-category ${invoice.Category}`;
    categoryBadge.textContent = invoice.Category;
    detailsView.appendChild(categoryBadge);
  }
  
  // Items table
  if (invoice.Items && Array.isArray(invoice.Items) && invoice.Items.length > 0) {
    const table = document.createElement('table');
    table.className = 'invoice-table';
    
    table.innerHTML = `
      <thead>
        <tr>
          <th>Item</th>
          <th>Price</th>
          <th>Qty</th>
          <th>Amount</th>
        </tr>
      </thead>
    `;
    
    const tbody = document.createElement('tbody');
    let totalQuantity = 0;
    let totalAmount = 0;
    
    invoice.Items.forEach(item => {
      const quantity = parseFloat(item.Quantity) || 0;
      const amount = parseFloat(item.Amount) || 0;
      totalQuantity += quantity;
      totalAmount += amount;
      
      const tr = document.createElement('tr');
      const isMatch = searchQuery && item.Product && item.Product.toLowerCase().includes(searchQuery);
      if (isMatch) tr.className = 'highlighted-item';
      
      tr.innerHTML = `
        <td>${(item.Product).toProperCase() || 'N/A'}</td>
        <td>${formatCurrency(item.Price, invoice.Currency)}</td>
        <td>${quantity}</td>
        <td>${formatCurrency(amount, invoice.Currency)}</td>
      `;
      
      tbody.appendChild(tr);
    });
    
    // Total row
    tbody.innerHTML += `
      <tr class="total-row">
        <td colspan="2"><strong>Total</strong></td>
        <td><strong>${totalQuantity}</strong></td>
        <td><strong>${formatCurrency(totalAmount, invoice.Currency)}</strong></td>
      </tr>
    `;
    
    table.appendChild(tbody);
    detailsView.appendChild(table);
  } else {
    detailsView.innerHTML += '<p>No items found in this invoice.</p>';
  }
  
  // Total amount
  if (invoice.Sum) {
    const totalDiv = document.createElement('div');
    totalDiv.className = 'invoice-total';
    const amount = invoice.Sum.Figures || '0';
    const amountWords = invoice.Sum.Words || '';
    totalDiv.innerHTML = `
      Total Amount: <strong>${formatCurrency(amount, invoice.Currency)}</strong>
      ${amountWords ? `<div class="amount-words">(${amountWords})</div>` : ''}
    `;
    detailsView.appendChild(totalDiv);
  }
  
  elements.invoiceDetailsContent.appendChild(detailsView);
  elements.invoiceDetailsModal.classList.add('visible');

    const actionButtons = document.createElement('div');
    actionButtons.className = 'action-buttons';
    actionButtons.innerHTML = `
      <button class="edit-btn" data-id="${invoice.id}"><i class="fas fa-edit"></i> Edit</button>
      <button class="delete-btn" data-id="${invoice.id}"><i class="fas fa-trash"></i> Delete</button>
    `;
    detailsView.appendChild(actionButtons);
    
    // Add event listeners for the buttons
    actionButtons.querySelector('.edit-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      showEditInvoiceForm(invoice);
    });
    
    actionButtons.querySelector('.delete-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      showDeleteConfirmation(invoice.id);
    });
    
    elements.invoiceDetailsContent.appendChild(detailsView);
    elements.invoiceDetailsModal.classList.add('visible');
  }
  
  // Add these new functions
  function showDeleteConfirmation(invoiceId) {
    if (confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      deleteInvoice(invoiceId);
    }
  }
  
  function deleteInvoice(invoiceId) {
    // Find the invoice index
    const index = invoices.findIndex(inv => inv.id === invoiceId);
    if (index !== -1) {
      // Remove the invoice
      invoices.splice(index, 1);
      // Save changes
      saveInvoices();
      // Update the filtered list
      filteredInvoices = [...invoices];
      // Close the details modal
      elements.invoiceDetailsModal.classList.remove('visible');
      // Re-render the invoices
      renderInvoices();
      updateEmptyState();
    }
  }

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
