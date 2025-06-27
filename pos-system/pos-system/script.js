
  const cart = {};
  const barcodeInput = document.getElementById("barcodeInput");
  const cartTableBody = document.querySelector("#cartTable tbody");
  const grandTotalDisplay = document.getElementById("grandTotal");
  const errorBox = document.getElementById("errorBox");
  const messageBox = document.getElementById("messageBox");
  const messageContainer = document.getElementById("messageContainer");

  const quantityModal = document.getElementById("quantityModal");
  const quantityInput = document.getElementById("quantityInput");

  const priceModal = document.getElementById("priceModal");
  const priceInput = document.getElementById("priceInput");

  const navigation = document.getElementById("navigation");
  navigation.style.display = "none";

  const container = document.getElementById('tableContainer');

  const clearMessageButton = document.getElementById("clearMessageButton");

  let currentBarcode = "";
  let currentPriceOverride = null;

  let currentTotal = 0;

  function toggleNavigation() {
    if (navigation.style.display === "block") {
      navigation.style.display = "none";
    } else {
      navigation.style.display = "block";
    }
  }

  function focusInput() {
    barcodeInput.focus();
    barcodeInput.select();
  }
barcodeInput.addEventListener("keypress", function (e) {

  if (e.key === "Enter") {
    const barcode = barcodeInput.value.trim();
    barcodeInput.value = "";

    if (!barcode) {
      return;
    }

    if (barcode === "1") {
      currentBarcode = barcode;
      currentPriceOverride = null;
      window.currentProduct = {
        name: "Mercancías Generales"
      };
      showPriceModal();
      return;
    }

    const product = window.posAPI.getProductByBarcode(barcode);
    console.log("Product from DB:", product);

    if (!product) {
      showError("Producto no encontrado.");
      return;
    }

    currentBarcode = barcode;
    currentPriceOverride = null;
    window.currentProduct = product;
    showQuantityModal();
  }
});


  priceInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") confirmPrice();
  });

  quantityInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") confirmQuantity();
  });

  function showPriceModal() {
    priceInput.value = ""; 
    priceModal.style.display = "block";
    setTimeout(() => priceInput.focus(), 100);
  }

  function hidePriceModal() {
    priceModal.style.display = "none";
  }

  function confirmPrice() {
    const price = parseFloat(priceInput.value);
    if (!price || isNaN(price) || price <= 0) {
      price = 1;
    }
    currentPriceOverride = price;
    hidePriceModal();
    showQuantityModal();
  }

  function showQuantityModal() {
    quantityInput.value = "1"; 
    quantityModal.style.display = "block";
    setTimeout(() => quantityInput.focus(), 100);
  }

  function hideQuantityModal() {
    quantityModal.style.display = "none";
  }

  function confirmQuantity() {
    const quantity = parseInt(quantityInput.value);
    hideQuantityModal();

    if (isNaN(quantity) || quantity <= 0) {
      quantity = 1;
    }

    const product = window.currentProduct;
    const itemKey = currentBarcode + (currentPriceOverride ?? "");

    if (cart[itemKey]) {
      cart[itemKey].quantity += quantity;
    } else {
      cart[itemKey] = {
        name: product.name,
        price: currentPriceOverride ?? product.price,
        quantity,
        barcode: currentBarcode
      };
    }

    updateCartDisplay();
    focusInput();
  }

  function updateCartDisplay() {
    cartTableBody.innerHTML = "";
    let total = 0;

    for (const key in cart) {
      const item = cart[key];
      const itemTotal = item.quantity * item.price;
      total += itemTotal;

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.name}</td>
        <td>${item.barcode}</td>
        <td>${item.quantity}</td>
        <td>$${item.price.toFixed(2)}</td>
        <td>$${itemTotal.toFixed(2)}</td>
      `;
      cartTableBody.appendChild(row);
    }

    currentTotal = total.toFixed(2);
    grandTotalDisplay.textContent = `Total: $${total.toFixed(2)}`;
    container.scrollTop = container.scrollHeight;
  }

  function cancelTransaction() {
    currentTotal = 0;
    Object.keys(cart).forEach(k => delete cart[k]);
    updateCartDisplay();
    focusInput();
    showMessage("Transacción cancelada.");
  }

  function checkout() {
    if (Object.keys(cart).length === 0) {
      showError("El carrito está vacío.");
      return;
    }

    window.posAPI.logSale(currentTotal);
    currentTotal = 0;
    showMessage("Transacción Completada!");
    Object.keys(cart).forEach(k => delete cart[k]);
    updateCartDisplay();
    focusInput();
  }

  function showError(message) {
    errorBox.textContent = message;
    errorBox.style.display = "block";
    focusInput();
    setTimeout(() => {
      errorBox.style.display = "none";
      errorBox.textContent = "";
    }, 2000);
  }

  function showMessage(message) {
    messageBox.textContent = message;
    messageContainer.style.display = "flex";
    focusInput();
    setTimeout(() => {
      messageContainer.style.display = "none";
      messageBox.textContent = "";
    }, 2000);
  }

  function logDailySale() {
    window.posAPI.logDailySale();
    getCurrentSale();
  }

  function getCurrentSale() {
    const currentSale = window.posAPI.getCurrentSale();
    messageBox.textContent = `Venta del día: $${currentSale.toFixed(2)}`;
    messageContainer.style.display = "flex";
    clearMessageButton.style.display = "block";
  }

  function clearMessage() {
    focusInput();
    clearMessageButton.style.display = "none";
    messageContainer.style.display = "none";
    messageBox.textContent = "";
  }

  window.onload = focusInput;