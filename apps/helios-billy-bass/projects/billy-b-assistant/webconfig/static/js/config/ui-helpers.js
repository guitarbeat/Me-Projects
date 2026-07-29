// ===================== UI HELPERS =====================

function showNotification(message, type = "info", duration = 2500) {
    const bar = document.getElementById("notification");
    bar.textContent = message;
    bar.classList.remove("hidden", "opacity-0", "bg-cyan-500/80", "bg-emerald-500/80", "bg-amber-500/80", "bg-rose-500/80");
    const typeClass = {
        info: "bg-cyan-500/80",
        success: "bg-emerald-500/80",
        warning: "bg-amber-500/80",
        error: "bg-rose-500/80",
    }[type] || "bg-cyan-500/80";
    bar.classList.add(typeClass, "opacity-100");
    setTimeout(() => {
        bar.classList.remove("opacity-100");
        bar.classList.add("opacity-0");
        setTimeout(() => bar.classList.add("hidden"), 300);
    }, duration);
}

// Toggle password input visibility
function toggleInputVisibility(inputId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(`${inputId}_icon`);
    const isHidden = input.type === "password";
    input.type = isHidden ? "text" : "password";
    icon.textContent = isHidden ? "visibility_off" : "visibility";
}

function toggleDropdown(btn) {
    // Close all other dropdowns first
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        // Only close menus not related to this button
        if (!menu.classList.contains('hidden') && !menu.parentElement.contains(btn)) {
            menu.classList.add('hidden');
            const arrow = menu.parentElement.querySelector('.dropdown-toggle .material-icons');
            if (arrow) arrow.classList.remove('rotate-180');
            const toggleBtn = menu.parentElement.querySelector('.dropdown-toggle');
            if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
        }
    });

    // Find this button's dropdown menu (assumes menu is sibling or child)
    let dropdown = btn.closest('.relative').querySelector('.dropdown-menu');
    if (!dropdown) return;

    const isHidden = dropdown.classList.toggle('hidden');
    btn.setAttribute('aria-expanded', !isHidden);

    // Toggle arrow rotation
    const arrow = btn.querySelector('.material-icons');
    if (arrow) arrow.classList.toggle('rotate-180');
}

function toggleTooltip(el) {
    el.classList.toggle("text-cyan-400");
    const isExpanded = el.getAttribute("aria-expanded") === "true";
    el.setAttribute("aria-expanded", !isExpanded);

    let tooltip;
    const controlsId = el.getAttribute("aria-controls");
    if (controlsId) {
        tooltip = document.getElementById(controlsId);
    }

    // Fallback support for any legacy structures
    if (!tooltip) {
        const container = el.closest("label")?.parentElement || el.parentElement?.parentElement;
        if (container) {
            tooltip = container.querySelector("[data-tooltip]");
        }
    }

    if (tooltip) {
        const visible = tooltip.getAttribute("data-visible") === "true";
        tooltip.setAttribute("data-visible", visible ? "false" : "true");
    }
}


// Close on click outside
document.addEventListener('click', (e) => {
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        // If the click is outside the .relative container
        if (!menu.classList.contains('hidden') && !menu.closest('.relative').contains(e.target)) {
            menu.classList.add('hidden');
            const arrow = menu.parentElement.querySelector('.dropdown-toggle .material-icons');
            if (arrow) arrow.classList.remove('rotate-180');
            const toggleBtn = menu.parentElement.querySelector('.dropdown-toggle');
            if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
        }
    });
});

// Handle keyboard activation for file upload labels
document.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('file-upload-label')) {
        e.preventDefault();
        const input = e.target.querySelector('input[type="file"]');
        if (input) input.click();
    }
});

