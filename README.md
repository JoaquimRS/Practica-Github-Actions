# Joaquim Ribera Soriano
## Practica-Github-Actions

### INTRODUCCIÓN TEÓRICA

### ACTIVIDAD
```
|-- cypress/
|   |-- fixtures/
|   |-- integration/
|   |-- plugins/
|   |-- support/
|   `-- videos/
|-- data/
|   `-- users.json
|-- .github/
|   `-- workflows/
|       `-- practica-github-actions.yaml
|-- helpers/
|   `-- users-repo.js
|-- pages/
|   |-- api/
|   `-- index.js
|-- public/
|   |-- favicon.ico
|   `-- vercel.svg
|-- cypress.json
|-- .eslintrc.json
|-- .gitignore
|-- jsconfig.json
|-- package.json
|-- package-lock.json
`-- vercel.json
```

##### 1. LINTER_JOB
> Se encargará de ejecutar el linter que ya está instalado en el proyecto (existe un script para ello en el package.json) para verificar que la sintaxis utilizada es la correcta en todos los fi-cheros JavaScript. En caso de que existan errores deberéis corregirlos hasta que el Job se ejecute sin problemas

Para ejecutar y que funcione correcteamente nuestro linter, en nuestro archivo dentro de **.github/workflows** el archivo **practica-github-actions.yml**, tendremos la siguiente configuración.
```yaml
name: practica_github_actions
on:
  push:
    branches:
      - main
jobs:
  Linter_job:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v2
      - name: Execute Linter
        run: npm install && npm run lint
```

Haremos un push con todos los cambios realizados
```bash
git add .
git commit -m "Linter_job test"
git push origin main
```

Una vez hagamos el push y se ejecute la action, veremos que en el registro de las actions hay un error en la sintaxis del codigo.

img=Linter_job_001.png
img=Linter_job_002.png

Ahora lo que haremos sera corregir la sintaxis de esos archivos
* ./pages/api/users/[id].js
```js
7   case 'GET': 
9   case 'PUT':
18  var user = usersRepo.getById(req.query.id);
```
Lo modificamos por:
```js
7   case "GET":
9   case "PUT":
18  let user = usersRepo.getById(req.query.id);

```
* ./pages/api/users/index.js
```js
7      case 'GET':
8        return getUsers();
9      case 'POST0':
10       return createUser();
11     default:
12         return res.status(405).end(`Method ${req.method} Not Allowed`);
13     case 'DELETE':
14       return deleteAllUsers();
```
Lo modificamos por:
```js
7      case "GET":
8        return getUsers();
9      case "POSTO":
10       return createUser();
11     case "DELETE":
12       return deleteAllUsers();
13     default:
14         return res.status(405).end(`Method ${req.method} Not Allowed`);
```

Y ahora ya funcionara el linter
img=Linter_job_003.png

##### 2. CYPRESS_JOB
> Se encargará de ejecutar los tests de cypress (link) que contiene el proyecto. Para ello, utilizaréis la action oficial del proyecto (link). Si lo deseáis, podéis ejecutar manualmente mediante el comando npm run cypress (siempre que esté arrancado el proyecto previamente). Este Job, que se ejecutará después del Linter_job, estará compuesto por los siguientes steps:
>* El encargado de realizar el checkout del código
>* El encargado de ejecutar los tests de cypress que continuará, aunque se produzca un error (existe una propiedad que podéis establecer para conseguir este comportamiento)
>* El encargado de crear un artefacto (result.txt) que contendrá la salida del step anterior

Para ejecutar y que funcione correcteamente nuestro cypress, en nuestro archivo dentro de **.github/workflows** el archivo **practica-github-actions.yml**, tendremos la siguiente configuración.

```yaml
name: practica_github_actions
on:
  push:
    branches:
      - main
jobs:
  Linter_job:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v2
      - name: Execute Linter
        run: npm install && npm run lint
  Cypress_job:
    runs-on: ubuntu-latest
    needs: Linter_job
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Cypress run
        uses: cypress-io/github-action@v5
        with:
          build: npm run build
          start: npm start
        continue-on-error: true
        id: cypress_result
      - name: Create Cypress Artifact
        run: echo ${{ steps.cypress_result.outcome }} > result.txt
      - name: Upload Cypress Result
        uses: actions/upload-artifact@v3
        with:
          name: cypress_result_txt
          path: result.txt
```
Una vez hagamos el push y se ejecute la action, veremos que en el registro de las actions los tests de cypress han fallado.
img=Cypress_job_001.png

