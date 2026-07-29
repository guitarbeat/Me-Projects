// ===================== COLLAPSIBLE SECTIONS =====================

const Sections = (() => {
    function collapsible() {
        document.querySelectorAll('.collapsible-section').forEach(section => {
            // Attempt to find the new accessible button
            let toggleEl = section.querySelector('button[aria-controls]');
            let isLegacy = false;

            // Fallback for legacy markup if button not found
            if (!toggleEl) {
                toggleEl = section.querySelector('h3');
                isLegacy = true;
            }

            if (!toggleEl) return;

            const header = section.querySelector('h3');
            const icon = toggleEl.querySelector('.material-icons') || (header ? header.querySelector('.material-icons') : null);

            // Restore state from localStorage
            const id = section.id;
            const isClosed = localStorage.getItem('collapse_' + id) === 'closed';

            // Initial State
            if (isClosed) {
                section.classList.add('collapsed');
                if (icon) {
                    icon.classList.remove('rotate-180');
                    icon.classList.add('rotate-0');
                }
                if (header) header.classList.remove('mb-4');
                if (!isLegacy) toggleEl.setAttribute('aria-expanded', 'false');
            } else {
                section.classList.remove('collapsed');
                if (icon) {
                    icon.classList.add('rotate-180');
                    icon.classList.remove('rotate-0');
                }
                if (header) header.classList.add('mb-4');
                if (!isLegacy) toggleEl.setAttribute('aria-expanded', 'true');
            }

            // Hide/Show content based on initial state
            if (isLegacy) {
                [...section.children].forEach(child => {
                    if (child !== header) child.classList.toggle('hidden', isClosed);
                });
            } else {
                const contentId = toggleEl.getAttribute('aria-controls');
                const content = document.getElementById(contentId);
                if (content) content.classList.toggle('hidden', isClosed);
            }

            // Click Handler
            toggleEl.addEventListener('click', (e) => {
                // For legacy, prevent text selection double clicks
                if (isLegacy) e.preventDefault();

                const wasClosed = section.classList.contains('collapsed');
                const nowClosed = !wasClosed;

                section.classList.toggle('collapsed', nowClosed);

                // Update content visibility
                if (isLegacy) {
                    [...section.children].forEach(child => {
                        if (child !== header) child.classList.toggle('hidden', nowClosed);
                    });
                } else {
                    const contentId = toggleEl.getAttribute('aria-controls');
                    const content = document.getElementById(contentId);
                    if (content) content.classList.toggle('hidden', nowClosed);
                    toggleEl.setAttribute('aria-expanded', !nowClosed);
                }

                // Rotate icon
                if (icon) {
                    icon.classList.toggle('rotate-180', !nowClosed);
                    icon.classList.toggle('rotate-0', nowClosed);
                }

                // Toggle header margin
                if (header) header.classList.toggle('mb-4', !nowClosed);

                localStorage.setItem('collapse_' + id, nowClosed ? 'closed' : 'open');
            });
        });
    }

    return {collapsible};
})();

