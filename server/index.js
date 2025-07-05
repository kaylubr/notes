require('dotenv').config()
const express = require('express')
const Note = require("./models/note")

const app = express()

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

app.use(express.static('dist'))
app.use(express.json())
app.use(requestLogger)

// GET all resource
app.get("/api/notes", (request, response) => {
  Note.find({}).then(notes => {
    response.json(notes)
  })
})

// GET single resource
app.get("/api/notes/:id", (request, response, next) => {
  Note.findById(request.params.id)
  .then(note => {
    if (note) {
      response.json(note)
    } else {
      response.status(404).end()
    }
  })
  .catch(error => next(error))
})

// DELETE 
app.delete("/api/notes/:id", (request, response, next) => {
  Note.findByIdAndDelete(request.params.id)
  .then(result => response.status(204).end())
  .catch(error => next(error))
})

// POST
app.post("/api/notes", (request, response, next) => {
  const body = request.body

  const note = new Note({
    content: body.content,
    important: body.important || false,
  })

  note.save()
  .then(savedNote => {
    response.json(savedNote)
  })
  .catch(error => next(error))
})

app.put("/api/notes/:id", (request, response, next) => {
  const { content, important } = request.body

  Note.findByIdAndUpdate(request.params.id)
    .then(note => {
      if (!note) {
        return response.status(404).end()
      }

      note.content = content
      note.important = important

      return note.save().then(updatedNote => {
        response.json(updatedNote)
      }) 
    })
    .catch(error => next(error))
})

app.use((error, request, response, next) => {
  console.log(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: "Malformatted id" })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})