Si investigamos un poco nos daremos cuenta de que hay un fallo en el codigo, en el archivo **./pages/api/users/index.js**, para corregirlo modificaremos lo siguiente:
```js
9    case "POSTO":
```
Lo modificaremos por:
```js
9    case "POST":
```

Y ahora los test de cypress no habran fallado:
img=Cypress_job_002.png

##### 3. ADD_BADGE_JOB
> Se encargará de publicar en el readme del proyecto el badge que indicará si se han superado los tests de cypress o no. 
Estará compuesto por los siguientes steps:
>* El encargado de realizar el checkout del código
>* El encargado de obtener los artefactos almacenados en el Job anterior
>* Un step encargado de generar un output partiendo de la lectura del artefacto recuperado. Básicamente ejecutará la instrucción echo "::set-output name=cypress_outcome:: $(cat result.txt)"
>* Un step que ejecutará una action propia que deberéis crear. Esta action recibirá como parámetro de entrada el output generado por el step anterior y, dependiendo de si es “failure” o “success”, modificará el README.md del proyecto añadiendo uno de los siguientes badges al final del mismo y tras el texto “RESULTADO DE LOS ÚLTIMOS TESTS”:
>   * (Failure) https://img.shields.io/badge/test-failure-red
>   * (Success) https://img.shields.io/badge/tested%20with-Cypress-04C38E.svg
>* Step encargado de publicar el cambio del README.md en el repositorio

Para poder realizar-lo lo que haremos sera crear la siguiente estructura de carpetas
```
|-- .github/
|   `-- workflows/
|       `-- practica-github-actions.yaml
|   `-- actions/
        `-- mod_readme/
            |-- action.yml
            |-- index.js
            `-- package.json
```
En cada fichero dentro de mod_readme pondremos la siguiente configuracion:
* package.json
```js
{
  "name": "mod_readme",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "build": "ncc build index.js"
  },
  "author": "",
  "license": "ISC",
  "dependencies": {
    "@actions/core": "^1.10.0",
    "@actions/github": "^5.1.1"
  },
  "devDependencies": {
    "@vercel/ncc": "^0.36.0"
  }
}
```
* action.yml
```yaml
name: Custom Action Modify Readme
description: "Action para coger el resultado de los tests de cypress y modificar el readme"
inputs:
  resultado:
    description: "Output del step anterior"
    required: true
runs:
  using: "node16"
  main: "dist/index.js"
```
* index.js
```js
const core = require("@actions/core")
const path = require('path')
const fs = require("fs")

const resultado_cypress = core.getInput("resultado")

const success = "https://img.shields.io/badge/tested with-Cypress-04C38E.svg"
const failure = "https://img.shields.io/badge/test-failure-red"

let badge = resultado_cypress == "success" ? success : failure

fs.readFile("./README.md", 'utf-8', (err, data) => {
    if (err) throw err;
    let start = data.indexOf("<inicio>")
    let end = data.indexOf("<fin>")
    let newText = `
<inicio>
RESULTADO DE LOS ÚLTIMOS TESTS: 
<img src="${badge}">
`
    console.log(newText);
    let newData = data.substring(0, start) + newText + data.substring(end);
    fs.writeFile("./README.md", newData, 'utf8', (err) => {
        if (err) throw err;
        console.log("El README ha sido modificado");
    })
})
```
Una vez con la estructura creada y los ficheros configurados haremos los siguientes comandos:
```bash
# Instalar todas las dependencias
npm install
# Crear el dist
npm run build
```

Esto nos creara el dist que utilizaremos en el fichero **./github/actions/mod_readme/action.yml**

Ahora para poder utilizar esta action en nuestro fichero **./github/workflows/practica-github-actions.yaml** pondremos la siguiente configuración:
```yaml
name: practica_github_actions
on:
  push:
    branches:
      - main
