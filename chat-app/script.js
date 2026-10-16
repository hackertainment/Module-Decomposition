let server = "http://18.163.75.90:3000"
let messages = [];

function makeArticleForMessage(message, index) {
  const card = document.getElementById("template-message").content.cloneNode(true);

  card.querySelector("span").innerHTML = message.user;
  card.querySelector("p").innerHTML = message.chat;
  card.querySelector("div").innerHTML = `<button id="like+${index}">&#128077;${message.like}</button> <button id="like-${index}">&#128078;${message.dislike}</button>`;

  return card;
};

async function fetchAllMessage() {
  const url = `${server}/`;
  const response = await fetch(url);
  const json = await response.json();

  messages = json;
  render();
};

async function fetchNewMessage() {
  const queryString = (messages.length>0 ? `?since=${messages[messages.length-1].createdAt}` : "");
  const url = `${server}/messages${queryString}`;
  const response = await fetch(url);
  const json = await response.json();

  messages.push(...json);
  render();
  setTimeout(fetchNewMessage, 1000);
}

async function submitMessage() {
  const form = document.getElementById("form-message");
  const options = {
    "method": form.method,
    "headers": {
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    "body": JSON.stringify(Object.fromEntries((new FormData(form)).entries()))
  };
  const response = await fetch(form.action, options);
  const text = await response.text();

  if (!response.ok) {
    console.error(response);
  }
  else {
    form.reset();
  }
  document.getElementById("status").innerHTML = response.status+" "+response.statusText.toUpperCase()+": "+text;
};

async function likeMessage(event) {
  const queryString = event.target.id.replace("like", "?like=");
  const url = `${server}/likes${queryString}`;
  const response = await fetch(url);
  const text = await response.text();

  let count = Number.parseInt(event.target.innerHTML.slice(2), 10)+1;
  event.target.innerHTML = event.target.innerHTML.slice(0, 2)+count;
  messages[Number.parseInt(event.target.id.slice(5), 10)][event.target.id.startsWith("like-") ? "dislike" : "like"] += 1;
  document.getElementById("status").innerHTML = response.status+" "+response.statusText.toUpperCase()+": "+text;
}

function render() {
  const messageElems = messages.map(makeArticleForMessage);

  document.getElementById("section-message").replaceChildren(...messageElems);
  for (let i=0; i<messages.length; i++) {
    document.getElementById("like+"+i).addEventListener("click", likeMessage);
    document.getElementById("like-"+i).addEventListener("click", likeMessage);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("new-chat").addEventListener("click", fetchAllMessage);
  document.getElementById("add-chat").addEventListener("click", submitMessage);
  fetchNewMessage();
});