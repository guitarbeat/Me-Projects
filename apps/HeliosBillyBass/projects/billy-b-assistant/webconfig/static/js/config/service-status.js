// ===================== SERVICE STATUS =====================

const ServiceStatus = (() => {
    const fetchStatus = async () => {
        const res = await fetch("/service/status");
        const data = await res.json();
        updateServiceStatusUI(data.status);
    };

    const updateServiceStatusUI = (status) => {
        const statusEl = document.getElementById("service-status");
        const controlsEl = document.getElementById("service-controls");
        statusEl.textContent = `(${status})`;
        statusEl.classList.remove("text-emerald-500", "text-amber-500", "text-rose-500");

        if (status === "active") {
            statusEl.classList.add("text-emerald-500");
        } else if (status === "inactive") {
            statusEl.classList.add("text-amber-500");
        } else if (status === "failed") {
            statusEl.classList.add("text-rose-500");
        }

        controlsEl.innerHTML = "";
        const createButton = (label, action, color, iconName) => {
            const btn = document.createElement("button");
            btn.setAttribute("aria-label", label);
            btn.className = `flex items-center gap-1 bg-${color}-500 hover:bg-${color}-400 text-zinc-800 font-semibold py-1 px-2 rounded`;
            btn.setAttribute("aria-label", label);

            const icon = document.createElement("i");
            icon.className = "material-icons";
            icon.setAttribute("aria-hidden", "true");
            icon.textContent = iconName;
            btn.appendChild(icon);

            const labelSpan = document.createElement("span");
            labelSpan.className = "hidden md:inline";
            labelSpan.textContent = label;
            btn.appendChild(labelSpan);

            btn.onclick = () => handleServiceAction(action);
            return btn;
        };
        if (status === "inactive" || status === "failed") {
            controlsEl.appendChild(createButton("Start", "start", "emerald", "play_arrow"));
        } else if (status === "active") {
            controlsEl.appendChild(createButton("Restart", "restart", "amber", "restart_alt"));
            controlsEl.appendChild(createButton("Stop", "stop", "rose", "stop"));
        } else {
            controlsEl.textContent = "Unknown status.";
        }
    };

    const handleServiceAction = async (action) => {
        const statusEl = document.getElementById("service-status");
        const statusMap = {
            restart: {text: "restarting", color: "text-amber-500"},
            stop: {text: "stopping", color: "text-rose-500"},
            start: {text: "starting", color: "text-emerald-500"}
        };

        if (statusMap[action]) {
            const {text, color} = statusMap[action];
            statusEl.textContent = text;
            statusEl.classList.remove("text-emerald-500", "text-amber-500", "text-rose-500");
            statusEl.classList.add(color);
        }
        try {
            await fetch(`/service/${action}`);
        } catch (err) {
            console.error(`Failed to ${action} service:`, err);
        }
        fetchStatus();
        LogPanel.fetchLogs();
    };

    return {fetchStatus, updateServiceStatusUI};
})();

