// TÉRMINOS Y CONDICIONES
function openTnC(e){
  if(e) e.preventDefault();
  document.getElementById('tncModal').classList.add('open');
}
function closeTnC(){
  document.getElementById('tncModal').classList.remove('open');
}
function acceptTnC(){
  document.getElementById('chk-tnc').checked = true;
  closeTnC();
}



// UPLOAD
const fi=document.getElementById('fileInput'),fl=document.getElementById('filesList'),ba=document.getElementById('btnAnalyze'),dz=document.getElementById('dropZone');
let files=[];
fi.addEventListener('change',e=>add([...e.target.files]));
dz.addEventListener('dragover',e=>{e.preventDefault();dz.classList.add('over');});
dz.addEventListener('dragleave',()=>dz.classList.remove('over'));
dz.addEventListener('drop',e=>{e.preventDefault();dz.classList.remove('over');add([...e.dataTransfer.files].filter(f=>f.type==='application/pdf'));});
function add(nf){
  let blocked=false;
  nf.forEach(f=>{if(files.find(x=>x.name===f.name))return;if(files.length>=3){blocked=true;return;}files.push(f);});
  if(blocked)document.getElementById('proUpgradeModal').classList.add('open');
  render();
}
function render(){
  fl.innerHTML='';
  files.forEach((f,i)=>{const r=document.createElement('div');r.className='file-row';r.innerHTML=`<span class="fr-name">📄 ${f.name}</span><span class="fr-ok">✓</span><button class="fr-rm" onclick="removeFile(${i})">✕</button>`;fl.appendChild(r);});
  const has=files.length>0;
  document.getElementById('emailWrap').style.display=has?'block':'none';
  ba.disabled=!has||!(document.getElementById('userEmail').value||'').includes('@');
}
function removeFile(i){files.splice(i,1);render();}
document.getElementById('userEmail').addEventListener('input',()=>{ba.disabled=files.length===0||!document.getElementById('userEmail').value.includes('@');});
ba.addEventListener('click',startAnalysis);
function startAnalysis(){
  document.getElementById('analyzingOv').classList.add('active');
  const ids=['s1','s2','s3','s4','s5'];let i=0;
  const iv=setInterval(()=>{
    if(i>0){const p=document.getElementById(ids[i-1]);p.className='step-row done';p.querySelector('.step-ico').textContent='✓';}
    if(i<ids.length){document.getElementById(ids[i]).className='step-row active';i++;}
    else{clearInterval(iv);setTimeout(()=>{document.getElementById('analyzingOv').classList.remove('active');document.getElementById('uploadState').style.display='none';document.getElementById('resultsPanel').classList.add('active');},500);}
  },750);
}
document.getElementById('btnReset').addEventListener('click',()=>{
  files=[];render();
  document.getElementById('uploadState').style.display='block';
  document.getElementById('resultsPanel').classList.remove('active');
  ['s1','s2','s3','s4','s5'].forEach((id,i)=>{const el=document.getElementById(id);el.className='step-row';el.querySelector('.step-ico').textContent=i+1;});
  document.getElementById('analyzingOv').classList.remove('active');
});

// FAQ
function toggleFaq(el){const item=el.closest('.faq-item');const open=item.classList.contains('open');document.querySelectorAll('.faq-item').forEach(i=>i.classList.remove('open'));if(!open)item.classList.add('open');}

// MODALS
function showUpgrade(){document.getElementById('upgradeModal').classList.add('open');}
document.querySelectorAll('.modal-bg').forEach(m=>m.addEventListener('click',function(e){if(e.target===this)this.classList.remove('open');}));