jobs:
  Linter_job:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v2
      - name: Execute Linter
        run: npm install && npm run lint
  Cypress_job:
    runs-on: ubuntu-latest
    needs: Linter_job
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Cypress run
        uses: cypress-io/github-action@v5
        with:
          build: npm run build
          start: npm start
        continue-on-error: true
        id: cypress_result
      - name: Create Cypress Artifact
        run: echo ${{ steps.cypress_result.outcome }} > result.txt
      - name: Upload Cypress Result
        uses: actions/upload-artifact@v3
        with:
          name: cypress_result_txt
          path: result.txt
  Add_badge_job:
    runs-on: ubuntu-latest
    if: ${{ always() }}
    needs: Cypress_job
    steps:
      - name: Checkout Code
        uses: actions/checkout@v3
      - name: Download Cypress Result
        uses: actions/download-artifact@v3
        with:
          name: cypress_result_txt
      - name: Get Cypress Result
        run: echo "::set-output name=cypress_outcome::$(cat result.txt)"
        id: cypress_status
      - name: Mod Readme
        uses: ./.github/actions/mod_readme
        with:
          resultado: ${{ steps.cypress_status.outputs.cypress_outcome }}
      - name: Push readme
        uses: EndBug/add-and-commit@v9
        with:
          add: "."
          author_name: "Joaquim Ribera Soriano"
          author_email: "joaquimdaweb@gmail.com"
          message: "Readme Updated"
          push: true        
```
Puede ser que no nos deje modificar el **README.md** porque alomejor el bot no tiene permisos de escritura, entonces modificando la configuración de nuestro **github** yendo a **Setting→Actions→General** seleccionamos esta opción:
img=Add_badge_job_001.png


Y ahora si realizamos el push y los tests de cypress son correctos tendremos este resultado en nuestro **README.md**:
img=Add_badge_job_002.png

Si hacemos que los tests de cypress fallen tendremos este resultado en nuestro **README.md**:
img=Add_badge_job_003.png



##### 4. DEPLOY_JOB
> Utilizando la action amondnet/vercel-action@v20, se encargará de publicar el proyecto en la plataforma vercel (link). Se ejecutará tras el Cypress_job y estará formado por dos steps:
> * El encargado de realizar el checkout del código
> * El encargado de desplegar la aplicación en vercel que utilizará la action amond-net/vercel-action@v20


Para poder desplegar nuestra aplicación con Vercel, lo primero que tendremos que hacer será generar un token, para ello debemos de estar registrados en *vercel.com* y irnos a:
>https://vercel.com/account/tokens

Generaremos un token de la siguiente manera:
img=Deploy_job_001.png

Una vez tengamos nuestro token, crearemos un nuevo proyecto:
img=Deploy_job_002.png

Importaremos nuestro repositorio de github:
img=Deploy_job_003.png

Y finalmente le daremos al boton de desplegar para iniciar nuestro proyecto:
img=Deploy_job_004.png

Y ya tendriamos nuestro token, ahora para poder utilizar la action de **amond-net/vercel-action@v20** tendremos que guardar 3 secrets en nuestro repositorio de github:
**1. VERCEL_TOKEN** será el token que acabamos de generar en *vercel.com*
**2. VERCEL_ORG_ID** se encuentra en **vercel.com/account -> settings -> general (al final)**
img=Deploy_job_005.png
**3. VERCEL_PROJECT_ID** se encuentra en **vercel.com/dashboard -> practica-github-actions -> settings -> general (al final)**
img=Deploy_job_006.png

Y el resultado final de nuestros secrets seria algo así:
img=Deploy_job_007.png

Una vez tengamos configurados los secrets para poder ejecutar esta action en el fichero **./github/workflows/practica-github-actions.yaml** pondremos la siguiente configuración:
```yaml
name: practica_github_actions
on:
  push:
    branches:
      - main
