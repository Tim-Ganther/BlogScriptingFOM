const path = require('path');
const expressEdge = require('express-edge');
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = new express();

app.use(express.static('assets'));
app.use(expressEdge.engine);
app.set('views', __dirname + '/views');
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}));

let db = new sqlite3.Database('sqlite.db', sqlite3.OPEN_READWRITE,  (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the sqlite database.');
});

app.get('/', (req, res) => {
  let result = [];
  db.serialize(() => {
    db.each('SELECT * FROM posts ORDER BY id DESC', (err, row) => {
      if (err) {
        console.error(err.message);
      }
      //console.log(row.id + "\t" + row.title + "\t" + row.content);
      result.push({"id": row.id, "title": row.title, "content": row.content.substring(0, 100)+"..."});
    });
  });
  res.render('index', {result})
});

app.get('/posts/neu', (req, res) => {
    res.render('neuer-post');
});

app.post('/posts/speichern', (req, res) => {
  db.serialize(() => {
    db.each(`INSERT INTO posts (title, content) VALUES ("`+req.body.title+`", "`+req.body.content+`");`, (err) => {
      if (err) {
        console.error(err.message);
      }
    });
  });
  res.redirect('/');
});

app.post('/posts/entfernen', (req, res) => {
  db.serialize(() => {
    db.each('DELETE FROM posts WHERE id = '+req.body.id, (err, row) => {
      if (err) {
        console.error(err.message);
      }
    });
  });
  res.redirect('/');
});

app.get('/posts/:id', (req, res) => {
  let result;
  db.serialize(() => {
    db.each('SELECT * FROM posts WHERE id = '+req.params.id, (err, row) => {
      if (err) {
        console.error(err.message);
      }
      result = {"id": row.id, "title": row.title, "content": row.content.split(/(?:\n)/g)};
      res.render('post', {result});
    });
  });
});
app.get('/hinweise', (req, res) => {
    res.render('hinweise');
});

app.listen(3000, () => {
  console.log('server started');
});