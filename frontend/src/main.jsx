import React,{useMemo,useState} from 'react';
import{createRoot}from'react-dom/client';
import{ShoppingBag,Search,Menu,X,Minus,Plus,Trash2,MessageCircle,ChevronDown}from'lucide-react';
import'./styles.css';

const products=[
 {id:'tee-01',name:'Custom T-Shirt',image:'real-tshirt-printing.jpg',price:499,category:'T-Shirts',description:'Comfortable everyday tee ready for your custom print.'},
 {id:'tee-02',name:'College Fest T-Shirt',image:'real-college-event.jpg',price:449,category:'T-Shirts',description:'Bold custom tees for college events and groups.'},
 {id:'tee-03',name:'Oversized Graphic Tee',image:'real-mens-tshirt.jpg',price:599,category:'T-Shirts',description:'Relaxed oversized fit for a modern streetwear look.'},
 {id:'hoodie-01',name:'Premium Custom Hoodie',image:'real-hoodie.jpg',price:999,category:'Hoodies',description:'Soft hoodie suitable for custom prints and embroidery.'},
 {id:'hoodie-02',name:'Royal Embroidery Hoodie',image:'real-hoodie-alt.jpg',price:1199,category:'Hoodies',description:'Premium hoodie with a clean embroidered finish.'},
 {id:'cap-01',name:'Embroidered Cap',image:'real-cap.jpg',price:399,category:'Caps',description:'Classic cap with custom embroidery.'},
 {id:'cap-02',name:'Logo Dad Cap',image:'real-cap-alt.jpg',price:449,category:'Caps',description:'Minimal everyday cap for custom logos and names.'},
 {id:'uniform-01',name:'Corporate Uniform Set',image:'real-corporate-uniform.jpg',price:1299,category:'Uniforms',description:'Customisable uniform set for teams and businesses.'},
 {id:'uniform-02',name:'School House Uniform',image:'real-uniforms-alt.jpg',price:899,category:'Uniforms',description:'Custom school and group uniforms.'},
 {id:'mens-01',name:"Custom Men's Shirt",image:'real-mens-wear.jpg',price:699,category:"Men's Wear",description:'Custom-fit men’s shirt with your choice of style, colour and design.'},
 {id:'mens-02',name:'Custom Kurta',image:'real-kurta.jpg',price:899,category:"Men's Wear",description:'Custom kurta tailoring with personalised fit, fabric and design.'},
 {id:'ladies-01',name:'Ladies Blouse',image:'real-embroidered-blouse.jpg',price:799,category:'Ladies Wear',description:'Tailored blouse with options for custom design.'},
 {id:'ladies-02',name:"Custom Women's Wear",image:'real-womens-wear.jpg',price:999,category:"Women's Wear",description:'Custom women’s wear tailored to your measurements, style and design.'},
 {id:'ladies-03',name:'Custom Blouse Design',image:'real-blouse.jpg',price:899,category:"Women's Wear",description:'Choose your blouse style, neck pattern, sleeves and embroidery details.'},
 {id:'print-01',name:'T-Shirt Printing',image:'real-tshirt-printing.jpg',price:499,category:'T-Shirt Printing',description:'Print your logo, artwork, text or design on a quality T-shirt.'},
 {id:'print-02',name:'Photo / Name T-Shirt Printing',image:'real-photo-tshirt.jpg',price:549,category:'T-Shirt Printing',description:'Personalised photo, name or message printing for gifts and occasions.'},
 {id:'accessory-01',name:'Custom Tote Bag',image:'real-tote.jpg',price:299,category:'Accessories',description:'Reusable tote bag for custom printing.'},
 {id:'accessory-02',name:'Embroidered Tote',image:'real-tote-alt.jpg',price:399,category:'Accessories',description:'Tote bag with a custom embroidered design.'}
];
const cats=['All','T-Shirts','T-Shirt Printing',"Men's Wear","Women's Wear",'Hoodies','Caps','Uniforms','Ladies Wear','Accessories'];
const WA='917731977738';

