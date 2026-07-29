// ===================== PERSONA FORM =====================

const PersonaForm = (() => {
    const updateBackstoryEmptyState = () => {
        const container = document.getElementById("backstory-fields");
        const hasFields = container.querySelectorAll("[data-backstory-field]").length > 0;
        let msg = container.querySelector(".backstory-empty-msg");

        if (!hasFields) {
            if (!msg) {
                msg = document.createElement("div");
                msg.className = "backstory-empty-msg text-sm text-zinc-400 italic py-2";
                msg.textContent = "No backstory items yet. Add keys like 'origin', 'hobby', or 'secret' to give Billy more personality.";
                container.appendChild(msg);
            }
        } else {
            if (msg) msg.remove();
        }
    };

    const addBackstoryField = (key = "", value = "") => {
        const wrapper = document.createElement("div");
        wrapper.className = "flex items-center space-x-2";
        wrapper.setAttribute("data-backstory-field", "");

        const keyInput = Object.assign(document.createElement("input"), {
            type: "text",
            value: key,
            placeholder: "Key",
            className: "w-1/3 p-1 bg-zinc-800 text-white rounded"
        });
        keyInput.setAttribute("aria-label", "Backstory Key");

        const valInput = Object.assign(document.createElement("input"), {
            type: "text",
            value: value,
            placeholder: "Value",
            className: "flex-1 p-1 bg-zinc-800 text-white rounded"
        });
        valInput.setAttribute("aria-label", "Backstory Value");

        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.className = "text-rose-500 hover:text-rose-400 cursor-pointer";
        removeBtn.setAttribute("aria-label", "Remove backstory item");
        const icon = document.createElement("span");
        icon.className = "material-icons align-middle";
        icon.setAttribute("aria-hidden", "true");
        icon.textContent = "remove_circle_outline";
        removeBtn.appendChild(icon);
        removeBtn.onclick = () => {
            wrapper.remove();
            updateBackstoryEmptyState();
        };

        wrapper.append(keyInput, valInput, removeBtn);
        document.getElementById("backstory-fields").appendChild(wrapper);
        updateBackstoryEmptyState();
    };

    const renderPersonalitySliders = (personality) => {
        const container = document.getElementById("personality-sliders");
        container.innerHTML = "";

        for (const [key, value] of Object.entries(personality)) {
            const wrapper = document.createElement("div");
            wrapper.className = "flex gap-2 items-center mb-2";

            // Label column
            const label = document.createElement("label");
            label.className = "w-36 text-sm text-slate-300 font-semibold cursor-pointer";
            label.textContent = key;
            label.htmlFor = `slider-${key}`;

            // Slider container
            const sliderWrapper = document.createElement("div");
            sliderWrapper.className = "relative w-full h-4 flex items-center";

            // Native input (hidden visually but accessible)
            const input = document.createElement("input");
            input.type = "range";
            input.id = `slider-${key}`;
            input.min = "0";
            input.max = "100";
            input.value = value;
            input.className = "sr-only peer";
            input.setAttribute("aria-label", key);

            // Visual track
            const track = document.createElement("div");
            track.className = "relative w-full h-4 rounded-full bg-zinc-700 overflow-hidden cursor-pointer peer-focus:ring-2 peer-focus:ring-emerald-500 peer-focus:outline-none";

            // Fill bar
            const fillBar = document.createElement("div");
            fillBar.className = "absolute left-0 top-0 h-full bg-emerald-500 transition-all duration-100";
            fillBar.style.width = `${value}%`;

            track.appendChild(fillBar);
            sliderWrapper.appendChild(input);
            sliderWrapper.appendChild(track);

            // Output value
            const valueLabel = document.createElement("span");
            valueLabel.id = `${key}-value`;
            valueLabel.className = "text-zinc-400 w-8 text-right font-mono text-sm";
            valueLabel.textContent = value;

            // Interaction logic
            const updateUI = (val) => {
                fillBar.style.width = `${val}%`;
                valueLabel.textContent = val;
            };

            // Input change updates UI
            input.addEventListener("input", () => updateUI(input.value));

            // Mouse interaction on track updates input
            let isDragging = false;
            const updateFromMouse = (e) => {
                const rect = track.getBoundingClientRect();
                const percent = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
                const val = Math.round(percent * 100);
                input.value = val;
                updateUI(val);
            };

            track.addEventListener("mousedown", (e) => {
                isDragging = true;
                updateFromMouse(e);
            });

            document.addEventListener("mousemove", (e) => {
                if (isDragging) updateFromMouse(e);
            });

            document.addEventListener("mouseup", () => {
                isDragging = false;
            });

            wrapper.appendChild(label);
            wrapper.appendChild(sliderWrapper);
            wrapper.appendChild(valueLabel);

            container.appendChild(wrapper);
        }
    };

    function setupSlider(barId, fillId, inputId, min, max) {
        const bar = document.getElementById(barId);
        const fill = document.getElementById(fillId);
        const input = document.getElementById(inputId);

        let isDragging = false;

        const updateUI = (val) => {
            const percent = ((val - min) / (max - min)) * 100;
            fill.style.width = `${percent}%`;
            fill.dataset.value = val;
        };

        const updateFromMouse = (e) => {
            const rect = bar.getBoundingClientRect();
            const percent = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
            const val = Math.round(min + percent * (max - min));
            input.value = val;
            input.dispatchEvent(new Event("input", {bubbles: true}));
            updateUI(val);
        };

        // Allow dragging
        bar.addEventListener("mousedown", (e) => {
            e.preventDefault(); // Prevent focus loss on click
            isDragging = true;
            input.focus();
            updateFromMouse(e);
        });

        document.addEventListener("mousemove", (e) => {
            if (isDragging) updateFromMouse(e);
        });

        document.addEventListener("mouseup", () => {
            isDragging = false;
        });

        // Sync with input on load/change (just in case)
        input.addEventListener("input", () => updateUI(Number(input.value)));
        updateUI(Number(input.value));
    }

    setupSlider("mic-gain-bar", "mic-gain-fill", "mic-gain", 0, 16);
    setupSlider("speaker-volume-bar", "speaker-volume-fill",  "speaker-volume", 0, 100);

    const renderBackstoryFields = (backstory) => {
        const container = document.getElementById("backstory-fields");
        container.innerHTML = "";
        Object.entries(backstory).forEach(([k, v]) => addBackstoryField(k, v));
        updateBackstoryEmptyState();
    };

    const loadPersona = async () => {
        const res = await fetch("/persona");
        const data = await res.json();
        renderPersonalitySliders(data.PERSONALITY);
        renderBackstoryFields(data.BACKSTORY);
        document.getElementById("meta-text").value = data.META || "";

        await loadWakeupClips();
    };

    const handlePersonaSave = () => {
        document.getElementById("persona-form").addEventListener("submit", async (e) => {
            e.preventDefault();

            const btn = document.getElementById("save-persona-btn");
            const originalHTML = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = `<span class="material-icons animate-spin">sync</span> Saving...`;

            try {
                const res = await fetch("/service/status");
                const {status: wasActive} = await res.json();

                const personality = {};
                document.querySelectorAll("#personality-sliders input[type='range']").forEach((input) => {
                    const trait = input.id.replace('slider-', '');
                    personality[trait] = parseInt(input.value);
                });

                const backstory = {};
                document.querySelectorAll("#backstory-fields [data-backstory-field]").forEach((row) => {
                    const [keyInput, valInput] = row.querySelectorAll("input");
                    if (keyInput.value.trim() !== "") {
                        backstory[keyInput.value.trim()] = valInput.value.trim();
                    }
                });

                const meta = document.getElementById("meta-text").value.trim();

                const wakeup = {};
                const rows = document.querySelectorAll("#wakeup-sound-list .flex[data-index]");
                let currentIndex = 1;
                rows.forEach((row) => {
                    const phrase = row.querySelector("input[type='text']")?.value?.trim();
                    if (phrase) {
                        wakeup[currentIndex++] = phrase;
                    }
                });

                await fetch("/persona", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({PERSONALITY: personality, BACKSTORY: backstory, META: meta, WAKEUP: wakeup })
                });

                showNotification("Persona saved", "success");

                if (wasActive === "active") {
                    await fetch("/service/restart");
                    showNotification("Persona saved – service restarted", "success");
                    ServiceStatus.fetchStatus();
                }
                btn.disabled = false;
                btn.innerHTML = originalHTML;
            } catch (err) {
                console.error("Failed to save persona:", err);
                showNotification("Failed to save persona", "error");
                btn.disabled = false;
                btn.innerHTML = originalHTML;
            }
        });
    };

    return {addBackstoryField, loadPersona, handlePersonaSave};
})();


