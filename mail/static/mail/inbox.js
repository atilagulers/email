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
  const message_box = document.querySelector('#message-box');

  show_message(data.message, data.error ? 'error' : 'success');

  load_mailbox('sent');
}

function show_message(message, type) {
  const message_box = document.querySelector('#message-box');
  message_box.innerHTML = message;
  message_box.style.display = 'block';
  message_box.classList.add(`${type}`);
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
}

async function view_email(id) {
  hide_all_views();
  document.querySelector('#email-view').style.display = 'block';
  const email_view = document.querySelector('#email-view');
  email_view.innerHTML = '';

  const response = await fetch(`/emails/${id}`);
  const email = await response.json();
  await read_email(id);

  email_view.innerHTML = `
    <p id=''><strong>From: </strong>${email.sender}</p>
    <p id=''><strong>To: </strong>${email.recipients}</p>
    <p id=''><strong>Subject: </strong>${email.subject}</p>
    <p id=''><strong>Timestamp: </strong>${email.timestamp}</p>
    `;

  // Reply button
  const reply_button = document.createElement('button');
  reply_button.classList.add('btn', 'btn-primary');
  reply_button.style.marginRight = '10px';
  reply_button.innerHTML = 'Reply';
  reply_button.addEventListener('click', () => {
    compose_email();
    document.querySelector('#compose-recipients').value = email.sender;
    document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
    document.querySelector(
      '#compose-body'
    ).value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}\n`;

    document.querySelector('#compose-body').focus();
  });
  email_view.appendChild(reply_button);

  // Archive button
  const archive_button = document.createElement('button');
  archive_button.classList.add('btn');
  archive_button.classList.add(
    email.archived ? 'btn-outline-primary' : 'btn-outline-danger'
  );
  archive_button.innerHTML = email.archived ? 'Unarchive' : 'Archive';
  archive_button.addEventListener('click', async () => {
    console.log(email.id, email.archived);
    await update_archive(email.id, !email.archived);

    if (email.archived) {
      load_mailbox('inbox');
    } else {
      load_mailbox('archive');
    }
  });

  email_view.appendChild(archive_button);

  // Email body
  const email_body = document.createElement('p');
  email_body.id = 'email-body';
  email_body.textContent = email.body;

  // Add hr
  const hr = document.createElement('hr');
  email_view.appendChild(hr);

  // Append to email view
  email_view.appendChild(email_body);
}

async function read_email(id) {
  const response = await fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true,
    }),
  });
}

async function update_archive(id, archived) {
  const response = await fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived,
    }),
  });

  const msg = archived
    ? 'Email archived successfully.'
    : 'Email unarchived successfully.';

  show_message(msg, 'success');
}

async function fetch_emails(mailbox) {
  const response = await fetch(`/emails/${mailbox}`);
  const data = await response.json();
  return data;
}
