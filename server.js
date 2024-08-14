const express = require('express')
const path = require('path')
pdf = require('express-pdf');
const puppeteer = require('puppeteer');
const fs = require('fs');
const { Pool } = require('pg');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  secure: true,
  cloud_name: "dxvnon94f",
  api_key: "961335227687848",
  api_secret: "45StJjLMuUwWFMwvCh2sxyj6Mb4",
});
require('dotenv').config()
//const ADD_Product_Backend=require('./Add_Product_Backend')
const { Connector } = require('@google-cloud/cloud-sql-connector');
var cors = require('cors');
const PORT = process.env.PORT || 8080
const bodyParser = require('body-parser');
const app = express()
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(pdf);
const storage = multer.memoryStorage() 
const upload = multer()
const pool = new Pool({
 // user: process.env.DB_USER,
  //host:process.env.DB_HOST,
  //database: process.env.DB_NAME,
  //password: process.env.DB_PASSWORD,
 // port:5432,
 // ssl: {
  //  require: true,
 // }
 connectionString : "postgresql://neondb_owner:TFxSCge39yjn@ep-polished-band-a57e0mxg.us-east-2.aws.neon.tech/neondb?sslmode=require"
});

pool.connect((err, client, done) => {
  if (err) {
      console.error('Error connecting to PostgreSQL:', err);
  } else {
      console.log('Connected to PostgreSQL database');
  }
  done})






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
    console.log("the searched data on db is:",result.rows)

  })
  .catch((error) => {
    console.error('Error executing query:', error);
    res.status(500).send('Error executing query, check if connected is:', error);
  });
  console.log("the parameters sent are:",req.query)
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
  console.log(req.body)

  try {
  pool.query('INSERT INTO commandes(nomduclient,numerodefacture,date,modedepayement,montantdelacommande,villeduclient,numerodetelephoneduclient,detailsdelafacture) VALUES($1, $2,$3, $4,$5, $6,$7, $8)',[req.body.nom,req.body.numerodefacture,req.body.dateAndTime,req.body.modedepayment,req.body.totalamountoforder,req.body.ville,req.body.numero,req.body.cart_products]).then(result=>{console.log(result),res.send(req.body)})
     }catch (error) {
      console.error('Error executing query:', error);
      res.status(500).send('Erreur lors de l\'insertion de la commande'); // Respond with an error message
    }
})

app.post('/addProduct', upload.none(),async function (req, res,next){
  console.log("req.body is :",JSON.stringify(req.body) )
  const filename=(req.body.name).replaceAll(" ", "")
  pool.query('INSERT INTO products(name,price,image_source,brand,type,Description) VALUES($1,$2,$3,$4,$5,$6)',[req.body.name, req.body.price,filename,req.body.brand,req.body.type,req.body.description])
 
  try {
    const result= await cloudinary.uploader.upload(req.body.file,{public_id:filename})
    res.send(result)

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error uploading image to Cloudinary' });
  }

}
)


app.delete('/DelTodayLoanData/:id', (req, res)=>{
  pool.query('DELETE FROM loan_today WHERE id =$1',[req.params.id]).then(result=>res.send(result)).catch((error)=>{console.error})
  console.log(" The params are: ",req.params)
}
)

app.delete('/deleteProduct/:nom', (req, res)=>{
  pool.query('DELETE FROM products WHERE id =$1',[req.params.id]).catch((error)=>{console.error})
  console.log("Deleted one is:",req.params.id)
})

app.get('/printpdf', async (req, res)=>{
  const dataOfReceipt=req.query.data
  
  pool.query(' SELECT * FROM commandes WHERE nomduclient = $1',[dataOfReceipt]).then((result) => {
    console.log("the searched data on db is:",result.rows)
    const dataFromDataBase=result.rows

    async function generatePDF() {
      console.log("the value of dataFromDataBase",dataFromDataBase)
      const browser = await puppeteer.launch({
        args: [
          "--disable-setuid-sandbox",
          "--no-sandbox",
          "--single-process",
          "--no-zygote",
        ],
        executablePath:
          process.env.NODE_ENV === "production"
            ? process.env.PUPPETEER_EXECUTABLE_PATH
            : puppeteer.executablePath(),
      });
    const page = await browser.newPage();

    //const htmlContent = fs.readFileSync('./facture.html?data=dataFromDataBase', 'utf8');
    //await page.setContent(htmlContent,{waitUntilDone: true});
    //await page.setContent(htmlContent,{waitUntil: 'networkidle0'});
   // const filePath = path.resolve(__dirname, './facture.html');

    //await page.goto(`file://${filePath}?data=${dataFromDataBase}`, { waitUntil: 'networkidle0' });

    await page.goto(`https://fiama226.github.io/receipt_static_website/?data=${JSON.stringify(dataFromDataBase)}`, { waitUntil: 'networkidle0' });
    console.log("the link to the static website is :",`https://fiama226.github.io/receipt_static_website/?data=${JSON.stringify(dataFromDataBase)}`)

    

    //await new Promise(resolve => setTimeout(resolve, 5000));
    const generatedPdf = await page.pdf({ path: 'output.pdf', format: 'A4',printBackground: true });
    await browser.close();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="generated.pdf"');
    res.send(generatedPdf);
    
  }
  generatePDF()
  





  })
  .catch((error) => {
    console.error('Error executing query:', error);
    res.status(500).send('Error executing query, check if connected is:', error);
  });

  await new Promise(resolve => setTimeout(resolve, 2000));
  console.log("the params are:",dataOfReceipt)    
console.log("printpdf hitted")
})

app.listen(PORT, () => {
  console.log('server is listening on port: ',PORT)
})
