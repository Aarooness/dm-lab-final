const http=require('http'),fs=require('fs'),path=require('path');
const products=[{id:'whey',name:'Whey concentrada',detail:'Proteína · 1 kg · chocolate',price:129,category:'protein',icon:'🥛'},{id:'isolate',name:'Whey aislada',detail:'Proteína · 2 kg · vainilla',price:249,category:'protein',icon:'💪'},{id:'vegan',name:'Proteína vegetal',detail:'Proteína · 750 g · cacao',price:115,category:'protein',icon:'🌱'},{id:'creatine',name:'Creatina monohidrato',detail:'300 g · sin sabor',price:79,category:'creatine',icon:'⚡'},{id:'vitamins',name:'Multivitamínico',detail:'60 cápsulas',price:49,category:'vitamins',icon:'☀️'},{id:'shaker',name:'Shaker Core',detail:'700 ml · negro',price:25,category:'accessory',icon:'🥤'}];
const statePath=path.join(__dirname,'plugin-state.json');
let states=fs.existsSync(statePath)?JSON.parse(fs.readFileSync(statePath,'utf8')):{};
function registry(){return fs.readdirSync(path.join(__dirname,'plugins')).filter(f=>f.endsWith('.js')).sort().map(f=>{const p=path.join(__dirname,'plugins',f);delete require.cache[require.resolve(p)];const mod=require(p);if(!/^[a-z0-9-]+$/.test(mod.id)||typeof mod.apply!=='function')throw Error('Contrato inválido: '+f);return {...mod,type:mod.type||'promotion',enabled:states[mod.id]!==false,file:f}})}
function quote(body){
 const items=Object.entries(body.cart||{}).map(([id,qty])=>{const p=products.find(p=>p.id===id);if(!p||!Number.isInteger(qty)||qty<1||qty>20)throw Error('Cantidad inválida');return {...p,qty}});
 const subtotal=items.reduce((sum,p)=>sum+p.price*p.qty,0);const selected=registry().find(p=>p.type==='promotion'&&p.enabled&&p.id===body.plugin);if(body.plugin&&!selected)throw Error('Promoción no disponible');
 const r=selected?selected.apply({items,subtotal}):{discounts:{},reason:'Elige una promoción para ahorrar.'};
 const lines=items.map(p=>{const original=p.price*p.qty;const discount=Math.round((r.discounts[p.id]||0)*100)/100;if(!Number.isFinite(discount)||discount<0||discount>original)throw Error('Descuento inválido');return {...p,original,discount,total:Math.round((original-discount)*100)/100}});
 const discount=Math.round(lines.reduce((sum,p)=>sum+p.discount,0)*100)/100;
 const merchandise=Math.round((subtotal-discount)*100)/100;
 const delivery=body.shipping?registry().find(p=>p.type==='shipping'&&p.enabled&&p.id===body.shipping):null;
 if(body.shipping&&!delivery)throw Error('Entrega no disponible. Actualiza las opciones.');
 const shipping=delivery&&items.length?delivery.apply({items,subtotal,total:merchandise}):{cost:0,reason:items.length?'Selecciona una modalidad de entrega.':'Carrito vacío: sin envío.'};
 if(!Number.isFinite(shipping.cost)||shipping.cost<0)throw Error('Costo de envío inválido');
 shipping.cost=Math.round(shipping.cost*100)/100;
 return {lines,subtotal,discount,merchandise,shipping,total:Math.round((merchandise+shipping.cost)*100)/100,reason:r.reason,trace:[
 '1. API: recibe POST /api/quote con IDs y cantidades.',
 '2. Núcleo: valida catálogo y cantidades. Subtotal S/ '+subtotal.toFixed(2),
 selected?'3. Registro: resuelve promoción activa '+selected.file:'3. Registro: sin promoción seleccionada.',
 selected?'4. Contrato promoción: apply({items,subtotal}) devuelve descuentos.':'4. Núcleo: conserva precios originales.',
 '5. Núcleo: valida descuentos. Productos S/ '+merchandise.toFixed(2),
 delivery&&items.length?'6. Registro: resuelve entrega activa '+delivery.file+'; apply devuelve costo S/ '+shipping.cost.toFixed(2):'6. Entrega: '+shipping.reason,
 '7. Núcleo: valida envío y suma total S/ '+(merchandise+shipping.cost).toFixed(2),
 '8. API: responde JSON. La interfaz actualiza el carrito.'
 ]};}

http.createServer((req,res)=>{if(req.url==='/admin'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(fs.readFileSync(path.join(__dirname,'admin.html')));return}
if(req.url==='/api/plugins'&&req.method==='POST'){
 if(req.headers.origin&&req.headers.origin!=='http://'+req.headers.host){res.writeHead(403);res.end();return}
 let data='';req.on('data',c=>{data+=c;if(data.length>10000)req.destroy()});req.on('end',()=>{try{const body=JSON.parse(data);if(typeof body.enabled!=='boolean'||!registry().some(p=>p.id===body.id))throw Error('Plugin inválido');states[body.id]=body.enabled;fs.writeFileSync(statePath,JSON.stringify(states,null,2));res.setHeader('Content-Type','application/json');res.end(JSON.stringify({ok:true}));}catch(e){res.writeHead(400);res.end(JSON.stringify({error:e.message}))}});return}
if(req.url==='/assets/pack.png'){res.setHeader('Content-Type','image/png');res.end(fs.readFileSync(path.join(__dirname,'assets/pack.png')));return}if(req.url==='/api/catalog'){res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json');res.end(JSON.stringify({products,plugins:registry().map(({apply,...p})=>p)}));return}if(req.url==='/api/quote'&&req.method==='POST'){let data='';req.on('data',c=>{data+=c;if(data.length>10000)req.destroy()});req.on('end',()=>{try{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(quote(JSON.parse(data))))}catch(e){res.statusCode=400;res.end(JSON.stringify({error:e.message}))}});return}if(req.url==='/'||req.url==='/index.html'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(fs.readFileSync(path.join(__dirname,'index.html')));return}res.statusCode=404;res.end('Not found')}).listen(8025,'127.0.0.1',()=>console.log('NutriCore http://127.0.0.1:8025'));
