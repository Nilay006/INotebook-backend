const express = require("express");
const router = express.Router();
const fetchuser = require("../midelware/fetchuser");
const Note = require("../models/Note");
const { body, validationResult } = require("express-validator");

//Route 1 : get all the notes: Get "/api/notes/fetchallnotes" login requared
router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.error(error.massage);
    res.status(500).send("Some Error Occured");
  }
});

//Route 2 : add a new note: Post "/api/notes/addnote"  login requared
router.post(
  "/addnote",
  fetchuser,
  [
    body("title", "Enter a valid title").isLength({ min: 3 }),
    body("description", "Description must be atleast 5 character").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;
      // if there are errors, return bad request and error
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const note = new Note({
        title,
        description,
        tag,
        user: req.user.id,
      });

      const saveNote = await note.save();

      res.json(saveNote);
    } catch (error) {
      console.error(error.massage);
      res.status(500).send("Some Error Occured");
    }
  }
);

//Route 3 : update existing note: put "/api/notes/updatenote"  login requared
router.put("/updatenote/:id", fetchuser, async (req, res) => {
  const { title, description, tag } = req.body;
  try {
    // Create new note object
    const newNote = {};
    if (title) {
      newNote.title = title;
    }
    if (description) {
      newNote.description = description;
    }
    if (tag) {
      newNote.tag = tag;
    }

    // find note to be updated
    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(400).send("Not Found");
    }

    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }

    note = await Note.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );
    res.json(note);
  } catch (error) {
    console.error(error.massage);
    res.status(500).send("Some Error Occured");
  }
});

//Route 4 : delete existing note: delete "/api/notes/deletenote"  login requared
router.delete("/deletenote/:id", fetchuser, async (req, res) => {
  try {
    // find note to be delete
    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(400).send("Not Found");
    }
    // Allow deletion only if user owns this Note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }

    note = await Note.findByIdAndDelete(req.params.id);
    res.json({ Success: "Note has been deleted", note: note });
  } catch (error) {
    console.error(error.massage);
    res.status(500).send("Some Error Occured");
  }
});

module.exports = router;
