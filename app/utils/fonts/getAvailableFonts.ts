/* @turbomodule IRFonts.getAvailableFonts(): string[]
#import <Foundation/Foundation.h>

- (NSArray *)getAvailableFonts {
  return [[NSFontManager sharedFontManager] availableFontFamilies];
}
*/
import IRFonts from "./NativeIRFonts"

export function getAvailableFonts(): string[] {
  return IRFonts.getAvailableFonts()
}
