var TelegramBot = require('node-telegram-bot-api');
var Respostas = require('./respostas.js');
var firebase = require("firebase");
var admin = require("firebase-admin");
var serviceAccount = require("./firebase-key.json");

//token do telegram
var token = process.env.BOT_TOKEN;

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
var moradoresRef = root.child("moradores").on("value", function(snapshot){
	moradores = snapshot.val();
});
root.child("respostas").on("value", function(snapshot){
	respostas = snapshot.val();
});
root.child("lista").on("child_added", function(snapshot, prevKey){
	lista.push(snapshot.val());
});
root.child("lista").on("child_removed", function(snapshot, prevKey){
	lista.push(snapshot.val());
});
/*=============/INICIALIZAÇÃO DO DB (firebase)=============*/

// Setup polling way
var bot = new TelegramBot(token, {polling: true});

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
  bot.sendMessage(fromId, respostas.conta);
});

bot.onText(/\/conta/, function (msg, match) {
  var fromId = msg.chat.id;
  bot.sendMessage(fromId, Respostas.conta);
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
