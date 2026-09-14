#import <Foundation/Foundation.h>
#import <PDFKit/PDFKit.h>
#import <AppKit/AppKit.h>

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        if (argc < 3) {
            fprintf(stderr, "Usage: pdf2png <input.pdf> <output.png>\n");
            return 1;
        }
        NSString *inPdf = [NSString stringWithUTF8String:argv[1]];
        NSString *outPng = [NSString stringWithUTF8String:argv[2]];
        
        NSURL *url = [NSURL fileURLWithPath:inPdf];
        PDFDocument *doc = [[PDFDocument alloc] initWithURL:url];
        if (!doc || [doc pageCount] == 0) {
            fprintf(stderr, "Error: Unable to load PDF at %s\n", argv[1]);
            return 2;
        }
        PDFPage *page = [doc pageAtIndex:0];
        
        NSRect bounds = [page boundsForBox:kPDFDisplayBoxMediaBox];
        // 2.5x scale yields ~1488 x 2105 px: razor-sharp vector rendering at ~580KB PNG
        CGFloat scale = 2.5;
        size_t width = (size_t)(bounds.size.width * scale);
        size_t height = (size_t)(bounds.size.height * scale);
        
        CGColorSpaceRef colorSpace = CGColorSpaceCreateWithName(kCGColorSpaceSRGB);
        CGContextRef ctx = CGBitmapContextCreate(NULL, width, height, 8, 0, colorSpace, (CGBitmapInfo)kCGImageAlphaPremultipliedLast);
        CGColorSpaceRelease(colorSpace);
        
        if (!ctx) {
            fprintf(stderr, "Error: Failed to create bitmap context\n");
            return 3;
        }
        
        // Solid white backdrop
        CGContextSetRGBFillColor(ctx, 1.0, 1.0, 1.0, 1.0);
        CGContextFillRect(ctx, CGRectMake(0, 0, width, height));
        
        // Scale coordinate system for subpixel vector font rendering
        CGContextScaleCTM(ctx, scale, scale);
        CGContextSetInterpolationQuality(ctx, kCGInterpolationHigh);
        CGContextSetRenderingIntent(ctx, kCGRenderingIntentDefault);
        
        [page drawWithBox:kPDFDisplayBoxMediaBox toContext:ctx];
        
        CGImageRef imageRef = CGBitmapContextCreateImage(ctx);
        CGContextRelease(ctx);
        
        NSBitmapImageRep *rep = [[NSBitmapImageRep alloc] initWithCGImage:imageRef];
        CGImageRelease(imageRef);
        
        NSData *pngData = [rep representationUsingType:NSBitmapImageFileTypePNG properties:@{}];
        [pngData writeToFile:outPng atomically:YES];
        
        printf("[pdf2png] Successfully rendered razor-sharp preview: %zux%zu (%lu bytes)\n", width, height, (unsigned long)[pngData length]);
    }
    return 0;
}
