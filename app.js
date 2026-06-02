const STORAGE_KEY = 'vocabWords_v1'
let words = []
let current = 0

const els = {}
function $id(id){return document.getElementById(id)}

function load(){
  try{ words = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] }catch(e){words=[]}
}

function saveStorage(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(words)) }

function renderCard(){
  const w = words[current]
  $id('wordText').textContent = w?.word || '—'
  $id('translation').textContent = w?.translation || '—'
  $id('pos').textContent = w?.pos || '—'
  $id('etym').textContent = w?.etym || '—'
  // reset to front
  $id('card').classList.remove('is-flipped')
}

function renderList(){
  const ul = $id('wordList')
  ul.innerHTML = ''
  words.forEach((w,i)=>{
    const li = document.createElement('li')
    const btn = document.createElement('button')
    btn.textContent = '選取'
    btn.onclick = ()=>{ current = i; renderCard() }
    li.innerHTML = `<div><strong>${escapeHtml(w.word)}</strong> <div style="font-size:12px;color:#666">${escapeHtml(w.translation||'')}</div></div>`
    li.appendChild(btn)
    ul.appendChild(li)
  })
}

function escapeHtml(s){ if(!s) return '' ; return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }

function next(){ if(words.length===0) return; current = (current+1) % words.length; renderCard() }
function prev(){ if(words.length===0) return; current = (current-1 + words.length) % words.length; renderCard() }

async function autoFillFor(word){
  // try dictionaryapi.dev for pos and definition, and libretranslate for zh translation
  const out = {translation:'',pos:'',etym:''}
  try{
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`)
    if(res.ok){
      const j = await res.json()
      const entry = j[0]
      if(entry){
        // pos
        const m = entry.meanings && entry.meanings[0]
        out.pos = m?.partOfSpeech || ''
        // use first definition as basis for translation
        const def = m?.definitions && m.definitions[0] && m.definitions[0].definition
        if(def) out.translation = def
        // etymology / origin
        out.etym = entry.origin || ''
      }
    }
  }catch(e){console.warn('dict api fail',e)}

  // if we have english def, translate it to zh for better result
  try{
    const textToTranslate = out.translation || word
    const tRes = await fetch('https://libretranslate.de/translate', {
      method:'POST',headers:{'Content-Type':'application/json'},
      body: JSON.stringify({q:textToTranslate,source:'en',target:'zh',format:'text'})
    })
    if(tRes.ok){
      const tj = await tRes.json()
      if(tj && tj.translatedText){ out.translation = tj.translatedText }
    }
  }catch(e){console.warn('translate fail',e)}

  return out
}

document.addEventListener('DOMContentLoaded', ()=>{
  // wire elements
  $id('card').addEventListener('click', ()=>{ $id('card').classList.toggle('is-flipped') })
  $id('next').addEventListener('click', (e)=>{ e.stopPropagation(); next() })
  $id('prev').addEventListener('click', (e)=>{ e.stopPropagation(); prev() })
  $id('toggle-manage').addEventListener('click', ()=>{ document.getElementById('managePanel').classList.toggle('open') })

  load(); renderList(); renderCard();

  $id('wordForm').addEventListener('submit', (e)=>{
    e.preventDefault()
    const w = $id('inputWord').value.trim()
    if(!w) return
    const item = {word:w,translation:$id('inputTranslation').value.trim(),pos:$id('inputPos').value.trim(),etym:$id('inputEtym').value.trim()}
    // if exists, replace first matching
    const idx = words.findIndex(x=>x.word.toLowerCase()===w.toLowerCase())
    if(idx>=0) words[idx]=item
    else words.push(item)
    saveStorage(); renderList(); current = words.findIndex(x=>x.word.toLowerCase()===w.toLowerCase()); renderCard()
    $id('wordForm').reset()
  })

  $id('autoFill').addEventListener('click', async ()=>{
    const w = $id('inputWord').value.trim()
    if(!w) return alert('請先輸入英文單字')
    $id('autoFill').textContent = '處理中…'
    try{
      const data = await autoFillFor(w)
      if(data.translation) $id('inputTranslation').value = data.translation
      if(data.pos) $id('inputPos').value = data.pos
      if(data.etym) $id('inputEtym').value = data.etym
    }catch(e){console.error(e); alert('自動填入失敗')}
    $id('autoFill').textContent = '自動填入'
  })
})
