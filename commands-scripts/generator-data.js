 module.exports ={
    fb : [
            {
                filename: "{{ios_appDelegate}}",
                pattern: ['#import <React/RCTRootView.h>'],
                text: `#import <FBSDKCoreKit/FBSDKCoreKit.h>`,
                placement: "after",
            },
            {
                filename: "{{ios_appDelegate}}",
                pattern: [
                    "- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions",
                    "  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];",
                ],
                text: `  [[FBSDKApplicationDelegate sharedInstance] application:application
                                       didFinishLaunchingWithOptions:launchOptions];`
            },
            {
                filename: "{{ios_appDelegate}}",
                antipattern: [
                    "- (BOOL)application:(UIApplication *)application", 
                    "openURL:(NSURL *)url",
                    "options:(nonnull NSDictionary<UIApplicationOpenURLOptionsKey, id> *)options",
                ],
                pattern: ["@end"],
                text: `- (BOOL)application:(UIApplication *)application
            openURL:(NSURL *)url
            options:(nonnull NSDictionary<UIApplicationOpenURLOptionsKey, id> *)options
{
  return YES;
}`,
            },
            {
                filename: "{{ios_appDelegate}}",
                pattern: [
                    "- (BOOL)application:(UIApplication *)application", 
                    "openURL:(NSURL *)url",
                    "options:(nonnull NSDictionary<UIApplicationOpenURLOptionsKey, id> *)options",
                    "return YES;"
                ],
                text: `    [[FBSDKApplicationDelegate sharedInstance] application:application
                                                 openURL:url
                                                 options:options]`,
                placement: "before"

            },
            {
                filename: "{{ios_info}}",
                antipattern: [
                    '<key>CFBundleURLTypes</key>'
                ],
                way: "bottom",
                pattern: ["</dict>"],
                ask:{appID:{message: "Please write your appCode from facebook", type:"text"}},
                text:`<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>fb{{appID}}</string>
    </array>
  </dict>
</array>`,
                placement: "before",
                prepro: (text) => `<!--  AUTO GENERATED by auth-service -->\n${text}\n<!-- END AUTO GENERATED -->`,

            }
    ]
}
