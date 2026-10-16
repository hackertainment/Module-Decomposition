import express from "express";
import cors from "cors";

const app = express();
const port = 3000;

const messages = [
  {
    chat: "Either write something worth reading or do something worth writing.",
    user: "Benjamin Franklin",
    like: 0,
    dislike: 0,
    updatedAt: Date.parse("1970-01-01T00:00:00Z"),
    createdAt: Date.parse("1970-01-01T00:00:00Z")
  },
  {
    chat: "I should have been more kind.",
    user: "Clive James",
    like: 0,
    dislike: 0,
    updatedAt: Date.parse("1995-12-04T00:12:00Z"),
    createdAt: Date.parse("1995-12-04T00:12:00Z")
  },
];
const postMessageCallbacks = [];

app.use(cors());

app.get("/", (req, res) => {
  res.send(JSON.stringify(messages));
});

app.get("/messages", (req, res) => {
  const lastMessageTime = (req.query.since===undefined ? -1 : req.query.since);
  const sinceLastMessages = messages.filter((message) => message.createdAt>lastMessageTime);
  res.send(JSON.stringify(sinceLastMessages));
  //if (sinceLastMessages.length==0) {
  //  postMessageCallbacks.push((value) => res.send(JSON.stringify(value)));  // Note: we need to use an arrow function here, rather than just pushing `res.send` directly, because of handling of `this` -- read more about it at https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this
  //}
  //else {
  //  res.send(JSON.stringify(sinceLastMessages));
  //}
});

app.get("/likes", (req, res) => {
  const queryString = req.query.like;
  if (queryString===undefined) {
    console.error(`Fail to parse query ${queryString}`);
    res.status(400).send("Expected query to be exist.");
    return;
  }
  if (Number.isNaN(Number.parseInt(queryString, 10))) {
    console.error(`Fail to extract like or dislike from get query: ${queryString}`);
    res.status(400).send("Expected query to be a positive or negative number.");
    return;
  }
  if (Number.parseInt(queryString, 10)>=messages.length) {
    console.error(`Fail to extract message from index: ${queryString}`);
    res.status(400).send("Expected query to be a valid index.");
    return;
  }
  let index = Number.parseInt(queryString, 10);
  if (queryString.startsWith("-")) {
    messages[-index].dislike += 1;
    messages[-index].updatedAt = Date.now();
    res.send("disliked");
  }
  else {
    messages[index].like += 1;
    messages[index].updatedAt = Date.now();
    res.send("liked");
  }
});

app.post("/", (req, res) => {
  const bodyBytes = [];
  req.on("data", chunk => bodyBytes.push(...chunk));
  req.on("end", () => {
    const bodyString = String.fromCharCode(...bodyBytes);
    let body;
    try {
      body = JSON.parse(bodyString);
    } catch (error) {
      console.error(`Failed to parse body ${bodyString} as JSON: ${error}`);
      res.status(400).send("Expected body to be JSON.");
      return;
    }
    if (typeof body != "object" || !("chat" in body) || !("user" in body)) {
      console.error(`Failed to extract chat and user from post body: ${bodyString}`);
      res.status(400).send("Expected body to be a JSON object containing keys chat and user.");
      return;
    }
    if (body.chat.trim()=="" || body.user.trim()=="") {
      console.error(`Failed to extract chat and user from empty value: ${bodyString}`);
      res.status(400).send("Expected body to be a JSON object containing non-empty values of chat and user.");
      return;
    }
    let now = Date.now();
    let newMessage = {
      chat: body.chat,
      user: body.user,
      like: 0,
      dislike: 0,
      updatedAt: now,
      createdAt: now
    };
    messages.push(newMessage);
    res.send("ok");
    //while (postMessageCallbacks.length > 0) {
    //  postMessageCallbacks.pop()([newMessage]);
    //}
  });
});

app.listen(port, () => {
  console.error(`Chat server listening on port ${port}`);
});