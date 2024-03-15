import bot from './assets/bot.svg';
import user from './assets/user.svg';

// trigger HTML elements using document.QuerySelector
const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

// function: load messages '...' loader 300 rate millasecond
function loader(element){
    element.textContent = '';

    loadInterval = setInterval(() => {
        // add another dot '.'
        element.textContent += '.';

        // reset '...'
        if(element.textContent === '....'){
            element.textContent = '';
        }
    }, 300)
}

// function: letter by letter output
function typeText(element, text){
    // set index
    let index = 0;

    // create another interval
    let interval = setInterval(()=> {
        if(index < text.length){
            element.innerHTML += text.charAt(index);
            index++;
        } else {
            clearInterval(interval);
        }
    }, 20)
}

// function: unique id for each message 
function generateUniqueId() {
    const timeStamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);

    return `id-${timeStamp}-${hexadecimalString}`;
}

// function: AI chatStripe response
function chatStripe(isAi, value, uniqueId){
return (
    `
    <div class="wrapper ${isAi && 'ai'} " >
        <div class="chat">
            <div class="profile">
                <img
                src="${isAi ? bot : user}"
                alt="${isAi ? 'bot' : 'user'}"
                />
            </div>
            <div class="message" id=${uniqueId}>${value}</div>
        </div>
    </div>
    `
)
}

// handler function: trigger for AI generated response
const handlerSubmit = async(e)=> {

    // prevent browser reload
    e.preventDefault();

    // get data typed into form element
    const data = new FormData(form);

    // generate: user chatStripe
    chatContainer.innerHTML += chatStripe(false, data.get('prompt'));

    // clear textarea
    form.reset();

    // generate: bot chatStripe
    const uniqueId = generateUniqueId();
    chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

    //scroll height
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // fetch new div
    const messageDiv = document.getElementById(uniqueId);

    // turn on loader and pass message
    loader(messageDiv);

    // fetch data from server -> get bot response
    const response = await fetch('http://localhost:5002', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            // data coming from textarea element on screen
            prompt: data.get('prompt')
        })
    })

    // clear screen
    clearInterval(loadInterval);

    // clear dots so message can be added
    messageDiv.innerHTML = '';

    if(response.ok){
        // this gives the actual response coming from back-end
        const data = await response.json();
        // parse data
        const parsedData = data.bot.trim();

        console.log({parsedData});

        typeText(messageDiv, parsedData);
    } else {
        // if error
        const err = await response.text();

        messageDiv.innerHTML = "Something went very very wrong my friend, check your work!";

        alert(err);
    }
}


// to see changes to handleSubmit
form.addEventListener('submit', handlerSubmit);

// for enter key press
form.addEventListener('keyup', (e) => {

    if(e.keyCode === 13){
        handlerSubmit(e);
    }
})








