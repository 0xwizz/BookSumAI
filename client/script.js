const form = document.querySelector('form');
const chatContainer = document.getElementById('chat-container');

const generateUniqueId = () => {
  return 'id-' + Math.random().toString(36).substr(2, 9);
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
  const paragraphs = text.split('\n\n').filter(Boolean);

  const typeParagraph = (paragraph, index) => {
    const paragraphEl = document.createElement('p');
    paragraphEl.style.marginBottom = '1em';

    messageDiv.querySelector('.bot-text').appendChild(paragraphEl);

    let currentChar = 0;
    const intervalId = setTimeout(function printText() {
      if (currentChar < paragraph.length) {
        paragraphEl.innerHTML += paragraph[currentChar];
        currentChar += 1;
        setTimeout(printText, charsPerInterval);
      } else {
        clearTimeout(intervalId);
        if (index < paragraphs.length - 1) {
          typeParagraph(paragraphs[index + 1], index + 1);
        }
      }
    }, charsPerInterval);
  };


  

  typeParagraph(paragraphs[0], 0);
};



let buttonClicked = false;

const handleSubmit = async (e) => {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);
  const skills = formData.get('skills');


  if (!skills) {
    const errorMessage = chatStripe(true, 'Please enter a question.', generateUniqueId());
    chatContainer.innerHTML += errorMessage;
    return;
  }

  if (buttonClicked) {
    return;
  }

  clearChatContainer();

  // Add loading stripe
  const loadingStripe = chatStripe(true, 'Satoshi is typing...', null, true);
  chatContainer.innerHTML += loadingStripe;

  try {
    buttonClicked = true;
    form.querySelector('button').setAttribute('disabled', true);

    const response = await fetch('https://booktest5.onrender.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        skills: skills,
    
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const parsedData = data.bot.trim(); // trims any trailing spaces/'\n'

    // Remove loading stripe
    const loadingStripeEl = document.querySelector('.bot-stripe .loader').parentNode.parentNode;
    loadingStripeEl.parentNode.removeChild(loadingStripeEl);

    // Add bot stripe with response
    const botStripe = chatStripe(true, '', generateUniqueId(), false); // add an empty text and isLoading=false to prevent the first plain text
    chatContainer.innerHTML += botStripe;
    const botStripeEl = document.querySelector(`#${botStripe.match(/id="(.*)"/)[1]}`);
    typeText(botStripeEl, parsedData);

  } catch (error) {
    console.error(error);
    // Remove loading stripe
    const loadingStripeEl = document.querySelector('.bot-stripe .loader').parentNode.parentNode;
    loadingStripeEl.parentNode.removeChild(loadingStripeEl);

    // Add error stripe
    const errorStripe = chatStripe(true, 'Sorry, an error occurred. Please try again later.', generateUniqueId(), false);
    chatContainer.innerHTML += errorStripe;

  } finally {
    setTimeout(() => {
      buttonClicked = false;
      form.querySelector('button').removeAttribute('disabled');
    }, 9000);
  }
};


form.addEventListener('submit', handleSubmit);