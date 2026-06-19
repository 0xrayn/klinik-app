import { useEffect, useRef, useState } from 'react';

/**
 * Adds the `is-visible` class once the element scrolls into view.
 * Pairs with the `.reveal` utility class defined in app.css.
 */
export default function useReveal(threshold = 0.15) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setVisible(true);
                observer.disconnect();
            }
        }, { threshold });

        observer.observe(el);
        return () => observer.disconnect();
    }, [threshold]);

    return [ref, visible];
}
