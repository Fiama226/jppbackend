const express = require('express')
const { localStorage } = require("./local_storage_config");
pdf = require('express-pdf');
const puppeteer = require('puppeteer');
const fs = require('fs');
const { Pool } = require('pg');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  secure: true
});
require('dotenv').config()
//const ADD_Product_Backend=require('./Add_Product_Backend')
const { Connector } = require('@google-cloud/cloud-sql-connector');
var cors = require('cors');
const PORT = process.env.PORT || 8080
const bodyParser = require('body-parser');
const app = express()
app.use(cors());
app.use(bodyParser.json())
app.use(pdf);
const upload = multer({ storage: multer.memoryStorage()})
const connector = new Connector();
const clientOptsfunction = async ()=>{ await connector.getOptions({
    instanceConnectionName: process.env.INSTANCE_CONNECTION_NAME,
    authType: 'IAM'
});
}
const clientOpts=clientOptsfunction()

const pool = new Pool({
  user: process.env.DB_USER,
  host:process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port:5432
});



localStorage.setItem('myKey', 'KABORE Pawendtaore landry');
//console.log("the module imported is:",localStorage)
const value = localStorage.getItem('myKey');
console.log(value);




app.get('/',(req, res) => { 
      res.status(200).send("HI , i am the home page , made by landry")
})


//pool = new Pool({
  //user: 'postgres',
  //host: 'db',
  //password: 'root',
  //port: 5432,
  //database: 'postgres',
//})


var chekifconnected="";
pool.connect((err, client, done) => {
  if (err) {
      console.error('Error connecting to PostgreSQL:,', err);
      chekifconnected=err
  } else {
      console.log('Connected to PostgreSQL database');
  }
  done();
});



app.get('/commandes',(req, res) => { 
  pool.query(' SELECT * FROM commandes').then((result) => {
    res.status(200).send(result.rows)

  })
  .catch((error) => {
    console.error('Error executing query:', error);
    res.status(500).send('Error executing query, check if connected is:', error);
  });
})

app.get('/printCommande',(req, res) => { 
  pool.query(' SELECT * FROM commandes WHERE nomduclient = $1',["Lionnelle"]).then((result) => {
    res.status(200).send(result.rows)

  })
  .catch((error) => {
    console.error('Error executing query:', error);
    res.status(500).send('Error executing query, check if connected is:', error);
  });
})

app.get('/home',(req, res) => { 
  pool.query(' SELECT * FROM products').then((result) => {
    res.status(200).send(result.rows)

  })
  .catch((error) => {
    console.error('Error executing query');
    res.status(500).send('Error executing query');
  });
})

app.get('/TodayLoanData',(req, res) => { 
  pool.query(' SELECT * FROM loan_today').then((result) => {
    res.status(200).send(result.rows)

  })
  .catch((error) => {
    console.error('Error executing query:', error);
    res.status(500).send('Error executing query');
  });
})

app.post('/Add_Loan_Today', (req, res)=>{
  res.send(req.body)
  pool.query('INSERT INTO loan_today(nom,prix,commentaire,temps) VALUES($1, $2,$3, $4)',[req.body.nom,req.body.prix,req.body.commentaire,req.body.temps]).catch((error)=>{console.error})
  console.log(req.body)
})

app.post('/commandes', (req, res)=>{
  res.send(req.body)
  try {
  pool.query('INSERT INTO commandes(nomduclient,numerodefacture,date,modedepayement,montantdelacommande,villeduclient,numerodetelephoneduclient,detailsdelafacture) VALUES($1, $2,$3, $4,$5, $6,$7, $8)',[req.body.nom,req.body.numerodefacture,req.body.dateAndTime,req.body.modedepayment,req.body.totalamountoforder,req.body.ville,req.body.numero,req.body.cart_products])
     }catch (error) {
      console.error('Error executing query:', error);
      res.status(500).send('Erreur lors de l\'insertion de la commande'); // Respond with an error message
    }
})

app.post('/addProduct',upload.single("file"),function (req, res,next){
  console.log(req.body)
  console.log(req.file)
  pool.query('INSERT INTO products(name,price,image_source,brand,type,Description) VALUES($1,$2,$3,$4,$5,$6)',[req.body.name, req.body.price,req.body.image,req.body.brand,req.body.type,req.body.description])

}
)


app.delete('/DelTodayLoanData/:nom', (req, res)=>{
  pool.query('DELETE FROM loan_today WHERE nom =$1',[req.params.nom]).catch((error)=>{console.error})
  console.log(" The params are: ",req.params)
}
)

app.delete('/deleteProduct/:nom', (req, res)=>{
  pool.query('DELETE FROM products WHERE name =$1',[req.params.nom]).catch((error)=>{console.error})
  console.log("Deleted one is:",req.params.nom)
})

app.get('/printpdf', async (req, res)=>{
  async function generatePDF() {
    const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox']});
    const page = await browser.newPage();
    const htmlContent = fs.readFileSync('./facture.html', 'utf8');
    //await page.setContent(htmlContent,{waitUntilDone: true});
    await page.setContent(htmlContent,{waitUntil: 'networkidle0'});
    await new Promise(resolve => setTimeout(resolve, 5000));
    await page.pdf({ path: 'output.pdf', format: 'A4' });
    await browser.close();
  }
  
  generatePDF();
  //res.download("./output.pdf")
  var data =fs.readFileSync('output.pdf');
res.contentType("application/pdf");
res.contentType("application/pdf");
res.send(data);

console.log("printpdf hitted")
})

app.listen(PORT, () => {
  console.log('server is listening on port: ',PORT)
})