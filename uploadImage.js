const fileInput = document.getElementById("fileInput");
const uploadBox = document.getElementById("uploadBox");
const removeBtn = document.getElementById("removeBtn");

// 🔑 Global variable to hold the uploaded image (base64)
window.uploadedImageBase64 = null;

uploadBox.addEventListener("click", () => {
  if (!uploadBox.classList.contains("has-image")) {
    fileInput.click();
  }
});

fileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file && file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = (e) => {
      window.uploadedImageBase64 = e.target.result; // ✅ store base64 globally
      uploadBox.innerHTML = `<img src="${window.uploadedImageBase64}" alt="Logo Preview">`;
      uploadBox.appendChild(removeBtn);
      uploadBox.classList.add("has-image");
    };
    reader.readAsDataURL(file);
  }
});

removeBtn.addEventListener("click", (e) => {
  e.stopPropagation(); // prevent triggering upload click
  fileInput.value = "";
  window.uploadedImageBase64 = null; // ✅ clear when removed
  uploadBox.classList.remove("has-image");
  uploadBox.innerHTML = `<span><i class="fa fa-plus"></i> Add Your Logo</span>`;
  uploadBox.appendChild(removeBtn);
});
