var TelegramBot = require('node-telegram-bot-api');
var firebase = require("firebase");
var admin = require("firebase-admin");
var serviceAccount = require("./firebase-key.json");

var bot;
//token do telegram
const token = process.env.BOT_TOKEN;
if (process.env.NODE_ENV === 'production') {
  const webHook = { port: 443 };
  const url = process.env.APP_URL;
  bot = new TelegramBot(token, {webHook});
  bot.setWebHook(`${url}/bot${token}`); // In here for setting webHook
} else {
  bot = new TelegramBot(token, { polling: true }); // On devlopment mode
}


/*=============INICIALIZAÇÃO DO DB (firebase)=============*/
//objetos do banco, acessar os dados atraves deles
var respostas = {};
var moradores = {};
var lista = [];

var app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://telegram-bot-barao.firebaseio.com"
});
var db = app.database();
var root = db.ref();

//pega as referencias das respostas e moradores, atualiza quando são modificadas
var moradoresRef = root.child("moradores");
moradoresRef.on("value", function(snapshot){
	moradores = snapshot.val();
});
root.child("respostas").on("value", function(snapshot){
	respostas = snapshot.val();
});
var listaRef = root.child("lista");
listaRef.on("child_added", function(snapshot, prevKey){
	lista.push({'key': snapshot.key, 'value': snapshot.val()});
});
listaRef.on("child_removed", function(snapshot, prevKey){
	for(var i = 0; i < lista.length; i++) {
	    if(lista[i].key == snapshot.key) {
		lista.splice(i, 1);
		break;
	    }
	}
});
/*=============/INICIALIZAÇÃO DO DB (firebase)=============*/

var chatId;
bot.onText(/\/info/, function (msg, match) {
  var fromId = msg.chat.id;
  bot.sendMessage(fromId, "fromId: "+fromId);
  bot.sendMessage(fromId, "chatId: "+msg.chat.id);
  bot.sendMessage(fromId, "isPolling: "+bot.isPolling());
  bot.sendMessage(fromId, "hasOpenWebHook: "+bot.hasOpenWebHook());
});

// Matches /echo [whatever]
bot.onText(/\/echo (.+)/, function (msg, match) {
  var fromId = msg.chat.id;
  var resp = match[1];
  bot.sendMessage(fromId, resp);
});

bot.onText(/\/help/, function (msg, match) {
  var fromId = msg.chat.id;
  bot.sendMessage(fromId, respostas.help);
});

bot.onText(/\/conta/, function (msg, match) {
  var fromId = msg.chat.id;
  bot.sendMessage(fromId, respostas.conta);
});

bot.onText(/\/set (\w+) (\d+)/, function (msg, match) {
  var fromId = msg.chat.id;
  if(match.length!=3 || isNaN(match[2])){
    bot.sendMessage(fromId, "uso errado, foi lido: "+match[0]+"/"+match[1]+"/"+match[2]);
  }else{
    var morador = resp = match[1].toLowerCase().trim();
    var valor = match[2];

    var setter = {};
    setter[morador] = valor;

    moradoresRef.update(setter); 
    bot.sendMessage(fromId, morador+" : "+valor);
  }
});

// match aluguel [nome], se nao houver nome, pega o de todos
bot.onText(/\/aluguel(.+)*/, function (msg, match) {
  var fromId = msg.chat.id;
  var morador = match[1]
  if(morador!=undefined){
    morador = morador.toLowerCase().trim();
    bot.sendMessage(fromId, morador+": "+moradores[morador]);   
  }else{
    for(var attr in moradores){
        bot.sendMessage(fromId, attr +": "+moradores[attr]);
    }
  }
});

// envia a foto do seu barriga hahahahahah
bot.onText(/\/cobrar/, function (msg, match) {
  var fromId = msg.chat.id;
  bot.sendPhoto(fromId, respostas.cobrar, {caption: 'Pague o aluguel!'});
  
});

bot.onText(/(b|B)om dia/, function (msg, match) {
  var fromId = msg.chat.id;
  bot.sendMessage(fromId, respostas.bomdia);
});

bot.onText(/\/add (.+)*/, function(msg, match){
  var fromId = msg.chat.id;
  var item = match[1].toLowerCase().trim();
  listaRef.push().set(item);
  console.log("=========================================");
  console.log(lista[0]);
  var resp = lista.map(function(elem){
    return elem.value;
  }).join("\n");

  bot.sendMessage(fromId, "Item "+lista.length+") "+item+" adicionado");
});

bot.onText(/\/lista/, function(msg, match){
  var fromId = msg.chat.id;
  var count = 0;
  if(lista.length==0){
    bot.sendMessage(fromId, "Lista vazia");
    return;
  }
  var resp = lista.map(function(elem){
    count++;
    return count+") "+elem.value;
  }).join("\n");
  bot.sendMessage(fromId, resp);
});

bot.onText(/\/remove (\d+)/, function(msg, match){
  var fromId = msg.chat.id;
  var item = match[1];
  if(isNaN(item)){
    bot.sendMessage(fromId, "Escolher o item a remover pelo numero. Ex. /remove 3"); 
    return;   
  }
  if(item==0 || item>lista.length){
    bot.sendMessage(fromId, "Numero inválido"); 
    return;   
  }
  item--;
  var name = lista[item].value;
  listaRef.child(lista[item].key).remove();
 
  bot.sendMessage(fromId, "Removido: "+name);
});