function App(){
 const[cart,setCart]=useState([]),[q,setQ]=useState(''),[cat,setCat]=useState('All'),[open,setOpen]=useState(false),[checkout,setCheckout]=useState(false),[notice,setNotice]=useState('');
 const[customer,setCustomer]=useState({name:'',phone:'',address:''});
 const filtered=useMemo(()=>products.filter(p=>(cat==='All'||p.category===cat)&&p.name.toLowerCase().includes(q.toLowerCase())),[q,cat]);
 const add=p=>{setCart(c=>{const x=c.find(i=>i.id===p.id);return x?c.map(i=>i.id===p.id?{...i,qty:i.qty+1}:i):[...c,{...p,qty:1}]});setNotice(p.name+' added to cart');setTimeout(()=>setNotice(''),1800);setOpen(true)};
 const update=(id,d)=>setCart(c=>c.map(i=>i.id===id?{...i,qty:Math.max(1,i.qty+d)}:i));
 const remove=id=>setCart(c=>c.filter(i=>i.id!==id));
 const count=cart.reduce((a,i)=>a+i.qty,0),total=cart.reduce((a,i)=>a+i.price*i.qty,0);
 const placeOnWhatsApp=()=>{
  if(!customer.name||!customer.phone||!customer.address){setNotice('Please enter your name, phone and address');setTimeout(()=>setNotice(''),2500);return;}
  const orderId='TATWA-'+new Date().toISOString().slice(0,10).replaceAll('-','')+'-'+Math.floor(100+Math.random()*900);
  const lines=cart.map(i=>`• ${i.name} × ${i.qty} — ₹${(i.price*i.qty).toLocaleString('en-IN')}`).join('\n');
  const message=`Hello Tatwa! I would like to place an order.\n\nOrder ID: ${orderId}\nName: ${customer.name}\nPhone: ${customer.phone}\nAddress: ${customer.address}\n\nItems:\n${lines}\n\nTotal: ₹${total.toLocaleString('en-IN')}\n\nPlease confirm my order and send me the payment QR code.`;
  fetch((import.meta.env.VITE_API_URL||'http://localhost:5000')+'/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({orderId,customer,items:cart,total,status:'New'})}).catch(()=>{});
  window.open(`https://wa.me/${WA}?text=${encodeURIComponent(message)}`,'_blank');
 };
 return <>
 <header><a className="brand" href="#top"><img src="/images/tatwa-compact-logo.png" alt="Tatwa by Amma Tailors"/></a><nav><a href="#shop">Shop</a><a href="#about">About Tatwa</a></nav><div className="tools"><div className="search"><Search size={18}/><input placeholder="Search products" value={q} onChange={e=>setQ(e.target.value)}/></div><button className="cartBtn" onClick={()=>setOpen(true)}><ShoppingBag size={21}/><b>{count}</b></button><button className="menu" onClick={()=>setOpen(true)}><Menu/></button></div></header>
 <main id="top"><section className="hero"><div><span className="eyebrow">TATWA • BY AMMA TAILORS</span><h1>Wear your ideas.</h1><p>Shop custom clothing, printed merchandise and everyday designs made for you.</p><a className="primary" href="#shop">Shop collection</a></div><img src="/images/tatwa-full-logo.png" alt="Tatwa brand"/></section>
 <section id="shop" className="shop"><div className="shopHead"><div><span className="eyebrow">THE COLLECTION</span><h2>Shop Tatwa</h2></div><div className="filters">{cats.map(c=><button className={cat===c?'active':''} onClick={()=>setCat(c)} key={c}>{c}</button>)}</div></div><div className="grid">{filtered.map(p=><article className="card" key={p.id}><div className="imageWrap"><img src={'/images/'+p.image} alt={p.name}/></div><div className="cardBody"><small>{p.category}</small><h3>{p.name}</h3><p>{p.description}</p><strong>₹{p.price.toLocaleString('en-IN')}</strong><button onClick={()=>add(p)}>Add to cart</button></div></article>)}</div>{!filtered.length&&<div className="emptyShop">No products found. Try another search.</div>}</section>
 <section id="about" className="about"><img src="/images/tatwa-symbol.png" alt="Tatwa symbol"/><div><span className="eyebrow">TATWA</span><h2>Crafted locally. Designed for you.</h2><p>Choose a ready design, or use WhatsApp to discuss a custom print, embroidery, name or bulk order.</p><a className="whatsapp" href={`https://wa.me/${WA}`} target="_blank" rel="noreferrer"><MessageCircle size={18}/> WhatsApp us</a></div></section>
 </main><footer><img src="/images/tatwa-compact-logo.png" alt="Tatwa"/><div className="footerContact"><span>© 2026 Tatwa by Amma Tailors · Bhimavaram</span><a href="mailto:tatwadesigningstudio@gmail.com">tatwadesigningstudio@gmail.com</a></div></footer>
 {notice&&<div className="toast">{notice}</div>}
 {open&&<aside className="drawer"><div className="drawerHead"><h2>Your cart</h2><button onClick={()=>setOpen(false)}><X/></button></div>{!cart.length?<p className="empty">Your cart is empty.</p>:<><div className="cartLines">{cart.map(i=><div className="line" key={i.id}><img src={'/images/'+i.image} alt=""/><div className="lineInfo"><b>{i.name}</b><p>₹{i.price.toLocaleString('en-IN')} × {i.qty}</p><div className="qty"><button onClick={()=>update(i.id,-1)}><Minus size={14}/></button><span>{i.qty}</span><button onClick={()=>update(i.id,1)}><Plus size={14}/></button><button className="remove" onClick={()=>remove(i.id)}><Trash2 size={15}/></button></div></div></div>)}</div><div className="total"><b>Total</b><strong>₹{total.toLocaleString('en-IN')}</strong></div>{!checkout?<button className="primary checkout" onClick={()=>setCheckout(true)}>Order via WhatsApp</button>:<div className="checkoutForm"><h3>Order details</h3><p className="hint">We'll open WhatsApp with your cart details. We'll confirm the order and send the payment QR code there.</p><input placeholder="Your name" value={customer.name} onChange={e=>setCustomer({...customer,name:e.target.value})}/><input placeholder="Phone number" value={customer.phone} onChange={e=>setCustomer({...customer,phone:e.target.value})}/><textarea placeholder="Delivery address" value={customer.address} onChange={e=>setCustomer({...customer,address:e.target.value})}/><button className="whatsapp checkout" onClick={placeOnWhatsApp}><MessageCircle size={18}/> Send order on WhatsApp</button><button className="back" onClick={()=>setCheckout(false)}>Back to cart</button></div>}</>}</aside>}
 </>;
}
createRoot(document.getElementById('root')).render(<App/>);
