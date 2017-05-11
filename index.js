var TelegramBot = require('node-telegram-bot-api');
var Respostas = require('./respostas.js');
var fs = require('fs');
var firebase = require("firebase");

//token do telegram
var token = process.env.BOT_TOKEN;

 var config = {
    apiKey: "AIzaSyCJO4By-DuU2QdO7ZsmTZSCO4spoKyqwWI",
    authDomain: "telegram-bot-barao.firebaseapp.com",
    databaseURL: "https://telegram-bot-barao.firebaseio.com",
    projectId: "telegram-bot-barao",
    storageBucket: "telegram-bot-barao.appspot.com",
    messagingSenderId: "360130612382"
  };
  firebase.initializeApp(config);

//inicializações de BD
/*firebase.initializeApp({
  serviceAccount: "serviceAccountCredentials.json",
  databaseURL: "https://telegram-bot-barao.firebaseio.com"
});
*/
var database = firebase.database();

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


bot.onText(/\/rem/, function (msg, match) {
  chatId = msg.from.id;
  reminder();
});

//manda uma mensagem a cada 24h
var reminder = function(){
	setTimeout(function(){
		if(chatId!=undefined){
	  		bot.sendMessage(chatId, chatId);
		}
	reminder();
   	}, 1000*60*60*24);
};


// Matches /echo [whatever]
bot.onText(/\/echo (.+)/, function (msg, match) {
  var fromId = msg.chat.id;
  var resp = match[1];
  bot.sendMessage(fromId, fromId);
});

bot.onText(/\/help/, function (msg, match) {
  var fromId = msg.chat.id;
  bot.sendMessage(fromId, Respostas.help);
});

bot.onText(/\/conta/, function (msg, match) {
  var fromId = msg.chat.id;
  bot.sendMessage(fromId, Respostas.conta);
});

bot.onText(/\/set(.+)*/, function (msg, match) {
  var fromId = msg.chat.id;
  if(match.length!=2 || isNaN(match[2])){
    bot.sendMessage(fromId, "uso errado: "+match[1]+"-"+match[2]);
  }else{
    var morador = resp = match[1].toLowerCase().trim();
    var valor = match[2];
    firebase.database().ref("moradores/"+morador).set(valor); 
    bot.sendMessage(fromId, morador+":"+valor);
  }
});

// match aluguel [nome], se nao houver nome, pega o de todos
bot.onText(/\/aluguel(.+)*/, function (msg, match) {
  var fromId = msg.chat.id;
  var resp = match[1]
  if(resp!=undefined){
    resp = resp.toLowerCase().trim();
    //resp = Respostas[resp];
    resp = firebase.database().ref('moradores/'+resp);
  }else{
    resp = Respostas["alexandre"]+Respostas["bexiga"]+Respostas["montanha"]+Respostas["doug"];
  }
  bot.sendMessage(fromId, resp);
});

// envia a foto do seu barriga hahahahahah
bot.onText(/\/cobrar/, function (msg, match) {
  var fromId = msg.chat.id;
  bot.sendPhoto(fromId, Respostas.cobrar, {caption: 'Pague o aluguel!'});
});

bot.onText(/(b|B)om dia/, function (msg, match) {
  var fromId = msg.chat.id;
  bot.sendMessage(fromId, Respostas.bom_dia);
});
