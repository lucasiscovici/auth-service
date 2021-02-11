const addFb = ()  => {
    console.log("Hello World Add Fb!");
    const lineReader = require('line-reader');
    console.log(arguments, __dirname)
    // lineReader.eachLine('/path/to/file', function(line) {
    //     console.log(line);
    // });

}

const rnPluginConfig = [
    {
      name: 'auth-services-add-fb',
      func:  addFb
    },
  ]
module.exports = {rnPluginConfig};