// Cria o botão
const botao = document.createElement('button');
botao.textContent = '🔍 Verificar Agora';
botao.style.position = 'fixed';
botao.style.top = '20px';
botao.style.left = '50%';
botao.style.transform = 'translateX(-50%)';
botao.style.padding = '10px 20px';
botao.style.backgroundColor = '#4CAF50';
botao.style.color = 'white';
botao.style.border = 'none';
botao.style.borderRadius = '5px';
botao.style.cursor = 'pointer';
botao.style.zIndex = '9999';

document.body.appendChild(botao);

// Ao clicar, chama o background
botao.addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: "checkNow" });
  alert('🔍 Verificação iniciada, apartir de agora a cada 10 minutos uma nova verificação será feita!');
});
