import tldr from 'wikipedia-tldr'

chrome.runtime.onInstalled.addListener(()=>{
    chrome.contextMenus.create({
        title: 'Save selected text to Sharkie',
        contexts: ["selection"],
        id: "myDocId"
      })
    chrome.contextMenus.create({
      title: 'Search "%s" with Sharkie',
      contexts: ["selection"],
      id: "myWikiId"
    })
})

chrome.contextMenus.onClicked.addListener(async function (info, tab) {
    const selectedText = info.selectionText

    let id = info.menuItemId
    if(id === 'myDocId')
    {
      chrome.tabs.sendMessage(tab.id, {
        type: "toBeSaved",
        text: selectedText
      })
    }
    else if(id === 'myWikiId'){
      let tldrText = await tldr(selectedText.split(' ')[0])
      chrome.tabs.sendMessage(tab.id, {
        type: "toBeSearched",
        text: tldrText
      })
    }
})