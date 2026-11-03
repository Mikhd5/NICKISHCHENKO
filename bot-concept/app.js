(function(){
'use strict';
const wall=document.getElementById('chatWall');
const clientView=document.getElementById('clientView');
const adminView=document.getElementById('adminView');
const customerTab=document.getElementById('customerTab');
const adminTab=document.getElementById('adminTab');
const stageTitle=document.getElementById('stageTitle');
const toast=document.getElementById('toast');
let activeFlow=null,stepIndex=0,answers={},leads=[
{id:'#1042',name:'Андрій К.',contact:'@andrii_k',service:'Авто зі США',status:'Нова',kind:'new'},
{id:'#1041',name:'Олександр М.',contact:'+380 •• ••• 12 45',service:'Викуп авто',status:'У роботі',kind:'work'},
{id:'#1040',name:'Ірина В.',contact:'@iryna_v',service:'Обмін авто',status:'Завершена',kind:'done'}
];
const flows={
usa:{title:'Замовити авто зі США',steps:[
{q:'Яку марку або модель автомобіля розглядаєте?',hint:'Наприклад: BMW X5, Audi Q7 або поки не визначилися.',type:'text',placeholder:'Марка та модель'},
{q:'Який бюджет на автомобіль під ключ?',type:'choice',choices:['До $10 000','$10 000–15 000','$15 000–25 000','$25 000+','Потрібна консультація']},
{q:'Який тип кузова вам підходить?',type:'choice',choices:['Кросовер / SUV','Седан','Універсал','Не принципово']},
{q:'Залиште ім’я та контакт для зв’язку.',type:'contact'}]},
sell:{title:'Продати автомобіль',steps:[
{q:'Який автомобіль хочете продати?',hint:'Марка, модель і комплектація.',type:'text',placeholder:'Наприклад: Volkswagen Passat B8'},
{q:'Вкажіть рік випуску та пробіг.',type:'text',placeholder:'2018 рік · 145 000 км'},
{q:'Опишіть стан авто та бажану ціну.',hint:'За наявності можна додати фото менеджеру пізніше.',type:'text',placeholder:'Стан, пошкодження, бажана ціна'},
{q:'Як до вас звертатися та куди написати?',type:'contact'}]},
trade:{title:'Обміняти автомобіль',steps:[
{q:'Який автомобіль пропонуєте на обмін?',type:'text',placeholder:'Марка, модель, рік, пробіг'},
{q:'На який автомобіль хочете обміняти?',type:'text',placeholder:'Модель або побажання'},
{q:'Який варіант доплати розглядаєте?',type:'choice',choices:['Можу доплатити до $2 000','$2 000–5 000','$5 000+','Хочу обговорити']},
{q:'Залиште ім’я та контакт для зв’язку.',type:'contact'}]},
pick:{title:'Підібрати автомобіль',steps:[
{q:'Яку марку або модель шукаєте?',type:'text',placeholder:'Наприклад: Audi A6'},
{q:'Ваш орієнтовний бюджет?',type:'choice',choices:['До $10 000','$10 000–15 000','$15 000–25 000','$25 000+']},
{q:'Що важливо врахувати під час підбору?',hint:'Тип пального, комплектація, привід та інші побажання.',type:'text',placeholder:'Ваші побажання'},
{q:'Залиште ім’я та контакт.',type:'contact'}]}
};
function showToast(text){toast.textContent=text;toast.classList.add('show');clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>toast.classList.remove('show'),2600)}
function escapeHtml(v){return String(v||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function bubble(text,extra){return '<div class="bubble '+(extra||'')+'">'+text+'</div>'}
function renderHome(){
activeFlow=null;stepIndex=0;answers={};
wall.innerHTML='<div class="date-chip">Сьогодні</div>'+bubble('Вітаємо у <strong>NICKISHCHENKO</strong>! 👋<br>Допоможемо знайти, придбати або продати автомобіль.<br><br>Оберіть, що вас цікавить:')+
'<div class="bot-menu"><button class="bot-btn" data-service="usa"><span class="ico">🇺🇸</span><span>Авто зі США</span></button><button class="bot-btn" data-service="sell"><span class="ico">₴</span><span>Продати авто</span></button><button class="bot-btn" data-service="trade"><span class="ico">⇄</span><span>Обміняти авто</span></button><button class="bot-btn" data-service="pick"><span class="ico">⌕</span><span>Підібрати авто</span></button><button class="bot-btn wide" data-action="delivery"><span class="ico">♧</span>Як проходить доставка зі США?</button><button class="bot-btn wide" data-action="manager"><span class="ico">◉</span>Зв’язатися з менеджером</button></div>';
}
function addUser(text){wall.insertAdjacentHTML('beforeend',bubble(escapeHtml(text),'out'))}
function renderStep(){
const flow=flows[activeFlow],step=flow.steps[stepIndex],progress=Math.round(stepIndex/flow.steps.length*100);
let html='<div class="flow-progress"><span class="p-'+progress+'"></span></div>'+bubble('<strong>'+escapeHtml(flow.title)+'</strong><br>'+escapeHtml(step.q)+(step.hint?'<span class="sub">'+escapeHtml(step.hint)+'</span>':'' )+'<span class="sub">Крок '+(stepIndex+1)+' із '+flow.steps.length+'</span>');
if(step.type==='choice'){
html+='<div class="choice-grid">'+step.choices.map((v,i)=>'<button class="choice" data-choice="'+i+'">'+escapeHtml(v)+'</button>').join('')+'</div>';
}else if(step.type==='contact'){
html+='<form class="form-step" id="stepForm"><input name="name" placeholder="Ваше ім’я" required maxlength="70" autocomplete="name"><input name="contact" placeholder="Телефон або @Instagram" required maxlength="100"><button type="submit">Продовжити →</button></form>';
}else{
html+='<form class="form-step" id="stepForm"><input name="answer" placeholder="'+escapeHtml(step.placeholder||'Ваша відповідь')+'" required maxlength="180"><button type="submit">Продовжити →</button></form>';
}
wall.insertAdjacentHTML('beforeend',html);wall.scrollTop=wall.scrollHeight;
}
function nextStep(value){
const flow=flows[activeFlow],step=flow.steps[stepIndex];
answers[stepIndex]=value;
addUser(typeof value==='object'?(value.name+' · '+value.contact):value);
stepIndex++;
if(stepIndex<flow.steps.length){renderStep()}else{renderSummary()}
}
function renderSummary(){
const flow=flows[activeFlow];
const lines=flow.steps.map((s,i)=>'<p><b>'+escapeHtml(s.q)+'</b><br>'+escapeHtml(typeof answers[i]==='object'?(answers[i].name+' · '+answers[i].contact):answers[i])+'</p>').join('');
wall.insertAdjacentHTML('beforeend',bubble('Дякуємо! Перевірте, будь ласка, вашу заявку:')+'<div class="summary"><h4>ПОПЕРЕДНЯ ЗАЯВКА · '+escapeHtml(flow.title.toUpperCase())+'</h4>'+lines+'<button data-action="submitLead">Підтвердити заявку ↗</button><button data-action="restart" class="summary-secondary">Змінити відповіді</button></div>');
wall.scrollTop=wall.scrollHeight;
}
function submitLead(){
const flow=flows[activeFlow];const contact=answers[flow.steps.length-1]||{name:'Демо-клієнт',contact:'контакт у демо'};
const lead={id:'#'+(1043+leads.length-3),name:contact.name,contact:contact.contact,service:flow.title,status:'Нова',kind:'new'};
leads.unshift(lead);renderLeads();
wall.insertAdjacentHTML('beforeend',bubble('✅ <strong>Дякуємо, '+escapeHtml(contact.name)+'!</strong><br>Вашу заявку сформовано в демонстраційному режимі.<br><br>У робочій версії менеджер отримає всі відповіді та зв’яжеться з вами.',''));
wall.scrollTop=wall.scrollHeight;activeFlow=null;showToast('Демо-заявку додано до CRM-прикладу');
}
function startFlow(key){
activeFlow=key;stepIndex=0;answers={};const flow=flows[key];
wall.innerHTML='<div class="date-chip">Нова заявка</div>';addUser(flow.title);renderStep();
}
function renderLeads(){
const rows=document.getElementById('leadRows');
rows.innerHTML=leads.map((l,i)=>'<div class="lead"><div><strong>'+escapeHtml(l.name)+'</strong><small>'+escapeHtml(l.id)+' · '+escapeHtml(l.contact)+'</small></div><div class="service-tag">'+escapeHtml(l.service)+'</div><div><span class="status '+(l.kind==='done'?'done':l.kind==='new'?'new':'')+'">'+escapeHtml(l.status)+'</span></div><div><button class="lead-action" data-lead="'+i+'">'+(l.kind==='new'?'Взяти':l.kind==='work'?'Закрити':'Переглянути')+'</button></div></div>').join('');
document.getElementById('metricTotal').textContent=String(leads.length).padStart(2,'0');
document.getElementById('metricNew').textContent=String(leads.filter(l=>l.kind==='new').length).padStart(2,'0');
document.getElementById('metricWork').textContent=String(leads.filter(l=>l.kind==='work').length).padStart(2,'0');
document.getElementById('metricDone').textContent=String(leads.filter(l=>l.kind==='done').length).padStart(2,'0');
}
function showView(which){
const isAdmin=which==='admin';clientView.hidden=isAdmin;adminView.hidden=!isAdmin;
customerTab.classList.toggle('active',!isAdmin);adminTab.classList.toggle('active',isAdmin);
customerTab.setAttribute('aria-selected',String(!isAdmin));adminTab.setAttribute('aria-selected',String(isAdmin));
stageTitle.textContent=isAdmin?'CRM менеджера':'Інтерфейс клієнта';
if(isAdmin)renderLeads();
}
wall.addEventListener('click',e=>{
const svc=e.target.closest('[data-service]');if(svc){startFlow(svc.dataset.service);return}
const choice=e.target.closest('[data-choice]');if(choice&&activeFlow){const step=flows[activeFlow].steps[stepIndex];nextStep(step.choices[Number(choice.dataset.choice)]);return}
const action=e.target.closest('[data-action]')?.dataset.action;
if(action==='home'||action==='reset'){renderHome();return}
if(action==='manager'){addUser('Хочу поспілкуватися з менеджером');wall.insertAdjacentHTML('beforeend',bubble('Звичайно! У робочій версії бот передасть менеджеру ваш Telegram-профіль і короткий контекст звернення.<br><br><span class="gold">NICKISHCHENKO · особистий контакт</span>'));wall.scrollTop=wall.scrollHeight;return}
if(action==='delivery'){addUser('Як проходить доставка зі США?');wall.insertAdjacentHTML('beforeend',bubble('<strong>5 етапів до отримання ключів:</strong><br>01 · Підбір авто<br>02 · Перевірка та викуп<br>03 · Доставка й логістика<br>04 · Документи та оформлення<br>05 · Передача автомобіля<br><span class="sub">На кожному етапі менеджер пояснює наступні кроки та погоджує важливі рішення.</span>'));wall.scrollTop=wall.scrollHeight;return}
if(action==='submitLead'){submitLead();return}
if(action==='restart'&&activeFlow){stepIndex=0;answers={};wall.innerHTML=bubble('Повернімося до початку заявки.');renderStep()}
});
wall.addEventListener('submit',e=>{
if(e.target.id!=='stepForm')return;e.preventDefault();
const data=new FormData(e.target);if(flows[activeFlow].steps[stepIndex].type==='contact'){
const name=String(data.get('name')||'').trim(),contact=String(data.get('contact')||'').trim();if(!name||!contact)return;nextStep({name,contact});
}else{const val=String(data.get('answer')||'').trim();if(val)nextStep(val)}
});
document.getElementById('leadRows').addEventListener('click',e=>{
const btn=e.target.closest('[data-lead]');if(!btn)return;const i=Number(btn.dataset.lead),lead=leads[i];
if(lead.kind==='new'){lead.kind='work';lead.status='У роботі';showToast('Заявку взято в роботу')}
else if(lead.kind==='work'){lead.kind='done';lead.status='Завершена';showToast('Заявку позначено завершеною')}
else{showToast('Картка заявки · '+lead.id)}
renderLeads();
});
customerTab.addEventListener('click',()=>showView('customer'));
adminTab.addEventListener('click',()=>showView('admin'));
document.getElementById('newLead').addEventListener('click',()=>{leads.unshift({id:'#'+(1043+leads.length-3),name:'Новий клієнт',contact:'@demo_client',service:'Нова консультація',status:'Нова',kind:'new'});renderLeads();showToast('Додано демонстраційну заявку')});
document.getElementById('refreshLeads').addEventListener('click',()=>{renderLeads();showToast('Демонстраційні дані оновлено')});
renderHome();renderLeads();
})();
