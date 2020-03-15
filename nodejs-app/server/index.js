const express = require('express');
const bodyParser = require('body-parser');
var path = require('path');

const app = express();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');


app.use(bodyParser.urlencoded({extended: false}));

//Set view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//Handle production
if(process.env.NODE_ENV === 'production' ){
  app.use(express.static(__dirname+'/public/'));
  //Handle SPA
  app.get(/.*/,(req,res) => {
    res.sendFile(__dirname+'/public/index.html');
  });
}
//Set static public data
app.use(express.static(path.join(__dirname, 'public')));


app.use('/',require('./routes/app'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


// Default response for any other request
app.use(function(req, res){
  res.status(404).render('404');
});

const port = 2000;

app.listen(port,function(){
  console.log(`server started at port ${port}`);
});
