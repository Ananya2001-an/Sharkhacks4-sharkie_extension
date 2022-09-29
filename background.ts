export {}

chrome.runtime.onInstalled.addListener(()=>{
    chrome.contextMenus.create({
        title: 'Add selected text to Sharkie',
        contexts: ["selection"],
        id: "myId"
      })
})

chrome.contextMenus.onClicked.addListener(function (info, tab) {
    const selectedText = info.selectionText
    chrome.tabs.sendMessage(tab.id, {
      type: "toBeSaved",
      text: selectedText
    })
})