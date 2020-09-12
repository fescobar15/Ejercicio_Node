const fs = require("fs");
const http = require("http");
const axios = require("axios");
const url = require("url");

//URLs to find the data
const urlClientes =
  "https://gist.githubusercontent.com/josejbocanegra/986182ce2dd3e6246adcf960f9cda061/raw/f013c156f37c34117c0d4ba9779b15d427fb8dcd/clientes.json";

const urlProveedores =
  "https://gist.githubusercontent.com/josejbocanegra/d3b26f97573a823a9d0df4ec68fef45f/raw/66440575649e007a9770bcd480badcbbc6a41ba7/proveedores.json";

//Function to manipulate index.html to show desired data
let readFile = (type, json, callback) => {
  fs.readFile("index.html", (err, data) => {
    //Build title and table
    let html = `<h1 class="text-center">Listado de ${type}</h1>
    <table class="table table-striped">
      <thead>
        <tr>
          <th scope="col">ID</th>
          <th scope="col">Nombre</th>
          <th scope="col">Contacto</th>
        </tr>
      </thead>
      <tbody>`;

    let id = "";
    let compania = "";
    let contacto = "";

    //Loop through the data and add a new row for each
    for (let i = 0; i < json.length; i++) {
      const element = json[i];
      //Depending on the data the names in the json change
      if (type === "Clientes") {
        id = element.idCliente;
        compania = element.NombreCompania;
        contacto = element.NombreContacto;
      } else if (type === "Proveedores") {
        id = element.idproveedor;
        compania = element.nombrecompania;
        contacto = element.nombrecontacto;
      }
      //Add new row
      html += `<tr> <td>${id}</td> <td>${compania}</td> <td>${contacto}</td> </tr>`;
    }

    //CLose tags
    html += `</tbody>
              </table>`;

    //Replace content with the new content
    let pageContent = data.toString();
    pageContent = pageContent.replace("{{replace}}", html);
    callback(pageContent);
  });
};

//Create server and listen
http
  .createServer((req, res) => {
    //Get requested path
    const queryString = url.parse(req.url, true);
    const path = queryString.href;

    //Request data depending on the path
    let request = "";
    let tipo = "";
    if (path === "/api/proveedores") {
      request = urlProveedores;
      tipo = "Proveedores";
    } else if (path === "/api/clientes") {
      request = urlClientes;
      tipo = "Clientes";
    }
    axios.get(request).then((response) => render(tipo, response.data, res));
  })
  .listen(8081);

//Function to render final result
function render(type, json, res) {
  readFile(type, json, (data) => {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(data);
  });
}
