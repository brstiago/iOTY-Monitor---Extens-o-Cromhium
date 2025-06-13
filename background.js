// Quando a extensão é instalada, cria o alarme
chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create('checkForNewRequests', { periodInMinutes: 1 });
});

// Executa verificação quando o alarme dispara
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'checkForNewRequests') {
    console.log("⏰ Verificação automática iniciada via alarm.");
    checkForNewRequests();
  }
});

// Executa verificação manual
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "checkNow") {
    console.log("🟢 Verificação manual iniciada via popup.");

    chrome.storage.local.get(['lastCount'], (result) => {
      const lastCount = result.lastCount || 0;

      chrome.notifications.create('', {
        type: 'basic',
        iconUrl: 'icon.png',
        title: '🔔 Teste de Notificação',
        message: `✅ A notificação está funcionando, inicialmente há ${lastCount} solicitações pendentes`,
        priority: 2
      });

      checkForNewRequests().then(() => {
        sendResponse();
      });
    });

    return true;
  }
});

async function checkForNewRequests() {
  try {
    const response = await fetch("https://ioty.linearsistemas.com.br/desenv/requests?utf8=%E2%9C%93&conditions%5Brequest_type_id.it%5D%5B%5D=1&conditions%5Bstatus_id.it%5D%5B%5D=1", {
      method: "GET",
      headers: {
        "Accept": "*/*;q=0.5, text/javascript, application/javascript, application/ecmascript, application/x-ecmascript",
        "X-Requested-With": "XMLHttpRequest"
      },
      credentials: "include"
    });

    const text = await response.text();
    console.log("📄 HTML retornado:", text);

    const match = text.match(/\$\("#requests-table"\)\.html\("([\s\S]*?)"\);/);

    if (!match) {
      console.log("❌ Regex não encontrou correspondência no HTML.");
      return;
    }

    // Etapa de desescape mais robusta
    const escapedHtmlRaw = match[1];

    const unescapedHtml = escapedHtmlRaw
      .replace(/\\"/g, '"')
      .replace(/\\n/g, '\n')
      .replace(/\\"/g, '"')
      .replace(/\\n/g, '')
      .replace(/\\\\/g, '\\')
      .replace(/\\\//g, '/')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&');

    console.log("📄 HTML desescapado:", unescapedHtml);

    // Conta as linhas da tabela (quantos <tr-request>) tem:
    const rowsCount = (unescapedHtml.match(/<tr id="tr-request-\d+" class="">/g) || []).length;
    console.log(`🔍 Total de <tr>: ${rowsCount}`);

    // Recupera o último valor salvo para comparar
    chrome.storage.local.get(['lastCount'], (result) => {
      const lastCount = result.lastCount || 0;

      if (rowsCount > lastCount) {
        chrome.notifications.create('', {
          type: 'basic',
          iconUrl: 'icon.png',
          title: '📥 Novas Solicitações!',
          message: `🔔 Você tem ${rowsCount - lastCount} nova(s) solicitação(ões), o total agora é: ${rowsCount}! `,
          priority: 2
        });
        
      } else if (rowsCount < lastCount) {
        chrome.notifications.create('', {
          type: 'basic',
          iconUrl: 'icon.png',
          title: '📥 Menos Solicitações Pendentes!',
          message: `🔔 Agora você tem ${lastCount} solicitação(ões) pendentes!`,
          priority: 2
        });
          
       } else {
        chrome.notifications.create('', {
          type: 'basic',
          iconUrl: 'icon.png',
          title: '📭 Nenhuma novidade',
          message: '✅ Nenhuma nova solicitação encontrada! `',
          priority: 2
        });
      }

      // Salva o novo valor
      chrome.storage.local.set({ lastCount: rowsCount });
    });

  } catch (e) {
    console.error("❌ Erro ao verificar novas solicitações:", e);
  }
}