jobs:
  Linter_job:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v2
      - name: Execute Linter
        run: npm install && npm run lint
  Cypress_job:
    runs-on: ubuntu-latest
    needs: Linter_job
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Cypress run
        uses: cypress-io/github-action@v5
        with:
          build: npm run build
          start: npm start
        continue-on-error: true
        id: cypress_result
      - name: Create Cypress Artifact
        run: echo ${{ steps.cypress_result.outcome }} > result.txt
      - name: Upload Cypress Result
        uses: actions/upload-artifact@v3
        with:
          name: cypress_result_txt
          path: result.txt
  Add_badge_job:
    runs-on: ubuntu-latest
    if: ${{ always() }}
    needs: Cypress_job
    steps:
      - name: Checkout Code
        uses: actions/checkout@v3
      - name: Download Cypress Result
        uses: actions/download-artifact@v3
        with:
          name: cypress_result_txt
      - name: Get Cypress Result
        run: echo "::set-output name=cypress_outcome::$(cat result.txt)"
        id: cypress_status
      - name: Mod Readme
        uses: ./.github/actions/mod_readme
        with:
          resultado: ${{ steps.cypress_status.outputs.cypress_outcome }}
      - name: Push readme
        uses: EndBug/add-and-commit@v9
        with:
          add: "."
          author_name: "Joaquim Ribera Soriano"
          author_email: "joaquimdaweb@gmail.com"
          message: "Readme Updated"
          push: true
  Deploy_job:
    runs-on: ubuntu-latest
    needs: Cypress_job
    steps:
      - name: Checkout Code
        uses: actions/checkout@v3
      - name: Deploy Aplication
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./
```
Si todo ha ido bien, ya tendriamos nuestra aplicación desplegada con vercel:
> https://practica-github-actions-phi.vercel.app/


##### 5. NOTIFICATION_JOB
> Job de envío de notificación a los usuarios del proyecto. Ejecutará, entre otros, una action propia que podrá basarse en JavaScript. Se ejecutará siempre (aunque se haya producido un error en algún Job previo), y se encargará de enviar un correo con:
>* Destinatario: dirección de vuestro correo personal tomada de un secret de github
>* Asunto: Resultado del workflow ejecutado
>* Cuerpo del mensaje:
>> *Se ha realizado un push en la rama main que ha provocado la ejecución del workflow nombre_repositorio_workflow con los siguientes resultados:*
>>* *linter_job: resultado asociado*
>>* *cypress_job: resultado asociado*
>>* *add_badge_job: resultado asociado*
>>* *deploy_job: resultado asociado*

Para este job utilizaremos SendGrid para enviar los mensajes.
Para realizar este job lo primero que haremos sera inicar sesión en SendGrid (https://app.sendgrid.com/login/)
Una vez inicado sesión lo que haremos sera crear una API_KEY que pondremos en nuestros secrets de github, para ello iremos a https://app.sendgrid.com/settings/api_keys y generaremos una nueva key.
img=Notification_job_001.png

Luego nos hiremos a https://app.sendgrid.com/settings/sender_auth/senders y crearemos un enviador en este caso utilizare mi correo electronico de *joaquimdaweb@gmail.com* como remitente y lo validaremos.
img=Notification_job_002.png

Ahora lo que haremos sera crear la siguiente estructura en nuestro proyecto:
```
|-- .github/
|   `-- workflows/
|       `-- practica-github-actions.yaml
|   `-- actions/
        |-- mod_readme/
        |   |-- dist
        |   |-- action.yml
        |   |-- index.js
        |   `-- package.json
        `-- send_notification
            |-- action.yml
            |-- index.js
            `-- package.json
```
En cada fichero dentro de send_notification pondremos la siguiente configuracion:
* package.json
```js
{
  "name": "send_notification",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "build": "ncc build index.js"
  },
  "author": "",
  "license": "ISC",
  "dependencies": {
    "@actions/core": "^1.10.0",
    "@actions/github": "^5.1.1",
    "@sendgrid/mail": "^7.7.0"
  },
  "devDependencies": {
    "@vercel/ncc": "^0.36.0"
  }
}

```
* action.yml
```yaml
name: Custom Action Send Email
description: "Action para enviar un mensaje con todos los resultados de los jobs"
inputs:
  res_linter_job:
    description: "Resultado del Linter"
    required: true
  res_cypress_job:
    description: "Resultado del Cypress"
    required: true
  res_add_badge_job:
    description: "Resultado del Badge"
    required: true
  res_deploy_job:
    description: "Resultado del Deploy"
    required: true
  personal_email:
    description: "Correo personal"
    required: true
  api_key:
    description: "Token de la api"
    required: true
runs:
  using: "node16"
  main: "dist/index.js"

```
* index.js
```js
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
```
Una vez con la estructura creada y los ficheros configurados haremos los siguientes comandos:
```bash
# Instalar todas las dependencias
npm install
# Crear el dist
npm run build
```

Esto nos creara el dist que utilizaremos en el fichero **./github/actions/send_notification/action.yml**

Ahora para poder utilizar esta action en nuestro fichero **./github/workflows/practica-github-actions.yaml** pondremos la siguiente configuración:
```yaml
name: practica_github_actions
on:
  push:
    branches:
      - main
