const chalk = require('chalk');
const prompts = require('prompts');

const data = require("./generator-data");

const {findLineNumber, removeBefore, removeAfter, removeAtLine, asyncForEach, getPrompts} = require("./common");

const help = async () => {
  const all = [{ title: 'All', description: `remove all the '[${Object.keys(data)}]' social configuration`, value: 'all' }]
   const response = await prompts({
      type: 'select',
      name: 'value',
      message: 'Choose the Social configuration to remove (or all)',
      choices:  all.concat(Object.keys(data).map((dataI)=>(
        { title: dataI, description: `remove the '${dataI}' social configuration`, value: dataI }
       )).reduce((acc, data) => [...acc, data],[])),
      initial: 0
});
   return response.value;
}

 // const pathToAppDelegate = options.ios.appDelegate;
 //  const lineNumberPattern = await findLineNumber(pathToAppDelegate, [
 //    "- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions",
 //    "  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];",
 //  ]);
//   console.log(lineNumberPattern)
//   if(lineNumberPattern !== null) await addBefore(pathToAppDelegate, lineNumberPattern, `  [[FBSDKApplicationDelegate sharedInstance] application:application
//                            didFinishLaunchingWithOptions:launchOptions];
// `)
const removeThat = async (that, options) => {
  await asyncForEach(that.slice().reverse(), async (v, i) => {
    const {
      filename,
      pattern,
      antipattern,
      text,
      prepro = options.prepro,
      placement = 'before',
      type = 'text',
      antiway = 'top',
      way = 'top',
      ask = {},
      error = {},
      stopIfAntiError = false,
      stopIfCheckError = false,
      description,
      remove_description,
      description_color = "gray"
    } = v
    if(filename === undefined){
       console.log(chalk.gray(`${i + 1}/${that.length} ${chalk[description_color](remove_description ? remove_description : "")}`))
       return;
    }
    console.log(chalk.gray(`${i + 1}/${that.length} ${chalk[description_color](remove_description ? remove_description : "")}`))
    // if(filename === undefined){
    //   return;
    // }
    const compiledFilename = Object.entries(options.pathOptions).reduce(
      (stt, [k, v]) => {
        return stt.replace(`{{${k}}}`, v)
      },
      filename,
    )
    // const lineNumberAntiPattern = antipattern
    //   ? await findLineNumber(compiledFilename, antipattern, antiway)
    //   : null
    // const lineNumberPattern = await findLineNumber(
    //   compiledFilename,
    //   pattern,
    //   way,
    // )
    // if(lineNumberAntiPattern !== null && error?.AntiPatternMessage){
    //   console.error(chalk.red(`ERROR: auth-service remove : ${error.AntiPatternMessage}`));
    //   if (stopIfAntiError)return false;
    // }
    // if (lineNumberAntiPattern === null && lineNumberPattern !== null) {
      const variables = await getPrompts(ask)

      if(variables === null){
        console.error(chalk.red('ERROR: auth-service remove : stopped'))
        return false;
      }
      let textFinal = text
      Object.entries(variables).forEach(([k, v]) => {
        textFinal = textFinal.replace(`{{${k}}}`, v)
      })
      const fn = removeAtLine
        // placement == 'before'
        //   ? removeBefore
        //   : placement == 'after'
        //   ? removeAfter
        //   : removeAtLine
      const response = await fn(
        compiledFilename,
        1,
        prepro?.(textFinal) || textFinal,
        { mode: "remove" },
      )
      if(response === "checkError" && error?.checkErrorMessage){
        console.error(chalk.gray(`WARN: auth-service remove (check-error): ${error.checkErrorMessage}`));
        if (stopIfCheckError)return false;
      }
    // }
  })
}
const remove = async (args, options) => {  
  console.log(chalk.blueBright("REMOVE"))
  // console.log(chalk.gray(`\tSocial :  [All, ${Object.keys(data)}]`))
  let choice = await help();
  // console.log(choice);
  if (choice == 'all'){
    choice = Object.keys(data)
  }else{
    choice = [choice]
  }
    await asyncForEach(choice,async (k)=>{
        console.log(chalk.bold(`removing '${k}'...`))
        await removeThat(data[k], options)
    });

};

module.exports.default = remove
