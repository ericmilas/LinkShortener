import { Meteor } from 'meteor/meteor';
import {Links} from "../imports/collections/links";
import {WebApp} from 'meteor/webapp';
import ConnectRoute from 'connect-route';

Meteor.startup(() => {
  Meteor.publish('links', function () {
    return Links.find({});
  });
});

//Executed when a user visits with a route like 'localhost:3000/abcd
function onRoute(req, res, next){
  //Take the token out of the url and try to find a matching link in the Links collection
  const link = Links.findOne({token: req.params.token});

  //If we find a link object, redirect the user to the long URL
  if(link){
    Links.update(link, {$inc: {clicks: 1}}); //$inc means increment, this is Meteor Mongo Modifier
    res.writeHead(307, {'Location': link.url}); //307 is a redirect
    res.end();
  }else{
    //If we don't find a link object. send the user to our normal React app
    next();
  }
}

//localhost:3000/ - NO MATCH
//localhost:3000/books/harry_potter - NO MATCH
//localhost:3000/asbd - MATCH!!!
const middleware = ConnectRoute(function(router){
  router.get('/:token', onRoute);
});

//Intercept incoming calls to see if it is a shortened URL that needs to be redirected
WebApp.connectHandlers.use(middleware);
