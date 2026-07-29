// ===================== VERSION & UPDATE =====================

(() => {
    fetch("/version")
        .then(res => res.json())
        .then(data => {
            document.getElementById("current-version").textContent = `${data.current}`;
            if (data.update_available) {
                const latestSpan = document.getElementById("latest-version");
                const updateBtn = document.getElementById("update-btn");
                latestSpan.textContent = `Update to: ${data.latest}`;
                latestSpan.classList.remove("hidden");
                updateBtn.classList.add('flex');
                updateBtn.classList.remove("hidden");
            }
        })
        .catch(err => {
            console.error("Failed to load version info", err);
        });

    document.getElementById("update-btn").addEventListener("click", () => {
        if (!confirm("Are you sure you want to update Billy to the latest version?")) return;
        showNotification("Update started");
        fetch("/update", {method: "POST"})
            .then(res => res.json())
            .then(data => {
                if (data.message) {
                    showNotification(data.message);
                }
                let attempts = 0, maxAttempts = 24;
                const checkForUpdate = async () => {
                    try {
                        const res = await fetch("/version");
                        const data = await res.json();
                        if (data.update_available === false) {
                            showNotification("Update complete. Reloading...", "info");
                            setTimeout(() => location.reload(), 1500);
                            return;
                        }
                    } catch (err) {
                        console.error("Version check failed:", err);
                    }
                    attempts++;
                    if (attempts < maxAttempts) {
                        setTimeout(checkForUpdate, 5000);
                    } else {
                        showNotification("Update timed out after 2 minutes. Reloading");
                        setTimeout(() => location.reload(), 1500);
                    }
                };
                setTimeout(checkForUpdate, 5000);
            })
            .catch(err => {
                console.error("Failed to update:", err);
                showNotification("Failed to update", "error");
            });
    });
})();

