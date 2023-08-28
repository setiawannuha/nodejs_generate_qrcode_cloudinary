require('dotenv').config()
const express = require('express')
const cors = require("cors")
const cloudinary = require("cloudinary").v2
const qr = require("qr-image")
const path = require('path');
const fs = require("fs")
const streamifier = require('streamifier')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
})

const app = express()
app.use(cors())
app.get("/", (req, res) => {
  try {
    return res.send("Its Works")
  } catch (error) {
    return res.send("Error")
  }
})
app.get("/generate", async (req, res) => {
  try {
    const {code} = req.query
    const qrImage = qr.image(code, { type: 'png' });
    const publicDirectory = path.join(process.cwd(), 'public');
    await qrImage.pipe(require('fs').createWriteStream(`${publicDirectory}/${code}.png`));
    const file = await fs.readFileSync(`${publicDirectory}/${code}.png`);
    const stream = cloudinary.uploader.upload_stream({folder: `qrcode`}, (error, result) => {
      if (error) return console.error(error);
      res.status(200).json(result);
    })
    streamifier.createReadStream(file).pipe(stream);
  } catch (error) {
    console.log(error);
    return res.send("Error")
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`service running at port ${PORT}`);
})