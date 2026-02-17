import { useState, useEffect } from "react";

/**
 * A hook to prevent iOS auto-zoom and focus issues on load.
 *
 * This hook initializes a readonly state to true and switches it to false after a delay.
 * This prevents iOS from automatically zooming in or focusing on an input field when the component mounts,
 * which can happen with certain input configurations.
 *
 * @param delay The delay in milliseconds before allowing input interaction. Default is 500ms.
 * @returns A boolean indicating whether the input should be read-only.
 */
export function useIOSInputZoomFix(delay = 500) {
    const [isReadOnly, setIsReadOnly] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsReadOnly(false), delay);
        return () => clearTimeout(timer);
    }, [delay]);

    return isReadOnly;
}
