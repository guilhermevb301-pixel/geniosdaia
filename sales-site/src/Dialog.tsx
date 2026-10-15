import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from 'react';
import * as Primitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

export const Dialog = Primitive.Root;
export const DialogTitle = Primitive.Title;
export const DialogDescription = Primitive.Description;
export const DialogContent = forwardRef<ElementRef<typeof Primitive.Content>, ComponentPropsWithoutRef<typeof Primitive.Content>>(({ children, ...props }, ref) => <Primitive.Portal><Primitive.Overlay className="vf-dialog-overlay"/><Primitive.Content ref={ref} {...props}>{children}<Primitive.Close className="vf-dialog-close" aria-label="Fechar"><X size={17}/></Primitive.Close></Primitive.Content></Primitive.Portal>);
DialogContent.displayName = 'DialogContent';
