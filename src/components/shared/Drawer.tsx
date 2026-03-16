import { type ReactNode, useState } from "react";
import { Drawer as VaulDrawer } from "vaul";
import { Button } from "./Button";
import { XIcon } from "lucide-react";

export function useDrawer() {
    const [open, setOpen] = useState(false);
    return {
        open: () => setOpen(true),
        close: () => setOpen(false),
        props: {
            open,
            onClose: () => setOpen(false),
        },
    };
}

export interface DrawerProps {
    title: string;
    open: boolean;
    onClose: () => void;
    children: ReactNode;
    dismissible?: boolean;
}

export function Drawer({
    title,
    open,
    onClose,
    children,
    dismissible = true,
}: DrawerProps) {
    return (
        <VaulDrawer.Root
            open={open}
            onClose={onClose}
            dismissible={dismissible}
            repositionInputs={false}
        >
            <VaulDrawer.Portal>
                <VaulDrawer.Overlay className="bg-foreground/70 fixed inset-0" />

                <VaulDrawer.Content className="bg-background border-foreground fixed right-0 bottom-0 left-0 flex h-auto max-h-[96%] flex-col border-t-3 p-4">
                    <div className="mb-4 shrink-0">
                        <div className="flex items-center justify-between">
                            <VaulDrawer.Title className="text-xl font-medium">
                                {title}
                            </VaulDrawer.Title>

                            {dismissible && (
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={onClose}
                                >
                                    <XIcon className="size-4" />
                                </Button>
                            )}
                        </div>

                        <div className="mt-6 flex flex-col gap-y-4">
                            {children}
                        </div>
                    </div>
                </VaulDrawer.Content>
            </VaulDrawer.Portal>
        </VaulDrawer.Root>
    );
}
