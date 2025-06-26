
//   const productDB = {
//     "123456789012": { name: "Milk", price: 2.5 },
//     "987654321098": { name: "Bread", price: 1.75 },
//     "111222333444": { name: "Eggs", price: 3.0 },
//     "1": { name: "Mercancías Generales", price: 0 }
//   };

  const cart = {};
  const barcodeInput = document.getElementById("barcodeInput");
  const cartTableBody = document.querySelector("#cartTable tbody");
  const grandTotalDisplay = document.getElementById("grandTotal");
  const errorBox = document.getElementById("errorBox");
  const messageBox = document.getElementById("messageBox");

  const quantityModal = document.getElementById("quantityModal");
  const quantityInput = document.getElementById("quantityInput");

  const priceModal = document.getElementById("priceModal");
  const priceInput = document.getElementById("priceInput");

  let currentBarcode = "";
  let currentPriceOverride = null;

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

    grandTotalDisplay.textContent = `Total: $${total.toFixed(2)}`;
  }

  function checkout() {
    if (Object.keys(cart).length === 0) {
      showError("El carrito está vacío.");
      return;
    }

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
    messageBox.style.display = "block";
    focusInput();
    setTimeout(() => {
      messageBox.style.display = "none";
      messageBox.textContent = "";
    }, 2000);
  }

  window.onload = focusInput;