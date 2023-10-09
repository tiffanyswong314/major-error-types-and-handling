const express = require("express");
const app = express();

const path = require("path");
const notes = require(path.resolve("src/data/notes-data"));

app.use(express.json());

// 2. move the validation logic GET /notes/:noteId into its own middleware function
function noteWithId(req, res, next) {
  const noteId = Number(req.params.noteId);
  const foundNote = notes.find((note) => note.id === noteId);
  if (foundNote) {
    return next();
  } else {
    // 2. in event of an error, validation middleware should call next() with an error object
    next({
      status: 404,
      message: `Note id not found: ${req.params.noteId}`,
    })
  }
};

app.get(
  "/notes/:noteId",
  noteWithId,
  (req, res) => {
  const noteId = Number(req.params.noteId);
  const foundNote = notes.find((note) => note.id === noteId);
  // if (foundNote) {
    res.json({ data: foundNote });
  // } else {
  //   return next(`Note id not found: ${req.params.noteId}`);
  // }
});

app.get("/notes", (req, res) => {
  res.json({ data: notes });
});

let lastNoteId = notes.reduce((maxId, note) => Math.max(maxId, note.id), 0);

// 3. move the validation logic POST /notes into its own middlware function
function postContainsText(req, res, next) {
  const { data: { text } = {} } = req.body;
  if (text) {
    return next();
  } else {
    // 3. in event of an error, validaiton middleware should call next() with an error object
    return next({
      status: 400,
      message: "A 'text' property is required.",
    })
  }
};

app.post(
  "/notes", postContainsText,
  (req, res) => {
    const { data: { text } = {} } = req.body;
    // if (text) {
      const newNote = {
        id: ++lastNoteId, // Increment last id then assign as the current ID
        text,
      };
      notes.push(newNote);
      res.status(201).json({ data: newNote });
  // } else {
    // res.sendStatus(400);
  // }
});

// Not found handler
app.use((req, res, next) => {
  next({
    status: 404,
    message: `Not found: ${req.originalUrl}`,
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error(error);
  // 1. returns a 500 status code by default
  const {
    status = 500,
    message = 'Something went wrong!',
  } = error
  // 1. or returns status property of the error object
  // 1. returns a JSON response formatted like { error: '<error-meessage-here>' }
  res.status(status).json({ error: message });
});

module.exports = app;
