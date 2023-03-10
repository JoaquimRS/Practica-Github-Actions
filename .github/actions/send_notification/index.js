const core = require("@actions/core")
const sgMail = require('@sendgrid/mail');
const res_linter_job = core.getInput("res_linter_job")
const res_cypress_job = core.getInput("res_cypress_job")
const res_add_badge_job = core.getInput("res_add_badge_job")
const res_deploy_job = core.getInput("res_deploy_job")
const personal_email = core.getInput("personal_email")
const api_key = core.getInput("api_key")


sgMail.setApiKey(api_key);
const msg = {
  to: personal_email,
  from: 'joaquimdaweb@gmail.com', // Use the email address or domain you verified above
  subject: 'Resultado del workflow ejecutado',
  text: 'Se ha realizado un push en la rama main que ha provocado la ejecución del workflow practica-github-actions con los siguientes resultados:',
  html: `
  <strong>Se ha realizado un push en la rama main que ha provocado la ejecución del workflow practica-github-actions con los siguientes resultados:</strong>
  <table>
    <tr>
        <th>Job</th>
        <th>Resultado</th>
    </tr>
    <tr>
        <td>Linter_job</td>
        <td>${res_linter_job}</td>
    </tr>
    <tr>
        <td>Cypress_job</td>
        <td>${res_cypress_job}</td>
    </tr>
    <tr>
        <td>Add_badge_job</td>
        <td>${res_add_badge_job}</td>
    </tr>
    <tr>
        <td>Deploy_job</td>
        <td>${res_deploy_job}</td>
    </tr>

  </table>
  `,
};
sgMail.send(msg)