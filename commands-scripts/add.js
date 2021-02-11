const chalk = require('chalk');
const prompts = require('prompts');

const data = require("./generator-data");

const {findLineNumber, addBefore, addAfter, addAtLine,asyncForEach} = require("./common");

const help = async () => {
  const all = [{ title: 'All', description: `add the '[${Object.keys(data)}]' social configuration`, value: 'all' }]
   const response = await prompts({
      type: 'select',
      name: 'value',
      message: 'Choose the Social configuration to add (or all)',
      choices:  all.concat(Object.keys(data).map((dataI)=>(
        { title: dataI, description: `add the '${dataI}' social configuration`, value: dataI }
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
const addThat = async (that, options) => {
  await asyncForEach(that, async (v,i)=> {
     console.log(chalk.gray(`${i+1}/${that.length}`));
     const {filename, pattern, antipattern, text, placement = "before"} = v;
     const compiledFilename = Object.entries(options.pathOptions).reduce((stt,[k,v])=> {
       return stt.replace(`{{${k}}}`, v)
     },filename)
     const lineNumberAntiPattern = antipattern ? await findLineNumber(compiledFilename, antipattern) : null;
    const lineNumberPattern = await findLineNumber(compiledFilename, pattern);
    console.log("lineNumberPattern", lineNumberPattern)
    if(lineNumberAntiPattern === null && lineNumberPattern !== null) {
      const fn = placement == "before" ? addBefore : (placement == "after" ? addAfter : addAtLine) 

      await fn(compiledFilename, lineNumberPattern, options.prepro?.(text) || text, {inverse: placement == "before"})
    }
  })
}
const add = async (args, options) => {  
  console.log(chalk.blueBright("ADD"))
  // console.log(chalk.gray(`\tSocial :  [All, ${Object.keys(data)}]`))
  let choice = await help();
  console.log(choice);
  if(!choice) return;
  // console.log(choice);
  if (choice == 'all'){
    choice = Object.keys(data)
  }else{
    choice = [choice]
  }
    await asyncForEach(choice,async (k)=>{
        console.log(chalk.bold(`adding '${k}'...`))
        await addThat(data[k], options)
    });

};

module.exports.default = add
