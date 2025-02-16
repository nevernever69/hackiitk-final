import * as React from "react";
import {cn} from "@/lib/utils"; // Adjust this import based on your project structure

const Card = React.forwardRef(({className, ...props}, ref) => (
    <div
        ref={ref}
        className={cn("rounded-xl p-5 justify-center text-card-foreground", className)}
        {...props}
    />
));
Card.displayName = "Card";

const CardImage = React.forwardRef(({className, src, alt, ...props}, ref) => (
    <div ref={ref} className={cn("flex flex-col items-center space-y-1", className)} {...props}>
        <img
            style={{width: '200px', height: '200px'}}
            className="rounded-full object-cover"
            src={src}
            alt={alt}
        />
    </div>
));
CardImage.displayName = "CardImage";

const CardHeader = React.forwardRef(({className, ...props}, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1", className)} {...props} />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef(({className, ...props}, ref) => (
    <h3
        ref={ref}
        className={cn("font-semibold text-center pt-3 text-lg leading-none text-clip text-foreground tracking-tight", className)}
        {...props}
    />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef(({className, ...props}, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-center text-muted-foreground", className)}
        {...props}
    />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef(({className, ...props}, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef(({className, ...props}, ref) => (
    <div ref={ref} className={cn("flex justify-center items-center pt-0", className)} {...props} />
));
CardFooter.displayName = "CardFooter";

export {Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, CardImage};
