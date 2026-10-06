import React,{useEffect,useMemo,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {createClient} from '@supabase/supabase-js';
import {LayoutDashboard,Users,DoorOpen,IndianRupee,LogOut,Plus,Search,Trash2,Menu,X,ShieldCheck,Upload,CheckCircle2,Clock3} from 'lucide-react';
import './styles.css';

const url=import.meta.env.VITE_SUPABASE_URL;
const key=import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase=(url&&key)?createClient(url,key):null;

const demoTenants=[
 {id:'d1',full_name:'Demo Tenant',phone:'9876543210',room_no:'101',parent_name:'Parent Name',parent_phone:'9876500000',security_deposit:6500,status:'Active'},
];
const demoRooms=[
 {id:'r1',room_no:'101',floor:'1st Floor',capacity:2,rent:6500,status:'Occupied'},
 {id:'r2',room_no:'102',floor:'1st Floor',capacity:2,rent:6500,status:'Available'},
 {id:'r3',room_no:'201',floor:'2nd Floor',capacity:3,rent:6000,status:'Available'}
];

function App(){
 const [session,setSession]=useState(null),[tab,setTab]=useState('dashboard'),[menu,setMenu]=useState(false);
 const [tenants,setTenants]=useState([]),[rooms,setRooms]=useState([]),[rents,setRents]=useState([]);
 const [loading,setLoading]=useState(true),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[loginErr,setLoginErr]=useState('');
 const demo=!supabase;

 useEffect(()=>{ if(!supabase){setLoading(false);return} supabase.auth.getSession().then(({data})=>{setSession(data.session);setLoading(false)}); const {data}=supabase.auth.onAuthStateChange((_e,s)=>setSession(s)); return()=>data.subscription.unsubscribe()},[]);
 useEffect(()=>{if(session||demo) loadData()},[session]);
 async function loadData(){
   setLoading(true);
   if(demo){setTenants(JSON.parse(localStorage.getItem('dpg_tenants')||'null')||demoTenants);setRooms(demoRooms);setRents([]);setLoading(false);return}
   const [t,r,rr]=await Promise.all([supabase.from('tenants').select('*').order('created_at',{ascending:false}),supabase.from('rooms').select('*').order('room_no'),supabase.from('rents').select('*').order('created_at',{ascending:false})]);
   setTenants(t.data||[]);setRooms(r.data||[]);setRents(rr.data||[]);setLoading(false);
 }
 async function login(e){e.preventDefault();setLoginErr('');if(demo){setSession({demo:true});return} const {error}=await supabase.auth.signInWithPassword({email,password});if(error)setLoginErr(error.message)}
 async function logout(){if(supabase)await supabase.auth.signOut();setSession(null)}
 if(loading)return <div className="splash"><div className="logo">D</div><h1>Dabhade PG</h1><p>Loading...</p></div>;
 if(!session)return <Login email={email} setEmail={setEmail} password={password} setPassword={setPassword} login={login} error={loginErr} demo={demo}/>;

 const nav=[['dashboard','Dashboard',LayoutDashboard],['tenants','Tenants',Users],['rooms','Rooms',DoorOpen],['rent','Rent',IndianRupee]];
 return <div className="app">
  <aside className={menu?'open':''}><div className="brand"><div className="logo small">D</div><div><b>Dabhade PG</b><span>Management</span></div></div>
   <nav>{nav.map(([id,label,Icon])=><button className={tab===id?'active':''} onClick={()=>{setTab(id);setMenu(false)}} key={id}><Icon size={19}/>{label}</button>)}</nav>
   <button className="logout" onClick={logout}><LogOut size={18}/> Logout</button>
  </aside>
  {menu&&<div className="overlay" onClick={()=>setMenu(false)}/>}
  <main><header><button className="mobileMenu" onClick={()=>setMenu(!menu)}>{menu?<X/>:<Menu/>}</button><div><h2>{tab==='dashboard'?'Dashboard':tab[0].toUpperCase()+tab.slice(1)}</h2><p>Welcome to Dabhade PG</p></div><div className="secure"><ShieldCheck size={17}/> Admin</div></header>
   {demo&&<div className="demo">Demo mode — connect Supabase in <b>.env</b> for online data and authentication.</div>}
   {tab==='dashboard'&&<Dashboard tenants={tenants} rooms={rooms} rents={rents}/>}
   {tab==='tenants'&&<Tenants tenants={tenants} setTenants={setTenants} rooms={rooms} demo={demo}/>}
   {tab==='rooms'&&<Rooms rooms={rooms}/>}
   {tab==='rent'&&<Rent tenants={tenants} rents={rents} setRents={setRents} demo={demo}/>}
  </main>
 </div>
}

function Login(p){return <div className="loginPage"><div className="loginCard"><div className="logo">D</div><h1>Welcome to Dabhade PG</h1><p className="muted">Secure PG Management</p><form onSubmit={p.login}><label>Email<input type="email" value={p.email} onChange={e=>p.setEmail(e.target.value)} placeholder="admin@example.com" required={!p.demo}/></label><label>Password<input type="password" value={p.password} onChange={e=>p.setPassword(e.target.value)} placeholder="••••••••" required={!p.demo}/></label>{p.error&&<div className="error">{p.error}</div>}<button className="primary full">Login to Dabhade PG</button></form>{p.demo&&<small>Demo preview is enabled until Supabase keys are added.</small>}</div></div>}

function Dashboard({tenants,rooms,rents}){const paid=rents.filter(x=>x.status==='Paid').reduce((a,x)=>a+Number(x.amount||0),0);const pending=rents.filter(x=>x.status==='Pending').reduce((a,x)=>a+Number(x.amount||0),0);return <section>
 <div className="hero"><div><span className="eyebrow">PG MANAGEMENT</span><h1>Dabhade PG</h1><p>Manage tenants, rooms and monthly rent from one place.</p></div><div className="heroIcon">🏠</div></div>
 <div className="cards"><Stat icon={<Users/>} label="Active Tenants" value={tenants.filter(t=>t.status!=='Inactive').length}/><Stat icon={<DoorOpen/>} label="Rooms" value={rooms.length}/><Stat icon={<CheckCircle2/>} label="Rent Collected" value={'₹'+paid.toLocaleString('en-IN')}/><Stat icon={<Clock3/>} label="Rent Pending" value={'₹'+pending.toLocaleString('en-IN')}/></div>
 <div className="panel"><div className="panelTitle"><h3>Recent Tenants</h3></div>{tenants.length?<div className="tableWrap"><table><thead><tr><th>Name</th><th>Phone</th><th>Room</th><th>Status</th></tr></thead><tbody>{tenants.slice(0,5).map(t=><tr key={t.id}><td><b>{t.full_name}</b></td><td>{t.phone||'—'}</td><td>{t.room_no||'—'}</td><td><span className="badge paid">{t.status||'Active'}</span></td></tr>)}</tbody></table></div>:<Empty text="No tenants added yet."/>}</div>
 </section>}

function Stat({icon,label,value}){return <div className="stat"><div className="statIcon">{icon}</div><div><span>{label}</span><strong>{value}</strong></div></div>}
function Empty({text}){return <div className="empty">{text}</div>}

function Tenants({tenants,setTenants,rooms,demo}){const [q,setQ]=useState(''),[open,setOpen]=useState(false),[form,setForm]=useState({full_name:'',phone:'',email:'',aadhaar:'',room_no:'',parent_name:'',parent_phone:'',security_deposit:'',address:''});
 const list=useMemo(()=>tenants.filter(t=>(t.full_name+' '+(t.phone||'')+' '+(t.room_no||'')).toLowerCase().includes(q.toLowerCase())),[tenants,q]);
 async function add(e){e.preventDefault();const payload={...form,security_deposit:Number(form.security_deposit||0),status:'Active'};if(demo){const x={id:Date.now().toString(),...payload};const next=[x,...tenants];setTenants(next);localStorage.setItem('dpg_tenants',JSON.stringify(next))}else{const {data,error}=await supabase.from('tenants').insert(payload).select().single();if(!error)setTenants([data,...tenants])}setForm({full_name:'',phone:'',email:'',aadhaar:'',room_no:'',parent_name:'',parent_phone:'',security_deposit:'',address:''});setOpen(false)}
 async function del(id){if(!confirm('Delete this tenant?'))return;if(!demo)await supabase.from('tenants').delete().eq('id',id);const next=tenants.filter(t=>t.id!==id);setTenants(next);if(demo)localStorage.setItem('dpg_tenants',JSON.stringify(next))}
 return <section><div className="toolbar"><div><h1>Tenants</h1><p className="muted">Add and manage Dabhade PG residents.</p></div><button className="primary" onClick={()=>setOpen(true)}><Plus size={18}/> Add Tenant</button></div>
 <div className="search"><Search size={18}/><input placeholder="Search name, phone or room..." value={q} onChange={e=>setQ(e.target.value)}/></div>
 <div className="panel tableWrap"><table><thead><tr><th>Tenant</th><th>Phone</th><th>Room</th><th>Parent</th><th>Deposit</th><th></th></tr></thead><tbody>{list.map(t=><tr key={t.id}><td><b>{t.full_name}</b><small>{t.email||''}</small></td><td>{t.phone||'—'}</td><td>{t.room_no||'—'}</td><td>{t.parent_name||'—'}<small>{t.parent_phone||''}</small></td><td>₹{Number(t.security_deposit||0).toLocaleString('en-IN')}</td><td><button className="iconBtn danger" onClick={()=>del(t.id)}><Trash2 size={17}/></button></td></tr>)}</tbody></table>{!list.length&&<Empty text="No matching tenants."/>}</div>
 {open&&<Modal title="Add Tenant" close={()=>setOpen(false)}><form className="gridForm" onSubmit={add}>{[['full_name','Full Name *'],['phone','Phone'],['email','Email'],['aadhaar','Aadhaar Number'],['parent_name','Parent Name'],['parent_phone','Parent Phone'],['security_deposit','Security Deposit'],['address','Permanent Address']].map(([k,l])=><label key={k}>{l}<input value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} required={k==='full_name'}/></label>)}<label>Room<select value={form.room_no} onChange={e=>setForm({...form,room_no:e.target.value})}><option value="">Select room</option>{rooms.map(r=><option key={r.id}>{r.room_no}</option>)}</select></label><div className="formActions"><button type="button" onClick={()=>setOpen(false)}>Cancel</button><button className="primary">Save Tenant</button></div></form></Modal>}</section>}

