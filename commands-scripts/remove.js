const chalk = require('chalk');
const prompts = require('prompts');

const data = require("./generator-data");

const {findLineNumber, removeBefore, removeAfter, removeAtLine,asyncForEach} = require("./common");

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
  await asyncForEach(that, async (v,i)=> {
     console.log(chalk.gray(`${i+1}/${that.length}`));
     const {filename, pattern, text, placement = "before"} = v;
     const compiledFilename = Object.entries(options.pathOptions).reduce((stt,[k,v])=> {
       return stt.replace(`{{${k}}}`, v)
     },filename)
    const lineNumberPattern = await findLineNumber(compiledFilename, pattern);
    console.log("lineNumberPattern", lineNumberPattern)
    if(lineNumberPattern !== null) {
      const fn = placement == "before" ? removeBefore : (placement == "after" ? removeAfter : removeAtLine) 

      await fn(compiledFilename, lineNumberPattern, options.prepro?.(text) || text, {inverse: placement == "before"})
    }
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
