import { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

type TypographyVariant = "h1" | "h2" | "h3" | "h4" | "body" | "body-sm" | "caption";

type TypographyProps<T extends ElementType> = {
  as?: T;
  variant?: TypographyVariant;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

const variantClassMap: Record<TypographyVariant, string> = {
  h1: "text-4xl leading-tight font-extrabold tracking-tight",
  h2: "text-2xl leading-snug font-bold tracking-tight",
  h3: "text-xl leading-snug font-semibold",
  h4: "text-lg leading-snug font-semibold",
  body: "text-base leading-relaxed font-medium",
  "body-sm": "text-sm leading-relaxed font-medium",
  caption: "text-xs leading-normal font-medium",
};

const variantTagMap: Record<TypographyVariant, ElementType> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  body: "p",
  "body-sm": "p",
  caption: "span",
};

function joinClasses(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

export function Typography<T extends ElementType = "p">({
  as,
  variant = "body",
  className,
  children,
  ...rest
}: TypographyProps<T>) {
  const Component = (as ?? variantTagMap[variant]) as ElementType;

  return (
    <Component className={joinClasses(variantClassMap[variant], className)} {...rest}>
      {children}
    </Component>
  );
}