function Rooms({rooms}){return <section><div className="toolbar"><div><h1>Rooms</h1><p className="muted">Room availability and monthly rent.</p></div></div><div className="roomGrid">{rooms.map(r=><div className="roomCard" key={r.id}><div className="roomTop"><span>ROOM</span><strong>{r.room_no}</strong></div><p>{r.floor} • Capacity {r.capacity}</p><div className="roomBottom"><b>₹{Number(r.rent||0).toLocaleString('en-IN')}/month</b><span className={'badge '+(r.status==='Available'?'available':r.status==='Occupied'?'occupied':'pending')}>{r.status}</span></div></div>)}</div></section>}

function Rent({tenants,rents,setRents,demo}){const [form,setForm]=useState({tenant_id:'',month:new Date().toISOString().slice(0,7)+'-01',amount:'',status:'Paid',payment_method:'UPI'});async function save(e){e.preventDefault();const payload={...form,amount:Number(form.amount),paid_at:form.status==='Paid'?new Date().toISOString():null};if(demo){setRents([{id:Date.now().toString(),...payload},...rents])}else{const {data,error}=await supabase.from('rents').insert(payload).select().single();if(!error)setRents([data,...rents])}setForm({...form,amount:''})}return <section><div className="toolbar"><div><h1>Rent</h1><p className="muted">Track monthly payments and pending rent.</p></div></div><div className="rentLayout"><div className="panel"><h3>Record Payment</h3><form onSubmit={save} className="gridForm"><label>Tenant<select required value={form.tenant_id} onChange={e=>setForm({...form,tenant_id:e.target.value})}><option value="">Select tenant</option>{tenants.map(t=><option value={t.id} key={t.id}>{t.full_name} — Room {t.room_no||'—'}</option>)}</select></label><label>Month<input type="date" value={form.month} onChange={e=>setForm({...form,month:e.target.value})}/></label><label>Amount<input type="number" min="0" required value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}/></label><label>Status<select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option>Paid</option><option>Pending</option></select></label><label>Payment Method<select value={form.payment_method} onChange={e=>setForm({...form,payment_method:e.target.value})}><option>UPI</option><option>Cash</option><option>Bank</option></select></label><button className="primary">Save Rent</button></form></div><div className="panel"><h3>Payment History</h3>{rents.length?<div className="tableWrap"><table><thead><tr><th>Tenant</th><th>Month</th><th>Amount</th><th>Status</th><th>Method</th></tr></thead><tbody>{rents.map(r=><tr key={r.id}><td>{tenants.find(t=>t.id===r.tenant_id)?.full_name||'Tenant'}</td><td>{r.month}</td><td>₹{Number(r.amount).toLocaleString('en-IN')}</td><td><span className={'badge '+(r.status==='Paid'?'paid':'pending')}>{r.status}</span></td><td>{r.payment_method}</td></tr>)}</tbody></table></div>:<Empty text="No rent records yet."/>}</div></div></section>}

function Modal({title,close,children}){return <div className="modalBg"><div className="modal"><div className="modalHead"><h2>{title}</h2><button onClick={close}><X/></button></div>{children}</div></div>}

createRoot(document.getElementById('root')).render(<App/>);