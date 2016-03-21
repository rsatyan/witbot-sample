var Botkit = require('botkit');
var Witbot = require('witbot');
var twilio = require('twilio');
var moment = require('moment');

var slackToken = process.env.SLACK_TOKEN
//xoxb-28019563813-TCruwcdFyTQbgAy55voNGlau
var witToken = process.env.WIT_TOKEN
//PQOMKLNSVR2NBOONVYYJSUO65W3J663O
var openWeatherAPI = process.env.OPENWEATHER_KEY
//'3334736084fe683afc94064b5130f105'
var weather = require('./weather')(openWeatherAPI)

var accountSid=process.env.TWILIO_ACCOUNT_SID;
// Twilio Auth Token - found on your dashboard
var authToken=process.env.TWILIO_AUTH_TOKEN;
// A Twilio number that you have purchased through the twilio.com web
// interface or API
var twilioNumber=process.env.TWILIO_NUMBER;

var client = twilio(accountSid,authToken);

var controller  = Botkit.slackbot({
  debug:false
});

controller.spawn({
  token:slackToken
}).startRTM(function(err,bot,payload){
  if(err){
    throw new Error('Error connection to slack:',err)
  }
  console.log('Connected to slack')
})

var witbot = Witbot(witToken)

controller.hears('.*','direct_message,direct_mention,mention',function(bot,message){
  var wit = witbot.process(message.text,bot,message)


  var regex = /fuck|shit|cunt|asshole/i;
  if (regex.test(message.text)) {
    bot.reply(message, 'Now, now, no need to be so uncivilised...')
    return
  }

  wit.hears('hello', 0.5, function(bot,message,outcome){
    bot.reply(message, 'Hello to you as well! How can i help?')
  })

  wit.hears('How_are_you',0.5, function(bot,message,outcome){
    bot.reply(message, "I'm doing great! How can i help you?")
  })

  wit.hears('What_s_my_balance_',0.5,function(bot,message,outcome){
    bot.reply(message, 'Your current available balance as of '+ moment().format('LL') +' is $761.22')
  })

  wit.hears('payment_due',0.5,function(bot,message,outcome){
    bot.reply(message,'Your payment is due on ' + moment().endOf('month').format('LL'));
  })

  wit.hears('rewards',0.5,function(bot,message,outcome){
    bot.reply(message,'Your have 56,000 points, tap below to see your redemption options.');
  })

  wit.hears('pay',0.5,function(bot,message,outcome){
    bot.reply(message,'Your account ending in 3212 will be credited $231.23');
  })

  wit.hears('callme',0.5,function(bot,message,outcome){
    bot.reply(message,'Connecting you to an advisor. Please hold.');
    client.calls.create({
      url: "http://demo.twilio.com/docs/voice.xml",
      to: "+13027401050",
      from: "+13013386647"
    }, function(err, call) {
      console.log(err);
      //process.stdout.write(call.sid);
    });

  })

  wit.hears('weather',0.5,function(bot,message,outcome){
    console.log(outcome.entities.location)
    if(!outcome.entities.location || outcome.entities.location.length === 0){
      bot.reply(message,'I\'d love to give you the weather but for where?')
      return
    }
    var location = outcome.entities.location[0].value
    weather.get(location,function(err,msg){
      bot.reply(message,msg)
    })
  })
})


//https://example.com/foobar?code=7183458801.28087125941.15e50cdaa3&state=
//https://slack.com/api/oauth.access?client_id=7183458801.28039661221&client_secret=649897b6e46eb079cc7d728f92ddd876&code=7183458801.28103681413.6c8c82f112
