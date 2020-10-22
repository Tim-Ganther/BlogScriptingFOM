const path = require('path');
const expressEdge = require('express-edge');
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');

const app = new express();

app.use(express.static('assets'));
app.use(expressEdge.engine);
app.set('views', __dirname + '/views');
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(session({ 
    secret: 'BlaBlaBla', 
    resave: true,
    saveUninitialized: true
})) 

let db = new sqlite3.Database('sqlite.db', sqlite3.OPEN_READWRITE,  (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the sqlite database.');
});



app.get('/', (req, res) => {
  sess=req.session;
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
    sess=req.session;
    res.render('neuer-post');
});

app.post('/posts/speichern', (req, res) => {
  sess=req.session;
  db.serialize(() => {
    db.run(`INSERT INTO posts (title, content) VALUES ("`+req.body.title+`", "`+req.body.content+`");`, (err) => {
      if (err) {
        console.error(err.message);
      }
    });
  });
  res.redirect('/');
});

app.post('/posts/entfernen', (req, res) => {
  sess=req.session;
  db.serialize(() => {
    db.run('DELETE FROM posts WHERE id = '+req.body.id, (err, row) => {
      if (err) {
        console.error(err.message);
      }
    });
  });
  res.redirect('/');
});

app.get('/posts/:id', (req, res) => {
  sess=req.session;
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
    sess=req.session;
    res.render('hinweise');
});

app.get('/login', (req, res) => {
    sess=req.session;
    if(req.session.username){
      res.redirect('/');
    }else{
      res.render('login');
    }
});

app.post('/login', (req, res) => {
  sess=req.session;
  if(sess.username){
    res.redirect('/');
  }else{
    db.serialize(() => {
      db.get(`SELECT * FROM users WHERE username = "`+req.body.username+`";`, (err, row) => {
        if (err) {
          console.error(err.message);
        }
      if(row){
        if(req.body.password == row.password){
          req.session.username = row.username;
          res.redirect('/');
        }else{
          res.redirect('/login?error=true');
        }
      }else{
        res.redirect('/login?error=true');
      }
      });
    });
  }
});
app.get('/logout', (req, res) => {
    sess=req.session;
    sess.destroy(function(error){ 
        console.log("Session Destroyed") 
    }) 
    res.redirect('/');
});


app.listen(3000, () => {
  console.log('server started');
});