// ===================== INITIALIZE =====================

document.addEventListener("DOMContentLoaded", () => {
    LogPanel.bindUI();
    LogPanel.fetchLogs();
    ServiceStatus.fetchStatus();
    setInterval(LogPanel.fetchLogs, 5000);
    setInterval(ServiceStatus.fetchStatus, 10000);
    AudioPanel.updateDeviceLabels();
    PersonaForm.loadPersona();
    AudioPanel.loadMicGain();
    SettingsForm.handleSettingsSave();
    PersonaForm.handlePersonaSave();
    window.addBackstoryField = PersonaForm.addBackstoryField;
    MotorPanel.bindUI();
    Sections.collapsible();
});
