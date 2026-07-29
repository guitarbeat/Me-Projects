// ===================== SETTINGS FORM =====================

const SettingsForm = (() => {
    const handleSettingsSave = () => {
        document.getElementById("config-form").addEventListener("submit", async function (e) {
            e.preventDefault();

            const btn = document.getElementById("save-btn");
            const originalHTML = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = `<span class="material-icons animate-spin">sync</span> Saving...`;

            try {
                const resStatus = await fetch("/service/status");
                const {status: wasActive} = await resStatus.json();

                const formData = new FormData(this);
                const payload = Object.fromEntries(formData.entries());

                const flaskPortInput = document.getElementById("FLASK_PORT");
                const oldPort = parseInt(flaskPortInput.getAttribute("data-original")) || 80;
                const newPort = parseInt(payload["FLASK_PORT"] || "80");

                const hostnameInput = document.getElementById("hostname");
                const oldHostname = (hostnameInput.getAttribute("data-original") || hostnameInput.defaultValue || "").trim();
                const newHostname = (formData.get("hostname") || "").trim();

                let hostnameChanged = false;

                // Save config (.env)
                const saveResponse = await fetch("/save", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify(payload),
                });
                const saveResult = await saveResponse.json();
                let portChanged = saveResult.port_changed || (oldPort !== newPort);

                // Only update hostname if it actually changed
                if (newHostname && newHostname !== oldHostname) {
                    const hostResponse = await fetch("/hostname", {
                        method: "POST",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify({hostname: newHostname})
                    });
                    const hostResult = await hostResponse.json();
                    if (hostResult.hostname) {
                        hostnameChanged = true;
                        showNotification(`Hostname updated to ${hostResult.hostname}.local`, "success", 5000);
                    }
                }

                if (wasActive === "active") {
                    await fetch("/service/restart");
                    showNotification("Settings saved – Billy restarted", "success");
                } else {
                    showNotification("Settings saved", "success");
                }

                if (portChanged || hostnameChanged) {
                    const targetHost = hostnameChanged ? `${newHostname}.local` : window.location.hostname;
                    const targetPort = portChanged ? newPort : (window.location.port || 80);

                    showNotification(`Redirecting to http://${targetHost}:${targetPort}/...`, "warning", 5000);
                    setTimeout(() => {
                        window.location.href = `http://${targetHost}:${targetPort}/`;
                    }, 3000);
                } else {
                    btn.disabled = false;
                    btn.innerHTML = originalHTML;
                }
            } catch (err) {
                console.error("Save settings failed", err);
                showNotification("Failed to save settings: " + err, "error");
                btn.disabled = false;
                btn.innerHTML = originalHTML;
            }
        });
    };

    // Set hostname field from server
    fetch('/hostname')
        .then(res => res.json())
        .then(data => {
            if (data.hostname) {
                const input = document.getElementById('hostname');
                input.value = data.hostname;
                input.setAttribute('data-original', data.hostname);
            }
        });

    // Set original port attribute for change detection
    const flaskPortInput = document.getElementById("FLASK_PORT");
    if (flaskPortInput) {
        flaskPortInput.setAttribute("data-original", flaskPortInput.value);
    }

    return {handleSettingsSave};
})();