jobs:
  Linter_job:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v2
      - name: Execute Linter
        run: npm install && npm run lint
  Cypress_job:
    runs-on: ubuntu-latest
    needs: Linter_job
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Cypress run
        uses: cypress-io/github-action@v5
        with:
          build: npm run build
          start: npm start
        continue-on-error: true
        id: cypress_result
      - name: Create Cypress Artifact
        run: echo ${{ steps.cypress_result.outcome }} > result.txt
      - name: Upload Cypress Result
        uses: actions/upload-artifact@v3
        with:
          name: cypress_result_txt
          path: result.txt
  Add_badge_job:
    runs-on: ubuntu-latest
    if: ${{ always() }}
    needs: Cypress_job
    steps:
      - name: Checkout Code
        uses: actions/checkout@v3
      - name: Download Cypress Result
        uses: actions/download-artifact@v3
        with:
          name: cypress_result_txt
      - name: Get Cypress Result
        run: echo "::set-output name=cypress_outcome::$(cat result.txt)"
        id: cypress_status
      - name: Mod Readme
        uses: ./.github/actions/mod_readme
        with:
          resultado: ${{ steps.cypress_status.outputs.cypress_outcome }}
      - name: Push readme
        uses: EndBug/add-and-commit@v9
        with:
          add: "."
          author_name: "Joaquim Ribera Soriano"
          author_email: "joaquimdaweb@gmail.com"
          message: "Readme Updated"
          push: true
  Deploy_job:
    runs-on: ubuntu-latest
    needs: Cypress_job
    steps:
      - name: Checkout Code
        uses: actions/checkout@v3
      - name: Deploy Aplication
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./
  Notification_job:
    runs-on: ubuntu-latest
    needs: [Linter_job,Cypress_job,Add_badge_job,Deploy_job]
    steps:
      - name: Checkout Code
        uses: actions/checkout@v3
      - name: Send Mail
        uses: ./.github/actions/send_notification
        with:
          res_linter_job: ${{ needs.Linter_job.result }}
          res_cypress_job: ${{ needs.Cypress_job.result }}
          res_add_badge_job: ${{ needs.Add_badge_job.result }}
          res_deploy_job: ${{ needs.Deploy_job.result }}
          personal_email: ${{ secrets.PERSONAL_EMAIL }}
          api_key: ${{ secrets.APIKEY_SEND_GRID}}
```
Una vez tengamos el yaml configurado tendremos que añadir los secrets que nos faltan:
**1. PERSONAL_EMAIL** en mi caso *joaquimdaweb@gmail.com*
**2. APIKEY_SEND_GRID** la key que hemos generado al principio
Resultado final de los secrets:
img=Notification_job_003.png

Ahora si hacemos el push y todo funciona correctamente recibiremos un correo como el siguiente:
img=Notification_job_004.png

##### 6. README_PERSONAL
> Configurad en vuestro readme personal (el del repositorio que tiene como nombre vuestro usuario de github) una action que permita mostrar métricas de los lenguajes más utilizados en los proyectos de vuestro perfil de github. Disponéis de la siguiente action (link). En este otro enlace (link) tenéis descritos los pasos que necesitáis realizar para poder configurar y usar la action correctamente. Tenéis total libertad de añadir el panel informativo de métricas que más os guste de entre todos los disponibles (link).

Lo primero que haremos sera generar un **token** y guardarlo en los **secrets** de nuestro repositorio, en mi caso **JoaquimRS**:
* **Token** (https://github.com/settings/tokens):
img=Readme_personal_001.png
* **Secret** (https://github.com/JoaquimRS/JoaquimRS/settings/secrets/actions):
img=Readme_personal_002.png

Una vez creado y configurado nuestro token de github lo siguiente que haremos sera crear la estructura de carptas siguiente:
```
|-- .github/
|   `-- workflows/
|       `-- metrics.yaml
`-- README.md
```
Y en el fichero **.github/workflows/metrics.yaml** pondremos la siguiente configuración:
```yaml
name: Metrics
on:
  push:
    branches:
      - main
jobs:
  github-metrics:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: lowlighter/metrics@latest
        with:
          filename: metrics.plugin.isocalendar.svg
          token: ${{ secrets.METRICS_TOKEN }}
          base: ""
          plugin_isocalendar: yes
```
Luego en el **README.md**, pondremos lo siguiente al final del archivo:
```
...
![Metrics](/github-metrics.svg)
![Metrics](/metrics.plugin.isocalendar.svg)
```

Publicaremos los cambios y si todo funciona correctamente tendremos el siguiente resultado:
img=Readme_personal_003.png



<inicio>
RESULTADO DE LOS ÚLTIMOS TESTS: 
<img src="https://img.shields.io/badge/tested with-Cypress-04C38E.svg">
<fin>