// CHECKOUT FLOW
function openCheckoutDictamen(){
  openCheckoutPlan('dictamen', '$141.999', 'Dictamen Contable', 141999, 'Por dictamen · 5 días hábiles', 'DICTAMEN_PLAN_ID');
}
function openCheckout(){
  openCheckoutPlan('pro', '$29.999', 'Plan Pro · Mensual', 29999, 'Cancelá cuando quieras', 'TU_PLAN_ID');
}
function openCheckoutPlan(planId, precio, planNombre, precioNum, frecuencia, mpPlanId){
  document.querySelectorAll('.modal-bg').forEach(m=>m.classList.remove('open'));
  const widgetEmail = document.getElementById('userEmail')?.value || '';
  if(widgetEmail) document.getElementById('chk-email').value = widgetEmail;
  // Update modal with plan info
  document.getElementById('chk-plan-nombre').textContent = planNombre;
  document.getElementById('chk-plan-nombre-2').textContent = planNombre;
  document.getElementById('chk-plan-freq').textContent = frecuencia;
  document.getElementById('chk-plan-precio').textContent = precio;
  document.getElementById('chk-plan-id').value = planId;
  document.getElementById('chk-plan-mp').value = mpPlanId;
  document.getElementById('chk-plan-num').value = precioNum;
  document.getElementById('checkoutStep1').style.display = 'block';
  document.getElementById('checkoutStep2').style.display = 'none';
  document.getElementById('chk-error').style.display = 'none';
  document.getElementById('checkoutModal').classList.add('open');
}
function closeCheckout(){
  document.getElementById('checkoutModal').classList.remove('open');
}
function submitCheckout(){
  const nombre = document.getElementById('chk-nombre').value.trim();
  const apellido = document.getElementById('chk-apellido').value.trim();
  const email = document.getElementById('chk-email').value.trim();
  const tel = document.getElementById('chk-tel').value.trim();
  const errEl = document.getElementById('chk-error');

  // Validación
  if(!nombre){ errEl.textContent='El nombre es obligatorio.'; errEl.style.display='block'; return; }
  if(!apellido){ errEl.textContent='El apellido es obligatorio.'; errEl.style.display='block'; return; }
  if(!email || !email.includes('@')){ errEl.textContent='Ingresá un email válido.'; errEl.style.display='block'; return; }
  if(tel && tel.length > 0 && !/^[0-9\+\-\s\(\)]{6,20}$/.test(tel)){ errEl.textContent='El teléfono ingresado no es válido.'; errEl.style.display='block'; return; }
  if(!document.getElementById('chk-tnc').checked){ errEl.textContent='Debés aceptar los Términos y Condiciones para continuar.'; errEl.style.display='block'; return; }
  errEl.style.display='none';

  // Guardar datos (localStorage + futuro endpoint)
  const planId = document.getElementById('chk-plan-id').value;
  const precioNum = parseInt(document.getElementById('chk-plan-num').value);
  const mpPlanId = document.getElementById('chk-plan-mp').value;
  const lead = { nombre, apellido, email, tel, plan: planId, precio: precioNum, fecha: new Date().toISOString(), pagado: false };
  try {
    const leads = JSON.parse(localStorage.getItem('ec_leads') || '[]');
    leads.push(lead);
    localStorage.setItem('ec_leads', JSON.stringify(leads));
  } catch(e){}

  // TODO: cuando tengas backend, descomentar esto:
  // fetch('https://TU-BACKEND.railway.app/api/leads', {
  //   method: 'POST',
  //   headers: {'Content-Type':'application/json'},
  //   body: JSON.stringify(lead)
  // });

  // Mostrar step 2
  document.getElementById('checkoutStep1').style.display = 'none';
  document.getElementById('checkoutStep2').style.display = 'block';
  document.getElementById('confirm-email-msg').textContent = 'Te enviamos una confirmación a ' + email + ' cuando se acredite el pago.';

  // Enviar email de confirmación vía backend
  // TODO: descomentar cuando tengas el backend
  // fetch('https://TU-BACKEND.railway.app/api/send-confirmation', {
  //   method: 'POST',
  //   headers: {'Content-Type':'application/json'},
  //   body: JSON.stringify({
  //     to: email,
  //     nombre: nombre,
  //     plan: planId,
  //     precio: precioNum
  //   })
  // });

  // Redirigir a MercadoPago después de 1.5s
  setTimeout(() => {
    window.open('https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=' + mpPlanId, '_blank');
    closeCheckout();
  }, 1500);
}

// CALCULATOR
function calcular(){
  const c=parseFloat(document.getElementById('calcCosto').value)||0;
  const q=parseFloat(document.getElementById('calcCoef').value)||0;
  const imp=c*(q/100);
  const fmt=n=>'$'+Math.round(n).toLocaleString('es-AR');
  document.getElementById('calcResult').textContent=fmt(imp);
  document.getElementById('calcAnual').textContent=fmt(imp*12)+' / año adicionales';
  document.getElementById('calcA').textContent=fmt(c*0.035092);
  document.getElementById('calcB').textContent=fmt(c*0.058251);
  document.getElementById('calcC').textContent=fmt(c*0.046621);
}
calcular();

// BANNER ROTATIVO
const adUrls=['https://limpiomax.com.ar','https://seguredificio.com.ar','https://tecniconsorcio.com.ar'];
let adCurrent=0;
function showAd(n){
  document.querySelectorAll('.ad-slide').forEach((s,i)=>{s.classList.toggle('hidden',i!==n);});
  document.querySelectorAll('.ad-dot').forEach((d,i)=>{d.classList.toggle('active',i===n);});
  document.getElementById('bannerLink').href=adUrls[n];
  adCurrent=n;
}
setInterval(()=>showAd((adCurrent+1)%3),10000);
