const TelegramBot = require('node-telegram-bot-api');
const fetch = require('node-fetch')

const bot = new TelegramBot('5025119553:AAGqIUKZVVFnZ6_QNx6qZER6EOK0onBC1sg', {polling: true});

let lang = 'en';
let type = 'def';

async function getWeather(city, id) {
    try {
        let url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&lang=${lang}&appid=e16f11b015029d8cebcb9f86394726b6&units=metric`;
        const res = await fetch(url);
        const data = await res.json(); 

        city = city.charAt(0).toUpperCase() + city.substring(1);
        let description = data.weather[0].description;
    
        bot.sendMessage(id, `
        ${city}:\n
${lang === 'en' ? 'Temperature' : 'Температура'}: ${Math.round(data.main.temp)}°C
${lang === 'en' ? 'Wind speed' : 'Скорость ветра'}: ${Math.round(data.wind.speed)}m/s
${lang === 'en' ? 'Humidity' : 'Влажность'}: ${data.main.humidity}%
${description.charAt(0).toUpperCase() + description.substring(1)}
        `);
    } catch(err) {
        bot.sendMessage(id, `Cannot find city like ${city}`)
    }
}

async function start(id) {
    const res = await fetch('https://pastebin.com/raw/V9S6KMRs');
    const data = await res.json(); 

    bot.sendMessage(id, (lang === 'en' ? data.start.en : data.start.ru))
}

async function help(id) {
    const res = await fetch('https://pastebin.com/raw/V9S6KMRs');
    const data = await res.json(); 

    bot.sendMessage(id, (lang === 'en' ? data.help.en : data.help.ru))
}

async function setLang(id, mess) {
    const res = await fetch('https://pastebin.com/raw/V9S6KMRs');
    const data = await res.json(); 

    mess = mess.replace(new RegExp('/', 'g'), '');
    lang = mess;

    bot.sendMessage(id, (mess === 'en' ? data.setLang.en : data.setLang.ru))
}

let country = '';
async function setTime(id, mess) {
    const res = await fetch('https://pastebin.com/raw/V9S6KMRs');
    const data = await res.json();
    
    if(type === 'def') {
        bot.sendMessage(id, (lang === 'en' ? data.setRemCity.en : data.setRemCity.ru));
        type = 'setCity';
        return
    } else if(type === 'setCity') {
        bot.sendMessage(id, (lang === 'en' ? data.setRemTime.en : data.setRemTime.ru));
        type = 'setTime';
        country = mess;
        return
    } else if(type === 'setTime') {
        bot.sendMessage(id, (lang === 'en' ? `Set reminder for ${country} at ${mess}` : `Установленно напоминание для ${country} в ${mess}`));
        setRem(id, country, mess)
        type = 'def';
    }
}

function setRem(id, city, time) {
    let date = new Date();
    let currentHours = date.getHours();
    let currentMinutes = date.getMinutes();

    let hours = +time.split(':')[0];
    let minutes = +time.split(':')[1];

    setTimeout(() => {
        if(currentHours === hours && currentMinutes === minutes) getWeather(city, id)
        setRem(id, city, time)
    }, 60000)
}

bot.onText(/\/start/, (msg, match) => {
    start(msg.chat.id)
    return
});
bot.onText(/\/help/, (msg, match) => {
    help(msg.chat.id)
    return
})
bot.onText(/\/en/, (msg, match) => {
    setLang(msg.chat.id, msg.text)
    return
});
bot.onText(/\/setWeather/, (msg, match) => {
    setTime(msg.chat.id, msg.text)
    return
});
bot.onText(/\/ru/, (msg, match) => { setLang(msg.chat.id, msg.text); return });
bot.on('message', (msg) => {
    const Id = msg.chat.id;

    if(type === 'def') msg.text.split('')[0] !== '/' ? getWeather(msg.text, Id) : '';

    if((type === 'setCity' || type === 'setTime') && msg.text.split('')[0] !== '/') setTime(Id, msg.text)
        else type = 'def';
});