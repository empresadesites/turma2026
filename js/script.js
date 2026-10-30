const PRECO_BASE = 10, PRECO_EXTRA = 2;
const FRUTAS = [
  {id:'morango', nome:'Morango', cor:'#E2373F'},
  {id:'uva', nome:'Uva', cor:'#7A3E9D'}
];
const RECHEIOS = [
  {id:'chocolate', nome:'Chocolate', cor:'#6B3A26'},
  {id:'ninho', nome:'Ninho', cor:'#F3E6CC'}
];
const st = {fruta:'morango', recheio:'chocolate', qty:1, x:{brownie:0, fruta:0, recheio:0, mousse:0, chanty:0}};
const fruta = () => FRUTAS.find(f => f.id === st.fruta);
const recheio = () => RECHEIOS.find(r => r.id === st.recheio);
const ITENS = () => [
  {k:'brownie', nome:'Brownie', cor:'#4A2C21', det:'molhadinho'},
  {k:'fruta', nome:fruta().nome, cor:fruta().cor, det:'fruta escolhida'},
  {k:'recheio', nome:'Recheio de ' + recheio().nome, cor:recheio().cor, det:'recheio escolhido'},
  {k:'mousse', nome:'Mousse', cor:'#8E5B3E', det:'cremoso'},
  {k:'chanty', nome:'Chantyninho', cor:'#FFFBF4', det:'por cima'}
];
const brl = v => 'R$ ' + v.toFixed(2).replace('.', ',');
const $ = id => document.getElementById(id);

function chips(el, list, key){
  el.setAttribute('role','radiogroup');
  el.innerHTML = list.map(o => `<label class="chip"><input type="radio" name="${key}" value="${o.id}" ${st[key]===o.id?'checked':''}><span><i class="dot" style="background:${o.cor}"></i>${o.nome}</span></label>`).join('');
  el.addEventListener('change', e => { st[key] = e.target.value; render(); });
}
chips($('frutas'), FRUTAS, 'fruta');
chips($('recheios'), RECHEIOS, 'recheio');

function extrasUI(){
  $('extras').innerHTML = ITENS().map(i => `<div class="extra"><div class="nm">${i.nome}<small>+ R$ 2 por camada</small></div><div class="step"><button type="button" data-k="${i.k}" data-d="-1" aria-label="Tirar camada extra de ${i.nome}">−</button><output id="o-${i.k}">0</output><button type="button" data-k="${i.k}" data-d="1" aria-label="Adicionar camada extra de ${i.nome}">+</button></div></div>`).join('');
}
$('extras').addEventListener('click', e => {
  const b = e.target.closest('button[data-k]'); if (!b) return;
  st.x[b.dataset.k] = Math.max(0, Math.min(3, st.x[b.dataset.k] + +b.dataset.d)); render();
});
$('qMinus').onclick = () => { st.qty = Math.max(1, st.qty - 1); render(); };
$('qPlus').onclick = () => { st.qty = Math.min(20, st.qty + 1); render(); };
document.querySelectorAll('input[name=receber]').forEach(r => r.addEventListener('change', () => { $('endBox').hidden = document.querySelector('input[name=receber]:checked').value !== 'Entrega'; }));

function totalExtras(){ return Object.values(st.x).reduce((a,b)=>a+b,0); }
function precoCopo(){ return PRECO_BASE + PRECO_EXTRA * totalExtras(); }

let lastKey='';
function drawCup(){
  const its = ITENS().filter(i => st.x[i.k] > 0);
  $('badges').innerHTML = its.length ? its.map(i => '<span class="badge">+' + st.x[i.k] + ' ' + i.nome + '</span>').join('') : '<span class="none">Uma camada de cada ingrediente</span>';
  const key = JSON.stringify(st);
  if (lastKey && key !== lastKey) { const im = $('cupImg'); im.classList.remove('bump'); void im.offsetWidth; im.classList.add('bump'); setTimeout(() => im.classList.remove('bump'), 260); }
  lastKey = key;
}
function resumo(){
  const ex = ITENS().filter(i => st.x[i.k] > 0).map(i => i.nome + ' x' + st.x[i.k]);
  const rec = document.querySelector('input[name=receber]:checked').value;
  const linhas = [
    'Pedido – Brownie da Felicidade',
    'Nome: ' + ($('nome').value.trim() || '-'),
    'Copos: ' + st.qty + ' (300 ml)',
    'Fruta: ' + fruta().nome,
    'Recheio: ' + recheio().nome,
    'Camadas extras: ' + (ex.length ? ex.join(', ') + ' (+' + brl(PRECO_EXTRA * totalExtras()) + ' por copo)' : 'nenhuma'),
    'Receber: ' + rec + (rec === 'Entrega' ? ' – ' + ($('end').value.trim() || '-') : ''),
  ];
  if ($('obs').value.trim()) linhas.push('Obs.: ' + $('obs').value.trim());
  linhas.push('Total: ' + brl(precoCopo() * st.qty) + (rec === 'Entrega' ? ' + taxa de entrega (por conta do cliente)' : ''));
  return linhas.join('\n');
}

