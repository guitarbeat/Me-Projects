// ===================== Header Secondary Actions =====================

const LogPanel = (() => {
    let autoScrollEnabled = false;
    let isLogHidden = true;
    let isEnvHidden = true;

    // Reboot Billy
    const rebootBilly = async () => {
        if (!confirm("Are you sure you want to reboot Billy? This will reboot the whole system.")) return;

        const btn = elements.rebootBillyBtn;
        const originalHTML = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = `<span class="material-icons animate-spin">restart_alt</span>`;
        btn.title = "Rebooting...";

        try {
            const res = await fetch('/reboot', {method: 'POST'});
            const data = await res.json();
            if (data.status === "ok") {
                showNotification("Billy is rebooting!", "success");
                setTimeout(() => {
                    location.reload();
                }, 15000);
            }
            else {
                showNotification(data.error || "Reboot failed", "error");
                btn.disabled = false;
                btn.innerHTML = originalHTML;
                btn.title = "Reboot Billy";
            }
        } catch (err) {
            console.error("Failed to reboot Billy:", err);
            showNotification("Failed to reboot Billy", "error");
            btn.disabled = false;
            btn.innerHTML = originalHTML;
            btn.title = "Reboot Billy";
        }
    };

    // Shutdown Billy
    const shutdownBilly = async () => {
        if (!confirm("Are you sure you want to shutdown Billy?\n\nThis will power off the Raspberry Pi but one or more of the motors may remain engaged.\n" +
            "To fully power down, make sure to also switch off or unplug the power supply after shutdown.")) return;

        const btn = elements.shutdownBillyBtn;
        const originalHTML = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = `<span class="material-icons animate-spin">power_settings_new</span>`;
        btn.title = "Shutting down...";

        try {
            const res = await fetch('/shutdown', {method: 'POST'});
            const data = await res.json();
            if (data.status === "ok") {
                showNotification("Billy is shutting down!", "success");
                setTimeout(() => {
                    location.reload();
                }, 3000);
            }
            else {
                showNotification(data.error || "Shutdown failed", "error");
                btn.disabled = false;
                btn.innerHTML = originalHTML;
                btn.title = "Shutdown Billy";
            }
        } catch (err) {
            console.error("Failed to shutdown Billy:", err);
            showNotification("Failed to shutdown Billy", "error");
            btn.disabled = false;
            btn.innerHTML = originalHTML;
            btn.title = "Shutdown Billy";
        }
    };

    // Fetch logs and update UI
    const fetchLogs = async () => {
        const res = await fetch("/logs");
        const data = await res.json();
        const logOutput = document.getElementById("log-output");
        const logContainer = document.getElementById("log-container");

        logOutput.textContent = data.logs || "No logs found.";

        if (autoScrollEnabled) {
            requestAnimationFrame(() => {
                logContainer.scrollTop = logContainer.scrollHeight;
            });
        }
    };

    // Toggle log panel visibility
    const toggleLogPanel = () => {
        isLogHidden = !isLogHidden;
        elements.logPanel.classList.toggle("hidden", isLogHidden);
        elements.toggleBtn.classList.toggle("bg-cyan-500", !isLogHidden);
        elements.toggleBtn.classList.toggle("bg-zinc-700", isLogHidden);
    };

    // Toggle .env editor visibility and fetch content if showing
    const toggleEnvPanel = () => {
        isEnvHidden = !isEnvHidden;
        elements.envPanel.classList.toggle("hidden", isEnvHidden);
        elements.toggleEnvBtn.classList.toggle("bg-amber-500", !isEnvHidden);
        elements.toggleEnvBtn.classList.toggle("bg-zinc-700", isEnvHidden);

        if (!isEnvHidden) {
            fetch('/get-env')
                .then(res => res.text())
                .then(text => elements.envTextarea.value = text.trim())
                .catch(() => showNotification("An error occurred while loading .env", "error"));
        }
    };

    const toggleMotion = () => {
        const btn = elements.toggleMotionBtn;
        const icon = btn.querySelector(".material-icons");

        btn.classList.toggle("bg-zinc-700");
        document.documentElement.classList.toggle("reduce-motion");

        const isReduced = document.documentElement.classList.contains("reduce-motion");
        localStorage.setItem("reduceMotion", isReduced ? "1" : "0");

        // Toggle icon
        if (icon) {
            icon.textContent = isReduced ? "blur_off" : "blur_on";
        }
    };

    // Fullscreen toggle
    const toggleFullscreenLog = () => {
        const icon = document.getElementById("fullscreen-icon");
        const isFullscreen = elements.logContainer.classList.toggle("log-fullscreen");
        icon.textContent = isFullscreen ? "fullscreen_exit" : "fullscreen";
    };

    // Toggle auto-scroll to bottom of log
    const toggleAutoScroll = () => {
        autoScrollEnabled = !autoScrollEnabled;
        elements.scrollBtn.classList.toggle("bg-cyan-500", autoScrollEnabled);
        elements.scrollBtn.classList.toggle("bg-zinc-800", !autoScrollEnabled);
        elements.scrollBtn.title = autoScrollEnabled ? "Auto-scroll ON" : "Auto-scroll OFF";

        if (autoScrollEnabled) {
            elements.logOutput.scrollTop = elements.logOutput.scrollHeight;
        }
    };

    // Save .env file and optionally restart service
    const saveEnv = async () => {
        if (!confirm("Are you sure you want to overwrite the .env file? This may affect how Billy runs.")) return;

        const btn = elements.saveEnvBtn;
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = "Saving...";

        try {
            const res = await fetch('/save-env', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({content: elements.envTextarea.value})
            });
            const data = await res.json();

            if (data.status === "ok") {
                fetch('/restart', {method: 'POST'})
                    .then(res => res.json())
                    .then(data => {
                        if (data.status === "ok") {
                            showNotification(".env saved. Restarting", "success");
                            setTimeout(() => location.reload(), 3000);
                        } else {
                            showNotification(data.error || "Restart failed", "error");
                            btn.disabled = false;
                            btn.textContent = originalText;
                        }
                    })
                    .catch(err => {
                        showNotification(err.message, "error");
                        btn.disabled = false;
                        btn.textContent = originalText;
                    });
            } else {
                showNotification(data.error || "Unknown error", "error");
                btn.disabled = false;
                btn.textContent = originalText;
            }
        } catch (err) {
            showNotification(err.message, "error");
            btn.disabled = false;
            btn.textContent = originalText;
        }
    };

    // Cache DOM references after DOMContentLoaded
    let elements = {};
    const bindUI = () => {
        elements = {
            logOutput: document.getElementById("log-output"),
            logContainer: document.getElementById("log-container"),
            toggleFullscreenBtn: document.getElementById("toggle-fullscreen-btn"),
            scrollBtn: document.getElementById("scroll-bottom-btn"),
            toggleBtn: document.getElementById("toggle-log-btn"),
            logPanel: document.getElementById("log-panel"),
            toggleEnvBtn: document.getElementById("toggle-env-btn"),
            envPanel: document.getElementById("env-panel"),
            envTextarea: document.getElementById("env-textarea"),
            saveEnvBtn: document.getElementById("save-env-btn"),
            toggleMotionBtn: document.getElementById("toggle-motion-btn"),
            rebootBillyBtn: document.getElementById("reboot-billy-btn"),
            shutdownBillyBtn: document.getElementById("shutdown-billy-btn"),
        };

        elements.toggleBtn.addEventListener("click", toggleLogPanel);
        elements.toggleFullscreenBtn.addEventListener("click", toggleFullscreenLog);
        elements.scrollBtn.addEventListener("click", toggleAutoScroll);
        elements.toggleEnvBtn.addEventListener("click", toggleEnvPanel);
        elements.toggleMotionBtn.addEventListener("click", toggleMotion);
        elements.saveEnvBtn.addEventListener("click", saveEnv);
        elements.rebootBillyBtn.addEventListener("click", rebootBilly);
        elements.shutdownBillyBtn.addEventListener("click", shutdownBilly);

        if (localStorage.getItem("reduceMotion") === "1") {
            document.documentElement.classList.add("reduce-motion");

            const btn = elements.toggleMotionBtn;
            const icon = btn.querySelector(".material-icons");
            btn.classList.remove("bg-zinc-700");

            if (icon) {
                icon.textContent = "blur_off";
            }
        }
    };

    return {fetchLogs, bindUI};
})();

