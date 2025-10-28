let subtotal;
let symbol;
const currencySelect = document.getElementById("currency");
const theme = document.getElementById("theme");
let taxField = document.getElementById("tax");
let discountField = document.getElementById("discount");

// Load saved values on page load
window.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");
  const savedCurrency = localStorage.getItem("currency");
  if (savedTheme) theme.value = savedTheme;
  if (savedCurrency) currencySelect.value = savedCurrency;
  updateCurrencySymbol();
});

currencySelect.addEventListener("change", () => {
  updateCurrencySymbol();
  localStorage.setItem("currency", currencySelect.value);
});
theme.addEventListener("change", () => {
  localStorage.setItem("theme", theme.value);
});

const saveDefault = () => {
  localStorage.setItem("theme", theme.value);
  localStorage.setItem("currency", currencySelect.value);
  alert("Success!");
};

function updateCurrencySymbol() {
  const selectedOption = currencySelect.options[currencySelect.selectedIndex];
  const match = selectedOption.text.match(/\((.*?)\)/);
  symbol = match ? match[1] : selectedOption.value;
  updateAmount();
  discountField.placeholder = discountField.placeholder === "%" ? "%" : symbol;
  taxField.placeholder = taxField.placeholder === "%" ? "%" : symbol;
}

const updateAmount = () => {
  const lineItems = document.querySelectorAll(".item");
  subtotal = Array.from(lineItems).map((item) => {
    const quantity = item.querySelector(".quantity");
    const rate = item.querySelector(".rate");
    const amount = item.querySelector(".amount");
    const total = Number(quantity.value) * Number(rate.value);
    amount.innerText =
      symbol +
      " " +
      total.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    rate.placeholder = symbol;
    return total;
  });
  updateAllTotal();
};

function updateAllTotal() {
  if (!subtotal) return;
  const discount = document.getElementById("discount");
  const tax = document.getElementById("tax");
  const shipping = document.getElementById("shipping");
  const roundTotal = document.getElementById("total");
  const amountPaid = document.getElementById("amountPaid");
  const balanceDue = document.getElementById("balanceDue");
  shipping.placeholder = symbol;
  amountPaid.placeholder = symbol;
  const subTotalAmount = subtotal.reduce((sum, num) => sum + num, 0);
  document.getElementById("subtotal").innerText =
    symbol +
    " " +
    subTotalAmount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  let roundTotalValue = 0;
  let taxValue = 0;

  roundTotalValue =
    discountField.placeholder === "%"
      ? subTotalAmount - (Number(discount.value) * subTotalAmount) / 100
      : subTotalAmount - Number(discount.value);
  taxValue =
    taxField.placeholder === "%"
      ? roundTotalValue + (Number(tax.value) * roundTotalValue) / 100
      : roundTotalValue + Number(tax.value);

  const totalDueValue = taxValue + Number(shipping.value);
  roundTotal.innerText =
    symbol +
    " " +
    totalDueValue.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  balanceDue.innerText =
    symbol +
    " " +
    (totalDueValue - Number(amountPaid.value)).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
}

const createNewLineItem = () => {
  let newLineItem = document.createElement("div");
  newLineItem.className = "item flex gap-2 group my-2 items-center";
  newLineItem.innerHTML = `
                        <input type="text" placeholder="Description of item/service..."
                            class="border border-[#c4cdd5b3] rounded-sm w-[30rem] h-[35px] px-3 focus:outline-none focus:ring-2 focus:ring-[#c4cdd5b3] focus:border-[#c4cdd5b3] description">
                        <input type="number" class="border border-[#c4cdd5b3] rounded-sm w-[7rem] h-[35px] px-3 focus:outline-none focus:ring-2 focus:ring-[#c4cdd5b3] focus:border-[#c4cdd5b3] quantity" oninput="updateAmount()" value="1">
                        <div class="flex items-center">
                        <input type="number" placeholder="$"
                            class="border border-[#c4cdd5b3] rounded-sm w-[8rem] h-[35px] px-3 focus:outline-none focus:ring-2 focus:ring-[#c4cdd5b3] focus:border-[#c4cdd5b3] rate" oninput="updateAmount()">
                        <span class="ps-7 me-3 text-[#677788] amount"></span></div>
                        <span
                            class="fas fa-times fa-md text-[#ffffff] hover:cursor-pointer group-hover:text-[#009E74] duration-200 ease-in"
                            onclick="removeNewItemLine(this)"></span>
                    `;
  document.getElementById("new-line").appendChild(newLineItem);
  updateAmount();
};

const removeNewItemLine = (div) => {
  div.parentNode.remove();
  updateAmount();
};

const createDiscountField = () => {
  document.getElementById("discountField").style.display = "flex";
  document.getElementById("discountBtn").style.display = "none";
};

const createTaxField = () => {
  document.getElementById("taxField").style.display = "flex";
  document.getElementById("taxBtn").style.display = "none";
};

const createShippingField = () => {
  document.getElementById("shippingField").style.display = "flex";
  document.getElementById("shippingBtn").style.display = "none";
};

const removeDiscountField = () => {
  document.getElementById("discountField").style.display = "none";
  document.getElementById("discountBtn").style.display = "inline";
  document.getElementById("discount").value = "";
  updateAmount();
};

const removeTaxField = () => {
  document.getElementById("taxField").style.display = "none";
  document.getElementById("taxBtn").style.display = "inline";
  document.getElementById("tax").value = "";
  updateAmount();
};

const removeShippingField = () => {
  document.getElementById("shippingField").style.display = "none";
  document.getElementById("shippingBtn").style.display = "inline";
  document.getElementById("shipping").value = "";
  updateAmount();
};

const changeDiscountBase = () => {
  discountField.placeholder = discountField.placeholder === "%" ? symbol : "%";
  updateAllTotal();
};

const changeTaxBase = () => {
  taxField.placeholder = taxField.placeholder === "%" ? symbol : "%";
  updateAllTotal();
};
