import { useState } from "react";
import { useLang } from "../context/LanguageContext";
import { SOUND_OPTIONS, getSavedSound, saveSound, previewSound, type SoundId } from "../data/alertSounds";

export default function SoundSettings() {
  const { t } = useLang();
  const [selected, setSelected] = useState<SoundId>(getSavedSound);

  const handleChange = (id: SoundId) => {
    setSelected(id);
    saveSound(id);
  };

  return (
    <div className="sound-settings">
      <h3>{t.soundSettingTitle}</h3>
      <p className="sound-settings-desc">{t.soundSettingDesc}</p>
      <div className="sound-options">
        {SOUND_OPTIONS.map((opt) => (
          <div key={opt.id} className={`sound-option ${selected === opt.id ? "sound-option-active" : ""}`}>
            <label>
              <input
                type="radio"
                name="alert-sound"
                checked={selected === opt.id}
                onChange={() => handleChange(opt.id)}
              />
              <span>{t[opt.labelKey as keyof typeof t] as string}</span>
            </label>
            <button
              className="sound-preview-btn"
              onClick={() => previewSound(opt.id)}
              title={t.soundPreview}
            >
              {t.soundPreview}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
