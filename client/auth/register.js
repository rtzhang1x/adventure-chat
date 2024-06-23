const form = document.querySelector('form');
const user = document.querySelector('#user');
const pass1 = document.querySelector('#pass1');
const pass2 = document.querySelector('#pass2');
const display = document.querySelector('.error');
form.addEventListener('submit', async (e) => {
    e.preventDefault()
    display.textContent = ''
    try {
        const res = await fetch('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ user: user.value, pass1: pass1.value, pass2: pass2.value }),
            headers: { 'Content-Type': 'application/json' }
        })
        const data = await res.json()
        if(res.status === 400 || res.status === 500) {
            window.location.reload();
            //return display.textContent = `${data.message}. ${data.error ? data.error : ''}`
        }
        if (res.status === 201) {
            window.location.assign('/auth/login');
            //return display.textContent = `${data.message}`;
        }
    } catch (err) {
        console.log(err.message)
    }
})
