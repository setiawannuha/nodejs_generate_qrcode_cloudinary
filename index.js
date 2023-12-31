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
    const file = path.join(process.cwd(), `public/${code}.png`);
    await qrImage.pipe(require('fs').createWriteStream(file));
    const result = await cloudinary.uploader.upload(file, {public_id: `qrcode/${code}`})
    return res.json({
      msg: 'success',
      result
    })
  } catch (error) {
    console.log(error);
    return res.send("Error")
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`service running at port ${PORT}`);
})