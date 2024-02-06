document.addEventListener('DOMContentLoaded', function () {
  // Use buttons to toggle between views
  document
    .querySelector('#inbox')
    .addEventListener('click', () => load_mailbox('inbox'));
  document
    .querySelector('#sent')
    .addEventListener('click', () => load_mailbox('sent'));
  document
    .querySelector('#archived')
    .addEventListener('click', () => load_mailbox('archive'));

  document.querySelector('#compose').addEventListener('click', compose_email);

  document
    .querySelector('#compose-form')
    .addEventListener('submit', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

async function send_email(e) {
  e.preventDefault();

  const response = await fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: 'atila@example.com',
      subject: 'This is very very important email !!!',
      body: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Esse, sed, eum hic ut cupiditate error sapiente enim sint harum quia consequuntur. Non consectetur in eius nihil provident necessitatibus tenetur inventore. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quod earum vel omnis, similique, sapiente tempora cum aspernatur incidunt tenetur officia iste porro aperiam velit doloremque inventore? Placeat sapiente aspernatur totam.',
    }),
  });

  const data = await response.json();
  console.log(data);
}

function compose_email() {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

async function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  const emails_view = document.querySelector('#emails-view');

  emails_view.innerHTML = `<h3>${
    mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
  }</h3>`;

  // fetch emails
  const response = await fetch('/emails/inbox');
  const data = await response.json();

  data.forEach((email) => {
    const email_element = document.createElement('div');
    email_element.id = 'email';

    email_element.innerHTML = `
    <p id='email-subject' style='padding-right: 24px'>${email.subject}</p> 
    <p id='email-body'>${email.body}</p> 
    <p id='email-timestamp'>${email.timestamp}</p>
    `;
    emails_view.appendChild(email_element);
  });
}
