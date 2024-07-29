const puppeteer = require('puppeteer');
const path = require('path');

const functiontogenratepdf= async ()=>{

try {
    // Launch a headless browser
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Open HTML file and convert to PDF
    const htmlFilePath = path.join(__dirname, 'facture.html');  // Replace with your HTML file path
    await page.goto(`file://${htmlFilePath}`, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({ format: 'A4' });

    // Close the browser
    await browser.close();

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="output.pdf"');

    // Send the PDF as response
    res.send(pdfBuffer);
} catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).send('Error generating PDF');
}
}
;
module.exports = {functiontogenratepdf} 