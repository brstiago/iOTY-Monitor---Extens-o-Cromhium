// popup.js
const button = document.getElementById('checkNow');

button.addEventListener('click', () => {
  button.disabled = true;
  button.innerHTML = 'Verificando... <span class="spinner"></span>';

  chrome.runtime.sendMessage({ action: 'checkNow' }, () => {
    button.disabled = false;
    button.innerHTML = 'Verificar agora';
  });
});
