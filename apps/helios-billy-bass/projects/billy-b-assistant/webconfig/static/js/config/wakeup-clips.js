// ===================== WAKEUP CLIPS =====================

async function loadWakeupClips() {
    const container = document.getElementById("wakeup-sound-list");
    container.innerHTML = ""; // clear previous rows

    try {
        const res = await fetch("/wakeup");
        const { clips } = await res.json();

        if (clips.length === 0) {
            const message = document.createElement("div");
            message.className = "text-sm text-zinc-400 italic py-2";
            message.textContent = "No custom wake-up clips added. Using the default sounds.";
            container.appendChild(message);
            return;
        }
        else {
            const label = document.createElement("label");
            label.className = "flex items-center justify-between font-semibold text-sm text-slate-300 mb-1"
            label.innerHtml = `Words or phrases that Billy will randomly say on activation:`;
            container.appendChild(label);
        }

        clips.sort((a, b) => a.index - b.index).forEach(({ index, phrase, has_audio }) => {
            const row = createWakeupRow(index, phrase, has_audio);
            container.appendChild(row);
        });
    } catch (err) {
        console.error("Failed to load wakeup clips:", err);
        showNotification("Failed to load wakeup clips", "error");
    }
}

function createWakeupRow(index, phrase = "", hasAudio = false) {
    const row = document.createElement("div");
    row.className = "flex items-center space-x-2";
    row.dataset.index = index;

    const input = document.createElement("input");
    input.type = "text";
    input.className = "text-input w-full rounded bg-zinc-800 border border-zinc-700 px-2 py-1";
    input.value = phrase;
    input.setAttribute("aria-label", "Wake-up phrase");
    if (!phrase) input.placeholder = "word or phrase";
    row.appendChild(input);

    const createBtn = (cls, title, iconName, hidden = false) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `${cls} ${hidden ? 'invisible' : ''}`;
        btn.title = title;
        btn.setAttribute("aria-label", title);

        const icon = document.createElement("i");
        icon.className = "material-icons align-middle";
        icon.setAttribute("aria-hidden", "true");
        icon.textContent = iconName;
        btn.appendChild(icon);

        return btn;
    };

    row.appendChild(createBtn("wakeup-generate-btn text-white hover:text-amber-400", "Generate .wav", "auto_fix_high"));
    row.appendChild(createBtn("wakeup-play-btn text-white hover:text-emerald-400", "Play .wav", "play_arrow", !hasAudio));
    row.appendChild(createBtn("remove-wakeup-row text-rose-500 hover:text-rose-400", "Remove", "remove_circle_outline"));

    return row;
}

function addWakeupSound(index = null, phrase = "", hasAudio = false) {
    const container = document.getElementById("wakeup-sound-list");
    const rows = container.querySelectorAll("div[data-index]");
    const usedIndices = Array.from(rows).map(row => parseInt(row.dataset.index));
    const nextIndex = index ?? (usedIndices.length > 0 ? Math.max(...usedIndices) + 1 : 1);

    const row = createWakeupRow(nextIndex, phrase, hasAudio);
    container.appendChild(row);
}

document.getElementById("wakeup-sound-list").addEventListener("click", async (e) => {
    const row = e.target.closest(".flex");
    if (!row) return;

    const clipIndex = row.dataset.index;
    const input = row.querySelector("input[type='text']");
    const phrase = input?.value?.trim();

    // === Play button ===
    if (e.target.closest(".wakeup-play-btn")) {
        const clipIndex = e.target.closest("div[data-index]")?.dataset.index;
        if (!clipIndex) return;

        const tryPlay = async () => {
            const res = await fetch("/wakeup/play", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ index: parseInt(clipIndex) }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to play audio");

            showNotification(data.status, "success");
        };

        try {
            await tryPlay();
        } catch (err) {
            console.warn("Initial play failed, trying to stop service and retry:", err.message);
            try {
                await fetch("/service/stop");
                await ServiceStatus.fetchStatus();
                await tryPlay(); // retry after stopping
                showNotification("Billy was active. Stopped and retried clip.", "warning");
            } catch (retryErr) {
                console.error("Retry failed:", retryErr);
                showNotification("Play failed after retry: " + retryErr.message, "error");
            }
        }

        return;
    }

    // === Generate button ===
    if (e.target.closest(".wakeup-generate-btn")) {
        const generateBtn = e.target.closest("button");
        generateBtn.disabled = true;
        generateBtn.classList.add("opacity-50");
        generateBtn.querySelector("i").textContent = "hourglass_empty";

        if (!phrase) {
            showNotification("Please enter a phrase", "warning");
            return;
        }

        try {
            const res = await fetch("/wakeup/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: phrase, index: parseInt(clipIndex) }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to generate audio");
            }

            const resPersona = await fetch("/persona/wakeup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ index: clipIndex, phrase: phrase }),
            });

            if (!resPersona.ok) {
                const err = await resPersona.json();
                throw new Error(err.error || "Failed to update persona");
            }

            showNotification(`Clip ${clipIndex} generated and saved!`, "success");

            await loadWakeupClips();

        } catch (err) {
            console.error("Generate error:", err);
            showNotification("Generate failed: " + err.message, "error");
        } finally {
            generateBtn.disabled = false;
            generateBtn.classList.remove("opacity-50");
            generateBtn.querySelector("i").textContent = "auto_fix_high";
        }
        return;
    }

    if (e.target.closest(".remove-wakeup-row")) {
        const row = e.target.closest("div[data-index]");
        const clipIndex = row?.dataset.index;

        if (!clipIndex) return;

        if (!confirm("Are you sure you want to delete this wake-up clip?")) return;

        try {
            const res = await fetch("/wakeup/remove", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ index: parseInt(clipIndex) }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to remove clip");

            showNotification(`Clip ${clipIndex} removed`, "success");

            await loadWakeupClips();
        } catch (err) {
            console.error("Remove error:", err);
            showNotification("Remove failed: " + err.message, "error");
        }
    }
});

