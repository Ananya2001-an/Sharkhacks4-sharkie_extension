import dotenv from "dotenv"
dotenv.config()
import express from "express"
import cors from "cors"
import fetch from "node-fetch"
const app = express()
app.use(cors())
let mobileNumber 
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
import twilio from "twilio"
const client = twilio(accountSid, authToken);

app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.get('/', (req, res)=>{
    res.send("Twilio server up and running")
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
           if(data.features[0] != undefined)
           {
                bookstoreLat = data.features[0].properties.lat
                bookstoreLong = data.features[0].properties.lon
                bookstoreName = data.features[0].properties.name

                client.messages
                .create({
                from: 'whatsapp:+14155238886',
                body: 'Sharkie found this bookstore near you!',
                persistentAction: [`geo:${bookstoreLat},${bookstoreLong}|${bookstoreName}`],
                to: `whatsapp:+91${mobileNumber}`
                })
                .then(message => res.json(message.sid))
                .catch(err => res.json(err));
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