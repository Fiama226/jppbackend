const express = require('express')
const { Pool } = require('pg');

var cors = require('cors');
const PORT = process.env.PORT || 8080
const bodyParser = require('body-parser');
const app = express()
app.use(cors());
const ADD_Product_Backend=require('./Add_Product_Backend')
const pgp = require('pg-promise')(/* options */)
const db = pgp('postgres://postgres:password@localhost:5432/postgres')
app.use(express.static('Images'))
app.use(bodyParser.json())
//console.log(ADD_Product_Backend)
const pool = new Pool({
  user: 'postgres',
  host: '0.0.0.0',
  database: 'postgres',
  password: 'password',
  port: 5432,
});
pool.connect((err, client, done) => {
  if (err) {
      console.error('Error connecting to PostgreSQL:', err);
  } else {
      console.log('Connected to PostgreSQL database');
  }
  done();
});


db.many('SELECT * from Products')
  .then((data) => {
    console.log('DATA:', data)
  })
  .catch((error) => {
    console.log('ERROR:', error)
  })

app.get('/commandes',(req, res) => {
  db.many('SELECT * FROM commandes').then((data) => {
      res.status(200).send(data)
      console.log(data)
  })
})

app.post('/commandes', (req, res)=>{
  res.send(req.body)
  db.none('INSERT INTO commandes (date,detailsdelafacture,modedepayement,nomduclient,numerodetelephoneduclient,villeduclient,montantdelacommande,numerodefacture) VALUES(${dateAndTime},$[cart_products],${modedepayment},${nom},${numero},${ville },${totalamountoforder},${numerodefacture})',req.body)
 console.log(req.body)
})

app.get('/', (req, res) => {
  console.log('user hit the resource')
  res.status(200).send('this is the home page')
})
app.get('/home', (req, res) => {
    db.many('SELECT * FROM Products').then((data) => {
        res.status(200).send(data)
    })
  
})

app.post('/Add_Loan_Today', (req, res)=>{
  res.send(req.body)
  db.none('INSERT INTO loan_today(nom,prix,commentaire,temps) VALUES(${nom},${prix},${commentaire},${temps})',req.body)
  console.log(req.body)
})
app.get('/TodayLoanData', (req, res)=>{
  //db.many('SELECT * FROM loan_today').then((data) => {
   //   res.status(200).send(data)
  //})
  res.send("this is Today Loan , thank god i am working")
})
app.delete('/DelTodayLoanData/:nom', (req, res)=>{
  db.none('DELETE FROM loan_today WHERE nom =$1',req.params.nom)
  res.send(req.body.nom)
}
)

app.post('/addProduct',ADD_Product_Backend.single('image'), (req, res)=>{
  if(req.file){
    res.send("Upload succesfuly")
    console.log("Upload succesfuly")
    console.log(req.body)
    db.none('INSERT INTO products(name,price,image_source,brand,type,Description) VALUES(${name},${price},${image},${brand},${type},${description})',req.body)
  }
  else{
    res.send("Upload failed")
    console.log("Upload failed")
  }

})

app.delete('/deleteProduct/:nom', (req, res)=>{
  db.none('DELETE FROM products WHERE name =$1',req.params.nom)
  console.log("Deleted one is:",req.params.nom)
})
app.listen(PORT, () => {
  console.log('server is listening on port 5000...')
})