let datos = {};
let usuarioActivo = null;

const loginScreen = document.getElementById("login-screen");
const dashboardScreen = document.getElementById("dashboard-screen");
const btnLogin = document.getElementById("btnLogin");
const btnLogout = document.getElementById("btnLogout");
const userInput = document.getElementById("user");
const passInput = document.getElementById("pass");
const accountsDiv = document.getElementById("accounts");
const fromAccount = document.getElementById("fromAccount");
const toAccount = document.getElementById("toAccount");
const amountInput = document.getElementById("amount");
const btnTransfer = document.getElementById("btnTransfer");
const movementsList = document.getElementById("movements-list");

fetch("datos.json")
  .then(res => res.json())
  .then(data => datos = data);

btnLogin.addEventListener("click", () => {
  const user = userInput.value;
  const pass = passInput.value;
  const found = datos.usuarios.find(u => u.usuario === user && u.contrasena === pass);

  if (found) {
    usuarioActivo = found;
    toggleScreens();
    renderAccounts();
  } else {
    Swal.fire("Error", "Credenciales inválidas", "error");
  }
});

btnLogout.addEventListener("click", () => {
  usuarioActivo = null;
  toggleScreens();
});

function toggleScreens() {
  loginScreen.classList.toggle("hidden");
  dashboardScreen.classList.toggle("hidden");
}

function renderAccounts() {
  accountsDiv.innerHTML = "";
  usuarioActivo.cuentas.forEach(c => {
    const div = document.createElement("div");
    div.className = "account-card";
    div.innerHTML = `
      <span>${c.tipo} (${c.id})</span>
      <strong>$ ${c.saldo.toFixed(2)}</strong>
    `;
    accountsDiv.appendChild(div);
  });

  populateTransfers();
}

function populateTransfers() {
  const opciones = usuarioActivo.cuentas.map(c => `<option value="${c.id}">${c.tipo} (${c.id})</option>`);
  fromAccount.innerHTML = opciones.join("");
  toAccount.innerHTML = opciones.join("");
  document.getElementById("transfer-section").classList.remove("hidden");
}

btnTransfer.addEventListener("click", () => {
  const from = usuarioActivo.cuentas.find(c => c.id === fromAccount.value);
  const to = usuarioActivo.cuentas.find(c => c.id === toAccount.value);
  const amount = parseFloat(amountInput.value);

  if (!amount || amount <= 0) {
    Swal.fire("Error", "Ingresá un monto válido", "warning");
    return;
  }

  if (from.id === to.id) {
    Swal.fire("Error", "Elige cuentas distintas", "warning");
    return;
  }

  if (from.saldo < amount) {
    Swal.fire("Error", "Saldo insuficiente", "warning");
    return;
  }

  from.saldo -= amount;
  to.saldo += amount;
  agregarMovimiento(from.id, to.id, amount);
  renderAccounts();
  renderMovements();

  Swal.fire("Transferencia exitosa", `Transferiste $${amount.toFixed(2)}`, "success");
});

function agregarMovimiento(orig, dest, monto) {
  datos.movimientos.push({ orig, dest, monto, fecha: new Date().toLocaleString() });
}

function renderMovements() {
  movementsList.innerHTML = datos.movimientos.map(m =>
    `<li>${m.fecha}: $${m.monto.toFixed(2)} de ${m.orig} a ${m.dest}</li>`
  ).join("");
}
