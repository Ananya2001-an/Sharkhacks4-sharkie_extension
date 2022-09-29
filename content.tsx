import cssText from "data-text:~style.css"
import { useEffect, useState } from "react"
import { Card, Nav } from "react-bootstrap"
import { Document, Packer, Paragraph, TextRun} from 'docx';
import { saveAs } from 'file-saver';
import {FaArrowUp, FaArrowDown, FaTrash, FaSave, FaRobot} from 'react-icons/fa'
import cohere from 'cohere-ai'

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

const PlasmoOverlay = () => {
  const [content, setContent] = useState(null)

  useEffect(() => {
    chrome.runtime.onMessage.addListener(function ({
      type,
      text
    }) {
      if(type == "toBeSaved")
      {
        setContent(prev =>prev == null?[text]: [...prev, text])
      }
      return true
    })
  }, [])

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
      return_likelihoods: 'NONE'
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

  return (
    <div style={{position:"fixed",fontFamily:"arial"}}>
    <div className="block p-6 max-w-sm bg-white rounded-lg border border-gray-200 shadow-md"
    style={{height:"300px",width:"400px", overflow:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between", alignItems:"center"}}>
          <h3 style={{color:"lightseagreen"}} className="mb-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Sharkie
          </h3>
          <Nav >
          <Nav.Item><Nav.Link onClick={saveFile}><FaSave style={{color:"lightseagreen"}}/></Nav.Link></Nav.Item>
          </Nav>
        </div>
        <p className="font-normal text-gray-700 dark:text-gray-400">
          {content? content.map((c, index) => {return <Card style={{border:"1px solid lightseagreen",
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
          </Card>})
           : <div style={{display:"flex", flexDirection:"column", alignItems:"center"}} >
            <p>I am hungry...feed me some text</p>
            <iframe src="https://giphy.com/embed/xT5LMBcbjGxbN3ssO4" width="180" height="180" frameBorder="0" className="giphy-embed" allowFullScreen></iframe>
           </div>}
        </p>
    </div>
    </div>
  )
}

export default PlasmoOverlay
