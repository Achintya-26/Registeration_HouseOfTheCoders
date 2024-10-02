import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const DialogContext = createContext();

export function Dialog({ children }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <DialogContext.Provider value={{ isOpen, setIsOpen }}>
            {children}
        </DialogContext.Provider>
    );
}

export function DialogTrigger({ children }) {
    const { setIsOpen } = useContext(DialogContext);

    return React.cloneElement(children, {
        onClick: () => setIsOpen(true)
    });
}

export function DialogContent({ children }) {
    const { isOpen, setIsOpen } = useContext(DialogContext);
    const dialogRef = useRef(null);

    // Handle clicks outside the dialog content
    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (dialogRef.current && !dialogRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleOutsideClick);
        }

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [isOpen, setIsOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0  bg-opacity-60 flex items-center justify-center p-4">
            <div ref={dialogRef} className="bg-darkBrown-500 rounded-lg shadow-xl max-w-md w-full relative">
                <div className="p-6">
                    {children}
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                    ×
                </button>
            </div>
        </div>
    );
}

export function DialogHeader({ children }) {
    return <div className="mb-4">{children}</div>;
}

export function DialogTitle({ children }) {
    return <h2 className="text-xl font-bold">{children}</h2>;
}

// Example usage
export default function App() {
    return (
        <div className="p-4">
            <Dialog>
                <DialogTrigger>
                    <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                        Open Dialog
                    </button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Example Dialog</DialogTitle>
                    </DialogHeader>
                    <p>This is the content of the dialog.</p>
                </DialogContent>
            </Dialog>
        </div>
    );
}
