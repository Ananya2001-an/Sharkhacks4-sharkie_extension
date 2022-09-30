import cssText from "data-text:~style.css"
import { useEffect, useState } from "react"
import { Card, Nav, Tab, Button, InputGroup, Form, Alert} from "react-bootstrap"
import 'bootstrap/dist/css/bootstrap.min.css'
import { Document, Packer, Paragraph, TextRun} from 'docx';
import { saveAs } from 'file-saver';
import {FaArrowUp, FaArrowDown, FaTrash, FaSave,
FaRobot, FaSearch, FaFileWord, FaAd, FaCalculator, FaSearchLocation, FaFish} from 'react-icons/fa'
import cohere from 'cohere-ai'
import axios from 'axios'
let filenames = [
  "shark1.jpg",
  "shark2.jpg",
  "shark3.jpg",
  "shark4.jpg",
  "shark5.jpg"
]

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

const PlasmoOverlay = () => {
  const [content, setContent] = useState(null)
  const [searchContent, setSearchContent] = useState(null)
  const [disable, setDisable] = useState(true)

  useEffect(() => {
    chrome.runtime.onMessage.addListener(function ({
      type,
      text
    }) {
      if(type == "toBeSaved")
      {
        setContent(prev =>prev == null?[text]: [...prev, text])
      }
      else if(type == "toBeSearched"){
        setSearchContent(text)
      }
      return true
    })
  }, [])

  
  function replaceAds(){
    let imgs = document.getElementsByTagName('img')
    let iframes = document.getElementsByTagName('iframe')
    for(let img of imgs){
      let r = Math.floor(Math.random() * filenames.length)
      let file = 'sharks/' + filenames[r]
      let url = chrome.runtime.getURL(file)
      img.src = url
    }
    for(let iframe of iframes){
      let r = Math.floor(Math.random() * filenames.length)
      let file = 'sharks/' + filenames[r]
      let url = chrome.runtime.getURL(file)
      iframe.src = url
    }
  }

  function saveFile(){
    let doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children:[
                new TextRun({
                  text: content.join('-----'),
                  font: 'Calibri',
                  size: 40
                })
              ]
             })
          ]
        }
      ]
    });

    Packer.toBlob(doc).then(blob=>{
      saveAs(blob, 'SharkieDoc.docx')
    })
  }

  function deleteFile(index){
    let arrayCopy = [...content]
    setContent(null)
    let i = 0
    arrayCopy.map(c=>{
      if(i !== index){
        setContent(prev => prev == null ? [c] : [...prev, c])
      }
      i++
    })
  }

 function moveFileUp(index){
    if(index-1 < 0)
      return;
    let arrayCopy = []
    content.map(c=>{
      arrayCopy.push(c)
    })
    let i=0;
    while(i<arrayCopy.length)
    {
      if(i === index-1){
        let temp = arrayCopy[i]
        arrayCopy[i] = arrayCopy[index]
        arrayCopy[index] = temp
        break;
      }
      i++;
    }

    setContent(arrayCopy)
  }

  function moveFileDown(index){
    if(index+1 == content.length)
      return;
    let arrayCopy = []
    content.map(c=>{
      arrayCopy.push(c)
    })
    let i=0;
    while(i<arrayCopy.length)
    {
      if(i === index){
        let temp = arrayCopy[index]
        arrayCopy[index] = arrayCopy[index+1]
        arrayCopy[index+1] = temp
        break;
      }
      i++;
    }

    setContent(arrayCopy)
  }

  async function summarise(index){
    cohere.init(process.env.COHERE_API_KEY)
    const response = await cohere.generate({
      model: 'large',
      prompt: content[index],
      max_tokens: 50,
      temperature: 0.8,
      k: 0,
      p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      stop_sequences: ["--"],
      return_likelihoods: 'GENERATION'
    });

    let arrayCopy = []
    content.map(c=>{
      arrayCopy.push(c)
    })
    let i=0;
    while(i<arrayCopy.length)
    {
      if(i === index){
        arrayCopy[index] = response.body.generations[0].text
        break;
      }
      i++;
    }

    setContent(arrayCopy)
  }

  function submitNo(e){
    e.preventDefault()
    const option={
      number: e.target[0].value
    }
    axios.post('https://sharkie-twilio-server.herokuapp.com/number', option)
    .then(res=>{
      console.log(res.data)
    })
    e.target[0].value = ''
    setDisable(false)
  }

  function mathTrigger(){

  }

  function locationTrigger(){

  }

  function memeTrigger(){
    axios.post('https://sharkie-twilio-server.herokuapp.com/receive/meme')
    .then(res=>{
      console.log(res.data)
    })
  }

  return (
    <div style={{position:"fixed",fontFamily:"arial"}}>
    <div className="block p-6 max-w-sm rounded-lg border border-gray-200 shadow-md"
    style={{height:"300px",width:"400px", overflow:"auto", background:"white"}}>
      <Tab.Container defaultActiveKey="word">
        <div style={{display:"flex",justifyContent:"space-between", alignItems:"center"}}>
          <h3 style={{color:"lightseagreen"}} className="mb-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Sharkie
          </h3>
          <Nav style={{display:"flex",justifyContent:"space-evenly", alignItems:"center"}}>
          <Nav.Item><Nav.Link eventKey="word"><FaFileWord style={{color:"lightseagreen"}}/></Nav.Link></Nav.Item>
          <Nav.Item><Nav.Link eventKey="search"><FaSearch style={{color:"lightseagreen"}}/></Nav.Link></Nav.Item>
          <Nav.Item><Nav.Link eventKey="remove"><FaAd style={{color:"lightseagreen"}}/></Nav.Link></Nav.Item>
          <Nav.Item><Nav.Link eventKey="bot"><FaRobot style={{color:"lightseagreen"}}/></Nav.Link></Nav.Item>
          </Nav>
        </div>
        <Tab.Content>
          <Tab.Pane eventKey="word">
          {content? content.map((c, index) => {return <>
          <Nav>
          <Nav.Item><Nav.Link style={{display:"flex",padding:"10px", border:"1px solid lightseagreen"
          , borderRadius:"1rem", marginBottom:"10px",color:"white",background:"lightseagreen"}}
           onClick={saveFile}>Save as word file<FaSave/></Nav.Link></Nav.Item>
          </Nav>
          <Card style={{border:"1px solid lightseagreen",
           borderRadius:"1rem", marginBottom:"10px"}}>
            <Card.Body style={{padding:"10px"}}>{c}</Card.Body>
            <Card.Footer>
            <Nav style={{padding:"10px",borderTop:"1px solid lightseagreen",
            display:"flex",justifyContent:"space-evenly", alignItems:"center"}}>
            <Nav.Item>
              <Nav.Link onClick={()=>summarise(index)}>
                  <FaRobot style={{color:"lightseagreen"}}/>
              </Nav.Link>
            </Nav.Item>
            <Nav.Item><Nav.Link onClick={()=>deleteFile(index)}><FaTrash style={{color:"lightseagreen"}}/></Nav.Link></Nav.Item>
            <Nav.Item><Nav.Link onClick={()=>moveFileUp(index)}><FaArrowUp style={{color:"lightseagreen"}}/></Nav.Link></Nav.Item>
            <Nav.Item><Nav.Link onClick={()=>moveFileDown(index)}><FaArrowDown style={{color:"lightseagreen"}}/></Nav.Link></Nav.Item>
            </Nav>
            </Card.Footer>
          </Card>
          </>})
           : <div style={{display:"flex", flexDirection:"column", alignItems:"center"}} >
            <p>I am hungry...feed me some text</p>
            <iframe src="https://giphy.com/embed/xT5LMBcbjGxbN3ssO4" width="150" height="150" frameBorder="0" className="giphy-embed" allowFullScreen></iframe>
           </div>}
          </Tab.Pane>
          
          <Tab.Pane eventKey="search">
            {
              searchContent ? <><h4>{searchContent.title}</h4><p>{searchContent.extract}</p></>
              :
              <div style={{display:"flex", flexDirection:"column", alignItems:"center"}} >
                <p>Search the deep seas with me ...</p>
                <iframe src="https://giphy.com/embed/10Evl3tn7GPE88" width="150" height="150" frameBorder="0" className="giphy-embed" allowFullScreen></iframe>
              </div>
            }
          </Tab.Pane>

          <Tab.Pane eventKey="remove">
            <div style={{display:"flex",flexDirection:"column", alignItems:"center"}}>
            <p className="text-center text-muted">Replace annoying ads with shark images from Sharkie!!</p>
            <Button variant="light" onClick={replaceAds}>Replace with 🦈's</Button>
            </div>
          </Tab.Pane> 

          <Tab.Pane eventKey="bot">
            <div style={{display:"flex",flexDirection:"column", alignItems:"center"}}>
            <p className="text-center text-muted">Talk to our Sharkie bot!! All communications 
            will be done on your given WhatsApp number.</p>
            </div>
            <div className="flex" style={{alignItems:"center",flexDirection:"column"}}>
              <Form className="mb-4" onSubmit={submitNo}>
                <InputGroup>
                <Form.Control required placeholder="Enter 10 digit mobile no." minLength={10} maxLength={10}></Form.Control>
                <Button type="submit" variant="light">Submit</Button>
                </InputGroup>
              </Form>
              {
                !disable && <Alert variant="success">Chat triggers are enabled now!!</Alert>
              }
              <div style={{display:"flex"}}>
                <div className="mr-4" style={{padding:"10px",border:"1px solid lightseagreen", borderRadius:"50%"}}>
                <Nav.Link disabled={disable} onClick={mathTrigger}><FaCalculator style={{fontSize:"20px",color:"lightseagreen"}}></FaCalculator></Nav.Link>
                </div>
                
                <div className="mr-4" style={{padding:"10px",border:"1px solid lightseagreen", borderRadius:"50%"}}>
                <Nav.Link disabled={disable} onClick={locationTrigger}><FaSearchLocation style={{fontSize:"20px",color:"lightseagreen"}}></FaSearchLocation></Nav.Link>
                </div>
                
                <div style={{padding:"10px",border:"1px solid lightseagreen", borderRadius:"50%"}}>
                <Nav.Link disabled={disable} onClick={memeTrigger}><FaFish style={{fontSize:"20px",color:"lightseagreen"}}></FaFish></Nav.Link>
                </div>
              </div>
            </div>
          </Tab.Pane> 
        </Tab.Content>
      </Tab.Container>
    </div>
    </div>
  )
}

export default PlasmoOverlay
