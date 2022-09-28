import cssText from "data-text:~style.css"
import { useEffect, useState } from "react"
import 'bootstrap/dist/css/bootstrap.min.css'
import { Alert, Nav } from "react-bootstrap"
import { Document, Packer, Paragraph, TextRun} from 'docx';
import { saveAs } from 'file-saver';

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

  return (
    <div style={{position:"fixed", height:"300px",width:"400px", overflow:"auto", fontFamily:"arial"}}>
    <div className="block p-6 max-w-sm bg-white rounded-lg border border-gray-200 shadow-md" style={{background:"white"}}>
        <div className="d-flex" style={{justifyContent:"space-between", alignItems:"center"}}>
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Sharkie
          </h1>
          <Nav>
          <Nav.Item><Nav.Link onClick={saveFile}>save</Nav.Link></Nav.Item>
          </Nav>
        </div>
        <p className="font-normal text-gray-700 dark:text-gray-400">
          {content ? content.map(c => {return <Alert variant="primary">{c}</Alert>})
           : "I am hungry...feed me some text"}
        </p>
    </div>
    </div>
  )
}

export default PlasmoOverlay
