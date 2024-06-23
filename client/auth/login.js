const form = document.querySelector('form')
const user = document.querySelector('#user')
const pass = document.querySelector('#pass')
const display = document.querySelector('.error')
form.addEventListener('submit', async (e) => {
    e.preventDefault()
    display.textContent = ''
    try {
        const res = await fetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ user: user.value, pass: pass.value }),
            headers: { 'Content-Type': 'application/json' }
        })
        const data = await res.json();
        if (res.status === 400 || res.status === 500) {
            return display.textContent = `${data.message}. ${data.error ? data.error : ''}`
        }
        if (res.status === 201) {
            //localStorage.setItem('token', data.token); 
            window.location.assign('/messages');
            return;
        }
        //data.role === "admin" ? location.assign('/admin') : location.assign('/basic')
    } catch (err) {
        console.log(err.message);
    }
});
