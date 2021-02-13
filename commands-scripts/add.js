const chalk = require('chalk')
const prompts = require('prompts')

const data = require('./generator-data')

const {
  findLineNumber,
  addBefore,
  addAfter,
  addAtLine,
  asyncForEach,
  getPrompts,
} = require('./common')

const help = async () => {
  const all = [
    {
      title: 'All',
      description: `add the '[${Object.keys(data)}]' social configuration`,
      value: 'all',
    },
  ]
  const response = await prompts({
    type: 'select',
    name: 'value',
    message: 'Choose the Social configuration to add (or all)',
    choices: all.concat(
      Object.keys(data)
        .map((dataI) => ({
          title: dataI,
          description: `add the '${dataI}' social configuration`,
          value: dataI,
        }))
        .reduce((acc, data) => [...acc, data], []),
    ),
    initial: 0,
  })
  return response.value
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
  await asyncForEach(that, async (v, i) => {
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
      description
    } = v
    console.log(chalk.gray(`${i + 1}/${that.length} ${description ? description : ""}`))
    const compiledFilename = Object.entries(options.pathOptions).reduce(
      (stt, [k, v]) => {
        return stt.replace(`{{${k}}}`, v)
      },
      filename,
    )
    const lineNumberAntiPattern = antipattern
      ? await findLineNumber(compiledFilename, antipattern, antiway)
      : null
    const lineNumberPattern = await findLineNumber(
      compiledFilename,
      pattern,
      way,
    )
    if(lineNumberAntiPattern !== null && error?.AntiPatternMessage){
      console.error(chalk.red(`ERROR: auth-service add : ${error.AntiPatternMessage}`));
      if (stopIfAntiError)return false;
    }
    if (lineNumberAntiPattern === null && lineNumberPattern !== null) {
      const variables = await getPrompts(ask)

      if(variables === null){
        console.error(chalk.red('ERROR: auth-service add : stopped'))
        return false;
      }
      let textFinal = text
      Object.entries(variables).forEach(([k, v]) => {
        textFinal = textFinal.replace(`{{${k}}}`, v)
      })
      const fn =
        placement == 'before'
          ? addBefore
          : placement == 'after'
          ? addAfter
          : addAtLine
      const response = await fn(
        compiledFilename,
        lineNumberPattern,
        prepro?.(textFinal) || textFinal,
        { inverse: placement == 'before', type },
      )
      if(response === "checkError" && error?.checkErrorMessage){
        console.error(chalk.gray(`WARN: auth-service add (check-error): ${error.checkErrorMessage}`));
        if (stopIfCheckError)return false;
      }
    }
  })
}

const add = async (args, options) => {
  console.log(chalk.blueBright('ADD'))
  // console.log(chalk.gray(`\tSocial :  [All, ${Object.keys(data)}]`))
  let choice = await help()
  console.log(choice)
  if (!choice) {
    return
  }
  // console.log(choice);
  if (choice == 'all') {
    choice = Object.keys(data)
  } else {
    choice = [choice]
  }
  await asyncForEach(choice, async (k) => {
    console.log(chalk.bold(`adding '${k}'...`))
    await addThat(data[k], options)
  })
}

module.exports.default = add
