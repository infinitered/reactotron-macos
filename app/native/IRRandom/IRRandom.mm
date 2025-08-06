#import "IRRandom.h"
#include <Foundation/Foundation.h>

@implementation IRRandom RCT_EXPORT_MODULE()

// Add your methods here ************************************************************

- (NSNumber *)getRandomNumber {
  return @(arc4random_uniform(100));
}

- (NSString *)getUUID {
  return [[NSUUID UUID] UUIDString];
}

// Helper method to process array-based method calls
- (id)processMethodCall:(NSArray *)methodCall {
  if (![methodCall isKindOfClass:[NSArray class]] || methodCall.count != 3) {
    NSLog(@"Invalid method call format. Expected array with 3 elements: [className, methodName, arguments]");
    return nil;
  }
  
  NSString *className = methodCall[0];
  NSString *methodName = methodCall[1];
  NSArray *args = methodCall[2];
  
  if (![className isKindOfClass:[NSString class]] || 
      ![methodName isKindOfClass:[NSString class]] || 
      ![args isKindOfClass:[NSArray class]]) {
    NSLog(@"Invalid method call format. Expected [NSString, NSString, NSArray]");
    return nil;
  }
  
  Class targetClass = NSClassFromString(className);
  if (!targetClass) {
    NSLog(@"Class '%@' not found", className);
    return nil;
  }
  
  SEL selector = NSSelectorFromString(methodName);
  if (![targetClass respondsToSelector:selector]) {
    NSLog(@"Method '%@' not found on class '%@'", methodName, className);
    return nil;
  }
  
  NSMethodSignature *signature = [targetClass methodSignatureForSelector:selector];
  if (!signature) {
    NSLog(@"Unable to get method signature for '%@'", methodName);
    return nil;
  }
  
  NSInvocation *invocation = [NSInvocation invocationWithMethodSignature:signature];
  [invocation setSelector:selector];
  [invocation setTarget:targetClass];
  
  // Process arguments - use args count instead of method signature count
  for (NSUInteger i = 0; i < args.count; i++) {
    id arg = args[i];
    if ([arg isKindOfClass:[NSArray class]]) {
      // Recursively resolve nested method calls
      NSError *error = nil;
      NSData *jsonData = [NSJSONSerialization dataWithJSONObject:arg options:0 error:&error];
      if (!error) {
        NSString *jsonString = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
        NSString *result = [self invokeObjC:jsonString];
        arg = result;
      } else {
        NSLog(@"Error serializing nested call: %@", error);
        return nil;
      }
    }
    [invocation setArgument:&arg atIndex:i + 2]; // +2 because 0=self, 1=_cmd
  }
  
  [invocation invoke];
  
  // Get return value
  const char *returnType = [signature methodReturnType];
  if (strcmp(returnType, @encode(void)) != 0) {
    __unsafe_unretained id returnValue;
    [invocation getReturnValue:&returnValue];
    return returnValue;
  }
  
  return nil;
}

// Test here!
- (NSString *)invokeObjC:(NSString *)inputString {
  // Parse the input string into an array
  NSData *jsonData = [inputString dataUsingEncoding:NSUTF8StringEncoding];
  NSError *error = nil;
  NSArray *input = [NSJSONSerialization JSONObjectWithData:jsonData options:0 error:&error];
  if (error) {
    NSLog(@"Error parsing input: %@", error);
    return nil;
  }
  
  if (![input isKindOfClass:[NSArray class]] || input.count != 3) {
    NSLog(@"Invalid input format. Expected array with 3 elements: [instanceCreation, methodName, arguments]");
    NSLog(@"Input: %@", input);
    return nil;
  }
  
  // Get the instance from the first element
  id target = nil;
  id firstElement = input[0];
  
  if ([firstElement isKindOfClass:[NSArray class]]) {
    // Create instance using nested method call
    target = [self processMethodCall:firstElement];
    if (!target) {
      return nil;
    }
  } else if ([firstElement isKindOfClass:[NSString class]]) {
    // First element is a class name, treat this as a class method call
    NSString *className = (NSString *)firstElement;
    Class targetClass = NSClassFromString(className);
    if (!targetClass) {
      NSLog(@"Class '%@' not found", className);
      return nil;
    }
    target = targetClass;
  } else {
    NSLog(@"First element must be either a class name (NSString) or an array representing instance creation");
    return nil;
  }
  
  // Process the method call on the instance
  NSString *methodName = input[1];
  NSArray *args = input[2];
  
  if (![methodName isKindOfClass:[NSString class]] || ![args isKindOfClass:[NSArray class]]) {
    NSLog(@"Invalid format for method call. Expected [NSString, NSArray]");
    return nil;
  }
  
  SEL selector = NSSelectorFromString(methodName);
  if (![target respondsToSelector:selector]) {
    NSLog(@"Method '%@' not found on target '%@'", methodName, target);
    return nil;
  }
  
  NSMethodSignature *signature = [target methodSignatureForSelector:selector];
  if (!signature) {
    NSLog(@"Unable to get method signature for '%@'", methodName);
    return nil;
  }
  
  NSInvocation *invocation = [NSInvocation invocationWithMethodSignature:signature];
  [invocation setSelector:selector];
  [invocation setTarget:target];
  
  // Set arguments - use args count instead of method signature count
  for (NSUInteger i = 0; i < args.count; i++) {
    id arg = args[i];
    if ([arg isKindOfClass:[NSArray class]]) {
      // Recursively resolve nested calls
      NSError *error = nil;
      NSData *jsonData = [NSJSONSerialization dataWithJSONObject:arg options:0 error:&error];
      if (!error) {
        NSString *jsonString = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
        NSString *result = [self invokeObjC:jsonString];
        arg = result;
      } else {
        NSLog(@"Error serializing nested call: %@", error);
        return nil;
      }
    }
    [invocation setArgument:&arg atIndex:i + 2]; // +2 because 0=self, 1=_cmd
  }
  
  // Log what we're about to invoke
  NSLog(@"Invoking: %@", input);
  
  [invocation invoke];
  
  // Get the return value
  const char *returnType = [signature methodReturnType];
  if (strcmp(returnType, @encode(void)) != 0) {
    __unsafe_unretained id returnValue;
    [invocation getReturnValue:&returnValue];
    return [returnValue description];
  }
  
  return nil;
}

// End of your methods ************************************************************

// Required by TurboModules.
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeIRRandomSpecJSI>(params);
}

@end
