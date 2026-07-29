// ===================== IMPORT / EXPORT =====================

function exportSettings() {
    fetch('/get-env').then(res => res.text()).then(text => {
        const blob = new Blob([text], {type: "application/octet-stream"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "billy.env";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}

function importSettings(input) {
    const file = input.files[0];
    if (!file) return;
    if (!file.name.endsWith('.env')) {
        showNotification("Only .env files are allowed.", "error");
        return;
    }

    const label = input.closest('label');
    const span = label.querySelector('span:nth-of-type(2)');
    const originalText = span.textContent;
    span.textContent = "Importing...";
    label.classList.add('opacity-50', 'pointer-events-none');

    const reader = new FileReader();
    reader.onload = function (e) {
        fetch('/save-env', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({content: e.target.result})
        })
            .then(res => res.json())
            .then(data => {
                if (data.status === "ok") {
                    showNotification("Settings imported. Restarting...", "success");
                    setTimeout(() => location.reload(), 2000);
                } else {
                    showNotification(data.error || "Failed to import settings.", "error");
                    span.textContent = originalText;
                    label.classList.remove('opacity-50', 'pointer-events-none');
                }
            })
            .catch(err => {
                showNotification("Import failed: " + err, "error");
                span.textContent = originalText;
                label.classList.remove('opacity-50', 'pointer-events-none');
            });
    };
    reader.readAsText(file);
}

function exportPersona() {
    const a = document.createElement('a');
    a.href = '/persona/export';
    a.download = 'persona.ini';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function importPersona(input) {
    const file = input.files[0];
    if (!file) return;
    if (!file.name.endsWith('.ini')) {
        showNotification("Only .ini files are allowed.", "error");
        return;
    }
    const formData = new FormData();
    formData.append('file', file);
    fetch('/persona/import', {
        method: 'POST',
        body: formData
    })
        .then(res => res.json())
        .then(data => {
            if (data.status === "ok") {
                showNotification("Persona imported. Restarting...", "success");
                setTimeout(() => location.reload(), 2000);
            } else {
                showNotification(data.error || "Failed to import persona.", "error");
            }
        });
}

