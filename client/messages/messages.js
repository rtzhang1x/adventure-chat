//const token = localStorage.getItem('token');
//console.log(token);
const socket = io();

var messages = document.querySelector('.messages__history');
var form = document.querySelector('.message_form');
var input = document.querySelector('.message_form__input');
var button = document.querySelector('.message_form__button');

input.addEventListener('input', function(e) {
    if (input.value) {
        socket.emit('typing');
        button.disabled = false;
    } else {
        button.disabled = true;
    }
});

form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (input.value) {
        socket.emit('chat message', input.value);
        input.value = '';
        button.disabled = true;
    }
});

socket.on('chat message', function(msg) {
    var itemrow = document.createElement('tr');
    var itemtext = document.createElement('td')
    itemtext.textContent = msg.user + ": " + msg.text;
    itemrow.appendChild(itemtext);
    messages.appendChild(itemrow);
    window.scrollTo(0, document.body.scrollHeight);
});
