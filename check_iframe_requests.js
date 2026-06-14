const fs = require('fs');
const path = require('path');
const fetch = globalThis.fetch || require('node-fetch');

const pages = ['pages/api02.html','pages/api03.html','pages/api04.html','pages/api05.html'];

(async ()=>{
  for (const p of pages) {
    try{
      const content = fs.readFileSync(path.join(__dirname,p),'utf8');
      const match = content.match(/url:\s*"([^"]+)"/);
      const url = match ? match[1] : null;
      console.log('---',p,'---');
      if(!url){ console.log('No AJAX url found'); continue }
      console.log('AJAX URL:',url);
      try{
        const r = await fetch(url,{method:'GET'});
        console.log('FETCH STATUS', r.status, r.headers.get('content-type'));
        const txt = await r.text();
        console.log('BODY_LEN', txt.length);
        console.log('BODY_PREVIEW', txt.slice(0,200).replace(/\n/g,' '));
      }catch(e){
        console.log('FETCH ERROR', e.message);
      }
    }catch(e){
      console.log('READ FILE ERROR', e.message);
    }
  }
})();
