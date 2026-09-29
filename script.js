const API = "https://www.thecocktaildb.com/api/json/v1/1/";

let group = [];
let drinksById = {};
let currentDrinks = [];

async function loadDefault() {
  try {
    const res = await fetch(API + "search.php?f=a");
    const data = await res.json();
    showDrinks(data.drinks || []);
  } catch (err) {
    console.error("Error loading default drinks:", err);
    document.getElementById("drinkList").innerHTML = "<p>Error loading API.</p>";
  }
}

async function searchDrinks() {
  const q = document.getElementById("searchInput").value.trim();
  
  if (q === "") {
    alert("Please enter a drink name or first letter");
    return;
  }

  try {
    const param = q.length === 1 ? "f=" : "s=";
    const res = await fetch(API + "search.php?" + param + encodeURIComponent(q));
    const data = await res.json();
    showDrinks(data.drinks || []);
  } catch (err) {
    console.error("Error searching drinks:", err);
  }
}

function showDrinks(drinks) {
  currentDrinks = drinks;
  const list = document.getElementById("drinkList");
  drinksById = {};

  if (drinks.length === 0) {
    list.innerHTML = "<div class='not-found'>Your searched drink is not found</div>";
    return;
  }

  let html = "";
  for (let i = 0; i < drinks.length; i++) {
    const d = drinks[i];
    drinksById[d.idDrink] = d;

    const fullInstr = d.strInstructions || "No instructions available.";
    const shortInstr = fullInstr.length > 15 
      ? fullInstr.substring(0, 15) + "..." 
      : fullInstr;

    const isSelected = group.some(item => item.idDrink === d.idDrink);
    const buttonHTML = isSelected
      ? `<button class="btn-add" disabled>Already Selected</button>`
      : `<button class="btn-add" onclick="addToCart('${d.idDrink}')">Add to Cart</button>`;

    html += `
      <div class="card">
        <img src="${d.strDrinkThumb}" alt="${d.strDrink}" />
        <div class="card-body">
          <p><span>Name:</span> ${d.strDrink}</p>
          <p><span>Category:</span> ${d.strCategory || "N/A"}</p>
          <p><span>Instructions:</span> ${shortInstr}</p>
          <div class="card-actions">
            ${buttonHTML}
            <button class="btn-details" onclick="showDetails('${d.idDrink}')">Details</button>
          </div>
        </div>
      </div>
    `;
  }
  list.innerHTML = html;
}

function addToCart(id) {
  if (group.length >= 7) {
    alert("You can't add more than 7 drinks!");
    return;
  }

  const d = drinksById[id];
  if (!d) return;

  if (group.some(item => item.idDrink === id)) {
    return;
  }

  group.push(d);
  updateCart();
  showDrinks(currentDrinks);
}

function updateCart() {
  document.getElementById("count").textContent = group.length;

  const tbody = document.getElementById("cartList");
  let html = "";

  for (let i = 0; i < group.length; i++) {
    const item = group[i];
    html += `
      <tr>
        <td>${i + 1}</td>
        <td><img src="${item.strDrinkThumb}" alt="" /></td>
        <td>${item.strDrink}</td>
      </tr>
    `;
  }
  tbody.innerHTML = html;
}

function showDetails(id) {
  const d = drinksById[id];
  if (!d) return;

  document.getElementById("modalContent").innerHTML = `
    <h2>${d.strDrink}</h2>
    <img src="${d.strDrinkThumb}" alt="${d.strDrink}" />
    <h3>Details</h3>
    <p><b>Category:</b> ${d.strCategory || "N/A"}</p>
    <p><b>Alcoholic:</b> ${d.strAlcoholic || "N/A"}</p>
    <p><b>Glass:</b> ${d.strGlass || "N/A"}</p>
    <p><b>IBA:</b> ${d.strIBA || "N/A"}</p>
    <p><b>Instructions:</b> ${d.strInstructions || "N/A"}</p>
  `;

  document.getElementById("modal").classList.add("open");
}

function closeModal() {
  document.getElementById("modal").classList.remove("open");
}

document.getElementById("searchBtn").onclick = searchDrinks;

document.getElementById("searchInput").addEventListener("keydown", function (e) {
  if (e.key === "Enter") searchDrinks();
});

document.getElementById("closeModal").onclick = closeModal;

loadDefault();