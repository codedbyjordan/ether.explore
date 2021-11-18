const client = new WebSocket(`ws://${window.location.hostname}`);
const blockNumText = document.getElementById("current-block");
const priceText = document.getElementById("current-price");
const prevPriceText = document.getElementById("previous-price");

client.addEventListener("message", (event) => {
  let data = JSON.parse(event.data);
  let blockNum = data.blockNum;
  let price = data.price;
  let prevPrice = priceText.textContent.replace(/[^0-9.]/g, "");

  if (prevPrice !== price) {
    if (price > prevPrice) {
      priceText.classList.remove("text-red-500");
      priceText.classList.add("text-green-500");
      priceText.textContent = `$${price} ▲`;
    } else if (price < prevPrice) {
      priceText.classList.remove("text-green-500");
      priceText.classList.add("text-red-500");
      priceText.textContent = `$${price} ▼`;
    }
    prevPriceText.textContent = `$${prevPrice}`;
  }

  blockNumText.textContent = blockNum;
});
