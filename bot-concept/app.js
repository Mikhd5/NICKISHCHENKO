(function(){
'use strict';
const wall=document.getElementById('chatWall');
const stageTitle=document.getElementById('stageTitle');
const toast=document.getElementById('toast');
let activeFlow=null,stepIndex=0,answers={};
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
html+='<form class="form-step" id="stepForm"><input name="name" placeholder="Ваше ім’я" maxlength="70" autocomplete="name"><input name="contact" placeholder="Телефон або @Instagram" maxlength="100"><button type="submit">Продовжити →</button><div class="form-error" aria-live="polite"></div></form>';
}else{
html+='<form class="form-step" id="stepForm"><input name="answer" placeholder="'+escapeHtml(step.placeholder||'Ваша відповідь')+'" maxlength="180"><button type="submit">Продовжити →</button></form>';
}
wall.insertAdjacentHTML('beforeend',html);wall.scrollTop=wall.scrollHeight;
bindStepForm();
}
function bindStepForm(){
const form=document.getElementById('stepForm');
if(!form)return;
form.addEventListener('submit',event=>{
event.preventDefault();
const data=new FormData(form);
const error=form.querySelector('.form-error');
const type=flows[activeFlow].steps[stepIndex].type;
if(type==='contact'){
const name=String(data.get('name')||'').trim();
const contact=String(data.get('contact')||'').trim();
if(!name||!contact){
error.textContent='Заповніть ім’я та контакт, щоб продовжити.';
const field=!name?form.elements.name:form.elements.contact;
field.focus();
return;
}
nextStep({name,contact});
}else{
const value=String(data.get('answer')||'').trim();
if(!value){
error.textContent='Введіть відповідь у поле вище, будь ласка.';
form.elements.answer.focus();
return;
}
nextStep(value);
}
});
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
const contact=answers[flows[activeFlow].steps.length-1]||{name:'друже',contact:'контакт'};
wall.insertAdjacentHTML('beforeend',bubble('✅ <strong>Дякуємо, '+escapeHtml(contact.name)+'!</strong><br>Демонстраційний сценарій завершено. У реальному боті підтверджена заявка збережеться та надійде менеджеру в Telegram.',''));
wall.scrollTop=wall.scrollHeight;activeFlow=null;showToast('Демонстраційний сценарій завершено');
}
function startFlow(key){
activeFlow=key;stepIndex=0;answers={};const flow=flows[key];
wall.innerHTML='<div class="date-chip">Нова заявка</div>';addUser(flow.title);renderStep();
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

renderHome();
})();
