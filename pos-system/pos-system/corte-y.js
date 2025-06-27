function goToHome() {
  window.location.href = 'index.html';
}

window.onload = () => {
  const sales = window.posAPI.getHourlySales(); 

  const tbody = document.getElementById('hourlySalesBody');
  sales.forEach(({ hour, total }) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${hour}</td>
      <td>$${total.toFixed(2)}</td>
    `;
    tbody.appendChild(row);
  });
};
