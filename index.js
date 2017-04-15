var TelegramBot = require('node-telegram-bot-api');
var Respostas = require('./respostas.js');
var fs = require('fs');

var token = '331301552:AAGbImT9laYSVR0E_DYJODhA3udoislS1Aw';
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
}


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

// match aluguel [nome], se nao houver nome, pega o de todos
bot.onText(/\/aluguel(.+)*/, function (msg, match) {
  var fromId = msg.chat.id;
  var resp = match[1]
  if(resp!=undefined){
    resp = resp.toLowerCase().trim();
    resp = Respostas[resp];
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
