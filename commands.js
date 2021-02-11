var RegexParser = require("regex-parser");
const lineReader = require("line-reader");

const findLineNumber = (file, pattern = []) => {
  let patternCurr = 0;
  let lineNumberPattern = null;
  let lineNumber = 0;
  if (pattern.length === 0) return null;
  lineReader.eachLine(file, function (line) {
    console.log(line, pattern[patternCurr]);
    if (pattern[patternCurr] == line || RegexParser(pattern[patternCurr]).test(line)) {
      lineNumberPattern = lineNumber;
      if (pattern.length > patternCurr + 1) {
        return lineNumberPattern;
      }
      patternCurr = patternCurr + 1;
    }
    lineNumber = lineNumber + 1;
  });
  return null;
};

const addFb = (args, ctx) => {
  const rootPath = ctx.project.ios.sourceDir;
  const projName = ctx.project.ios.projectName.split(".")[0];
  const pathToAppDelegate = `${rootPath}/${projName}/AppDelegate.m`;
  console.log("Hello World Add Fb!");
  console.log(pathToAppDelegate);
  const lineNumberPattern = findLineNumber(pathToAppDelegate, [
    "- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions",
    "  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];",
  ]);
  console.log(lineNumberPattern)
};

const rnPluginConfig = [
  {
    name: "auth-services-add-fb",
    func: addFb,
  },
];
module.exports = { rnPluginConfig };