function goToHome() {
    window.location.href = 'index.html';
}

const sales = window.posAPI.getDailySales();

const salesHistory = document.getElementById('salesHistory');
sales.forEach(({ sale_date, sale }) => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${sale_date}</td><td>$${sale.toFixed(2)}</td>`;
    salesHistory.appendChild(row);
});

function searchByDate() {
    const selectedDate = document.getElementById('searchDate').value;
    const resultDiv = document.getElementById('searchResult');

    if (!selectedDate) {
        resultDiv.textContent = 'Por favor, selecciona una fecha.';
        return;
    }

    const result = sales.find(s => s.sale_date === selectedDate);

    if (result) {
        resultDiv.textContent = `Venta para ${selectedDate}: $${result.sale.toFixed(2)}`;
    } else {
        resultDiv.textContent = `No se encontró una venta para la fecha ${selectedDate}.`;
    }
}
