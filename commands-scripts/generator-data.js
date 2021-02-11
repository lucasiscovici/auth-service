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
                ],
                text: `    [[FBSDKApplicationDelegate sharedInstance] application:application
                                                 openURL:url
                                                 options:options]`;
                placement: "after"

            },
    ]
}
