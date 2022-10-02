import dotenv from "dotenv"
dotenv.config()
import express from "express"
import cors from "cors"
import fetch from "node-fetch"
import twilio from "twilio"

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: false}))

let mobileNumber 
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const client = twilio(accountSid, authToken);

app.get('/', (req, res)=>{
    res.send("Twilio server up and running!")
})

app.post('/number', (req,res)=>{
    mobileNumber = req.body.number
    res.json('Contact saved successfully!!')
})

app.post('/receive/:id',async(req, res)=>{

    if(req.params.id === "location"){
        let lat = req.body.lat
        let long = req.body.long
        
        let bookstoreLat 
        let bookstoreLong
        let bookstoreName
        await fetch(`https://api.geoapify.com/v2/places?categories=commercial.books&lat=${lat}&lon=${long}&lang=en&limit=3&apiKey=${process.env.GEOAPIFY_API_KEY}`)
        .then(response=>response.json())
        .then(data =>{
        for(let i=0;i<3;i++){
            if(data.features[i] != undefined)
            {
                 bookstoreLat = data.features[i].properties.lat
                 bookstoreLong = data.features[i].properties.lon
                 bookstoreName = data.features[i].properties.name
 
                 client.messages
                 .create({
                 from: 'whatsapp:+14155238886',
                 body: `${i+1}. Sharkie found this bookstore near you!`,
                 persistentAction: [`geo:${bookstoreLat},${bookstoreLong}|${bookstoreName}`],
                 to: `whatsapp:+91${mobileNumber}`
                 })
            }
        }
        })
    }

    else if(req.params.id === "meme"){
        let url
        await fetch('https://meme-api.herokuapp.com/gimme/SharkMemes')
        .then(response=>response.json())
        .then(data =>{
            url = data.url
        })
        client.messages
        .create({
        from: 'whatsapp:+14155238886',
        body: 'Here\'s a 🦈 meme for you!',
        mediaUrl: url,
        to: `whatsapp:+91${mobileNumber}`
        })
        .then(message => res.json(message.sid))
        .catch(err => res.json(err));
    }
    
})



app.listen(process.env.PORT || 3000)