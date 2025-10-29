// Form utilities shared across pages
// Exposes both global functions and a namespaced object at window.utils.forms

(function(){
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function setError(inputEl, labelSpanEl, message) {
    if (inputEl) inputEl.classList.add("is-invalid");
    if (labelSpanEl) labelSpanEl.textContent = `- ${message}`;
  }

  function clearError(inputEl, labelSpanEl) {
    if (inputEl) inputEl.classList.remove("is-invalid");
    if (labelSpanEl) labelSpanEl.textContent = "";
  }

  function attachLiveClear(inputEl, labelSpanEl) {
    if (!inputEl) return;
    const evt = inputEl.tagName === "SELECT" || inputEl.type === "checkbox" ? "change" : "input";
    inputEl.addEventListener(evt, () => clearError(inputEl, labelSpanEl));
  }

  // Expose as globals (back-compat)
  window.EMAIL_REGEX = EMAIL_REGEX;
  window.setError = setError;
  window.clearError = clearError;
  window.attachLiveClear = attachLiveClear;

  // Expose as namespaced utils
  window.utils = window.utils || {};
  window.utils.forms = { EMAIL_REGEX, setError, clearError, attachLiveClear };
})();
