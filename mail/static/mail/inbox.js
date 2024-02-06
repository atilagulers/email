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

function hide_all_views() {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
}

async function send_email(e) {
  e.preventDefault();

  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  const response = await fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients,
      subject,
      body,
    }),
  });

  const data = await response.json();
  load_mailbox('sent');
}

function compose_email() {
  // Show compose view and hide other views
  hide_all_views();
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

async function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  hide_all_views();
  document.querySelector('#emails-view').style.display = 'block';

  // Show the mailbox name
  const emails_view = document.querySelector('#emails-view');

  emails_view.innerHTML = `<h3>${
    mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
  }</h3>`;

  // fetch emails
  const data = await fetch_emails(mailbox);

  data.forEach((email) => {
    const email_element = document.createElement('div');
    email_element.id = 'email';

    email_element.innerHTML = `
    <p id='email-subject' style='padding-right: 24px'>${email.subject}</p> 
    <p id='email-body'>${email.body}</p> 
    <p id='email-timestamp'>${email.timestamp}</p>
    `;

    email_element.style.backgroundColor = email.read ? 'white' : 'lightgrey';
    email_element.addEventListener('click', () => view_email(email.id));
    emails_view.appendChild(email_element);
  });

  async function view_email(id) {
    hide_all_views();
    document.querySelector('#email-view').style.display = 'block';
    const email_view = document.querySelector('#email-view');

    const email_element = document.createElement('div');

    const response = await fetch(`/emails/${id}`);
    const email = await response.json();
    await read_email(id);

    email_element.innerHTML = `
    <p id=''><strong>From:</strong> ${email.sender}</p>
    <p id=''><strong>To:</strong> ${email.recipients}</p>
    <p id=''><strong>Subject:</strong> ${email.subject}</p>
    <p id=''><strong>Timestamp:</strong>${email.timestamp}</p>
    <button id='archive'>Archive</button>
    `;

    email_element.innerHTML += `<button id='reply'>Reply</button>`;
    email_element.innerHTML += `<p id='email-body'>${email.body}</p>`;
    email_view.appendChild(email_element);
  }

  async function read_email(id) {
    console.log(id);
    const response = await fetch(`/emails/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        read: true,
      }),
    });

    console.log(response);
  }

  async function fetch_emails(mailbox) {
    const response = await fetch(`/emails/${mailbox}`);
    const data = await response.json();
    return data;
  }
}