function render(){
  if (!$('o-brownie')) extrasUI();
  ITENS().forEach(i => {
    $('o-' + i.k).value = st.x[i.k];
    const row = $('o-' + i.k).closest('.extra');
    row.querySelector('.nm').firstChild.nodeValue = i.nome;
    row.querySelector('[data-d="-1"]').disabled = st.x[i.k] === 0;
    row.querySelector('[data-d="1"]').disabled = st.x[i.k] === 3;
  });
  $('baseList').innerHTML = ITENS().map(i => `<li><span>${i.nome}</span><em>1 camada</em></li>`).join('');
  $('qty').value = st.qty; $('qMinus').disabled = st.qty === 1;
  const n = totalExtras();
  $('total').textContent = brl(precoCopo() * st.qty);
  $('totalNote').textContent = st.qty + (st.qty > 1 ? ' copos' : ' copo') + (n ? ', ' + n + (n > 1 ? ' camadas extras' : ' camada extra') + ' cada' : ', sem camadas extras') + (st.qty > 1 ? ' · ' + brl(precoCopo()) + ' cada' : '');
  drawCup();
}
function valida(){
  $('err').textContent = ''; $('ok').textContent = '';
  if (!$('nome').value.trim()) { $('err').textContent = 'Escreva seu nome para enviar o pedido.'; $('nome').focus(); return false; }
  const rec = document.querySelector('input[name=receber]:checked').value;
  if (rec === 'Entrega' && !$('end').value.trim()) { $('err').textContent = 'Escreva o endereço para a entrega.'; $('end').focus(); return false; }
  return true;
}
// ===== CONFIGURAÇÃO DO PIX =====
const PIX_CHAVE = 'f6eb027b-4f23-4192-a24e-8ad8b8a70117';          // chave Pix (e-mail, celular com +55, CPF/CNPJ ou chave aleatória)
const PIX_NOME = 'JHONATAN F G OLIVEIRA';  // nome de quem recebe (até 25 letras, sem acento)
const PIX_CIDADE = 'IPATINGA'; // cidade (até 15 letras, sem acento)
const WHATS = '';              // WhatsApp do grupo para endereço de entrega, ex.: '5531999999999'
// ================================
const semAcento = t => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
const tlv = (id, v) => id + String(v.length).padStart(2, '0') + v;
function crc16(str){ let c = 0xFFFF; for (let i = 0; i < str.length; i++) { c ^= str.charCodeAt(i) << 8; for (let k = 0; k < 8; k++) c = (c & 0x8000) ? ((c << 1) ^ 0x1021) & 0xFFFF : (c << 1) & 0xFFFF; } return c.toString(16).toUpperCase().padStart(4, '0'); }
function pixPayload(valor){
  const mai = tlv('00', 'br.gov.bcb.pix') + tlv('01', PIX_CHAVE.trim());
  let p = tlv('00', '01') + tlv('26', mai) + tlv('52', '0000') + tlv('53', '986') + tlv('54', valor.toFixed(2)) + tlv('58', 'BR') +
          tlv('59', semAcento(PIX_NOME).slice(0, 25)) + tlv('60', semAcento(PIX_CIDADE).slice(0, 15)) + tlv('62', tlv('05', '***')) + '6304';
  return p + crc16(p);
}
function resetar(){
  st.fruta = FRUTAS[0].id; st.recheio = RECHEIOS[0].id; st.qty = 1; Object.keys(st.x).forEach(k => st.x[k] = 0);
  document.querySelectorAll('input[name=fruta]').forEach(r => r.checked = r.value === st.fruta);
  document.querySelectorAll('input[name=recheio]').forEach(r => r.checked = r.value === st.recheio);
  document.querySelector('input[name=receber][value="Retirar na feira"]').checked = true; $('endBox').hidden = true;
  $('nome').value = ''; $('end').value = ''; $('obs').value = ''; $('err').textContent = ''; $('ok').textContent = '';
  lastKey = ''; render();
}
let doneTimer, pixCode = '';
function fechar(){ clearTimeout(doneTimer); $('done').hidden = true; $('done').classList.remove('go'); $('okStep').hidden = true; $('payStep').hidden = false; resetar(); window.scrollTo({top:0, behavior: reduce ? 'auto' : 'smooth'}); }
$('zap').onclick = () => {
  if (!valida()) return;
  const total = precoCopo() * st.qty, ent = document.querySelector('input[name=receber]:checked').value === 'Entrega';
  $('payTotal').textContent = brl(total);
  $('paySum').textContent = resumo();
  $('zapEnd').hidden = !ent; $('payMsg').textContent = '';
  const box = $('qr'); box.innerHTML = '';
  if (!PIX_CHAVE.trim()) { pixCode = ''; box.innerHTML = '<p class="warn">Chave Pix ainda não configurada.</p>'; $('copyPix').hidden = true; }
  else { pixCode = pixPayload(total); $('copyPix').hidden = false; try { new QRCode(box, { text: pixCode, width: 196, height: 196, colorDark: '#000000', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.M }); } catch (e) { box.innerHTML = '<p class="warn">Não foi possível gerar o QR Code. Use "Copiar código Pix".</p>'; } }
  $('done').hidden = false; $('pago').focus();
};
$('copyPix').onclick = async () => { try { await navigator.clipboard.writeText(pixCode); $('payMsg').textContent = 'Código Pix copiado. Cole no app do banco em Pix Copia e Cola.'; } catch (e) { $('payMsg').textContent = 'Não foi possível copiar. Leia o QR Code com a câmera do app do banco.'; } };
$('zapEnd').onclick = () => { window.open('https://wa.me/' + WHATS + '?text=' + encodeURIComponent(resumo()), '_blank', 'noopener'); $('payMsg').textContent = 'Endereço aberto no WhatsApp. Toque em enviar.'; };
$('voltar').onclick = () => { $('done').hidden = true; };
$('pago').onclick = () => { $('payStep').hidden = true; $('okStep').hidden = false; void $('done').offsetWidth; $('done').classList.add('go'); $('novo').focus(); doneTimer = setTimeout(fechar, 4000); };
$('novo').onclick = fechar;
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('done').hidden && !$('payStep').hidden) $('done').hidden = true; });
$('copy').onclick = async () => { if (!valida()) return; try { await navigator.clipboard.writeText(resumo()); $('ok').textContent = 'Pedido copiado. Cole na conversa e envie.'; } catch (e) { $('err').textContent = 'Não foi possível copiar. Use o botão do WhatsApp.'; } };
render();
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), {threshold:.15});
document.querySelectorAll('.reveal').forEach(el => reduce ? el.classList.add('in') : io.observe(el));
document.querySelectorAll('.builder > div > .panel').forEach((el, i) => { el.style.setProperty('--d', (i % 3) * 0.09 + 's'); el.style.setProperty('--rot', (i % 2 ? 1.5 : -1.5) + 'deg'); });
document.querySelectorAll('.info dl > div').forEach((el, i) => { el.classList.add('reveal'); el.style.setProperty('--d', i * 0.12 + 's'); reduce ? el.classList.add('in') : io.observe(el); });
if (!reduce) {
  const drip = document.querySelector('.drip'), h1 = document.querySelector('.hero h1'), scr = document.querySelector('.hero .script'), lead = document.querySelector('.hero .lead'),
        facts = [...document.querySelectorAll('.fact')], cupH = document.querySelector('.hero-pic img'), disc = document.querySelector('.hero-pic'), price = document.querySelector('.price'),
        heroEl = document.querySelector('.hero'), info = document.querySelector('.imgwrap img'), cupB = document.getElementById('cupImg');
  let sy = scrollY, ty = scrollY, t0 = performance.now();
  const clamp = v => Math.max(0, Math.min(1, v));
  const frame = now => {
    ty = scrollY; sy += (ty - sy) * 0.11;
    const hh = heroEl.offsetHeight || 600, p = clamp(sy / hh), e = p * p * (3 - 2 * p);
    drip.style.setProperty('--drip', 1 + e * 1.4);
    h1.style.transform = 'translateY(' + (-e * 70) + 'px)'; h1.style.opacity = 1 - e * 0.7;
    scr.style.transform = 'translateX(' + (e * 90) + 'px) rotate(' + (-e * 4) + 'deg)';
    lead.style.transform = 'translateY(' + (-e * 40) + 'px)'; lead.style.opacity = 1 - e;
    facts.forEach((f, i) => { f.style.transform = 'translateY(' + (-e * (24 + i * 6)) + 'px) rotate(' + (e * (i % 2 ? 3 : -3)) + 'deg)'; f.style.opacity = 1 - e * 0.8; });
    const float = Math.sin((now - t0) / 900) * 6;
    cupH.style.transform = 'translateY(' + (e * 140 + float) + 'px) scale(' + (1 - e * 0.12) + ') rotate(' + (-e * 10 + Math.sin((now - t0) / 1400) * 1.5) + 'deg)';
    price.style.transform = 'rotate(' + (-8 + e * 200) + 'deg) scale(' + (1 - e * 0.25) + ') translateY(' + (e * 60) + 'px)';
    disc.style.setProperty('--sc', 1 + e * 0.15);
    if (info) { const r = info.getBoundingClientRect(), k = clamp(1 - (r.top + r.height / 2) / innerHeight); info.style.transform = 'scale(' + (1.22 - k * 0.22) + ') translateY(' + ((0.5 - k) * 50) + 'px)'; }
    if (cupB) { const r = cupB.getBoundingClientRect(); if (r.bottom > 0 && r.top < innerHeight) cupB.style.translate = '0 ' + (Math.sin((now - t0) / 1100) * 4) + 'px'; }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
