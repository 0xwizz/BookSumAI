const form = document.querySelector('form');
const chatContainer = document.getElementById('chat-container');

const generateUniqueId = () => {
  return Math.random().toString(36).substr(2, 9);
};

const chatStripe = (isBot, text, id, isLoading = false) => {
  const stripeClass = isBot ? 'bot-stripe' : 'user-stripe';
  const name = isBot ? ' ' : ' ';
  const uniqueId = id ? `id="${id}"` : '';
  const textClass = isBot ? 'bot-text' : 'user-text';

  let messageText = text;
  if (isLoading && !text) {
    messageText = '';
  }

  return `
    <div class="stripe ${stripeClass}">
      <div class="avatar">${name[0]}</div>
      <div class="text" ${uniqueId}>
        <div class="${textClass}">${messageText}</div>
        ${isLoading ? '<div class="loader"></div>' : ''}
      </div>
      <div class="gap"></div>
    </div>
  `;
};

const clearChatContainer = () => {
  chatContainer.innerHTML = '';
};

clearChatContainer();

const typeText = (messageDiv, text) => {
  const charsPerInterval = 5;
  const lines = text.split('\n').filter(Boolean); // Split text into individual lines
  let currentLine = 0;

  const intervalId = setInterval((lines) => {
    if (currentLine < lines.length) {
      const line = lines[currentLine];
      if (line.trim().startsWith("Overview:")) {
        messageDiv.querySelector('.bot-text').innerHTML += `<br />\n<b>${line}</b><br />\n`; // Add bold tags to Explanation
        messageDiv.querySelector('.bot-text').innerHTML += '<br />\n'; // Add line break
      } else if (line.trim().startsWith("Key Takeaways:")) {
        messageDiv.querySelector('.bot-text').innerHTML += `<br />\n<b>${line}</b><br />\n`; // Add bold tags to Decision
        messageDiv.querySelector('.bot-text').innerHTML += '<br />\n'; // Add line break
      } else if (line.trim().startsWith("-")) {
        messageDiv.querySelector('.bot-text').innerHTML += `${line}<br />\n`; // Add bullet point
      } else {
        messageDiv.querySelector('.bot-text').innerHTML += `${line}<br />\n`; // Add line break
      }
      currentLine += 1;
    } else {
      clearInterval(intervalId);
    }
  }, 50, lines);

 


};

const handleSubmit = async (e) => {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);
  const skills = formData.get('skills');
  const balance = formData.get('balance');

  clearChatContainer();

  // Add loading stripe
  const loadingStripe = chatStripe(true, 'Loading...', null, true);
  chatContainer.innerHTML += loadingStripe;

  const response = await fetch('https://booktest5.onrender.com', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      skills: skills,
      balance: balance,
    }),
  });

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim(); // trims any trailing spaces/'\n'
  
    // Remove loading stripe
    const loadingStripeEl = document.querySelector('.bot-stripe .loader').parentNode.parentNode;
    loadingStripeEl.parentNode.removeChild(loadingStripeEl);
  
    // Add bot stripe with response
    const botStripe = chatStripe(true, '', generateUniqueId(), false); // add an empty text and isLoading=false to prevent the first plain text
    chatContainer.innerHTML += botStripe;
    const botStripeEl = document.querySelector(`#${botStripe.match(/id="(.*)"/)[1]}`);

    setTimeout(() => {
      typeText(botStripeEl, parsedData);
    }, 90);
  }
};

form.addEventListener('submit', handleSubmit);
